"""Build deterministic realtime jaw assets from the licensed Blender source."""

from __future__ import annotations

import json
import math
import struct
import sys
import traceback
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


SOURCE_PAIRS = (
    ("Cube.001", "Cube.002"),
    ("Cube.003", "Cube.004"),
)
FDI_UPPER_RIGHT = (18, 17, 16, 15, 14, 13, 12, 11)
FDI_UPPER_LEFT = (21, 22, 23, 24, 25, 26, 27, 28)
FDI_LOWER_LEFT = (38, 37, 36, 35, 34, 33, 32, 31)
FDI_LOWER_RIGHT = (41, 42, 43, 44, 45, 46, 47, 48)
ATTRIBUTION = {
    "title": "Free Teeth Base Mesh",
    "author": "ferrumiron6",
    "source": "https://sketchfab.com/3d-models/free-teeth-base-mesh-b66fde0dc3eb44b0908096aa51b96431",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "modified": True,
}

REQUIRED_ANCHORS = (
    "anchor.front",
    "anchor.premolar.left",
    "anchor.premolar.right",
    "anchor.molar.left",
    "anchor.molar.right",
    "anchor.gum.upper",
    "anchor.gum.lower",
)
REQUIRED_HIT_PROXIES = (
    "hit.front",
    "hit.premolar.left",
    "hit.premolar.right",
    "hit.molar.left",
    "hit.molar.right",
    "hit.gum.upper",
    "hit.gum.lower",
)

REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = REPO_ROOT / "public" / "media" / "jaw"
DESKTOP_RAW = OUTPUT_DIR / "jaw-desktop.raw.glb"
MOBILE_RAW = OUTPUT_DIR / "jaw-mobile.raw.glb"
POSTER_PATH = OUTPUT_DIR / "jaw-poster.webp"
FALLBACK_PATH = OUTPUT_DIR / "jaw-fallback.webp"


def select_only(objects: list[bpy.types.Object]) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.hide_set(False)
        obj.hide_viewport = False
        obj.select_set(True)
    if objects:
        bpy.context.view_layer.objects.active = objects[0]


def remove_unapproved_objects() -> None:
    keep_names = {name for pair in SOURCE_PAIRS for name in pair}
    for obj in list(bpy.data.objects):
        if obj.name not in keep_names:
            bpy.data.objects.remove(obj, do_unlink=True)
    missing = keep_names.difference(bpy.data.objects.keys())
    assert not missing, f"Canonical source objects missing: {sorted(missing)}"


def apply_source_modifiers(obj: bpy.types.Object) -> None:
    select_only([obj])
    bpy.context.view_layer.objects.active = obj
    result = bpy.ops.object.convert(target="MESH")
    assert result == {"FINISHED"}, f"Could not evaluate {obj.name}: {result}"


def separate_loose_parts(obj: bpy.types.Object) -> list[bpy.types.Object]:
    select_only([obj])
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    result = bpy.ops.mesh.separate(type="LOOSE")
    assert result == {"FINISHED"}, f"Could not separate {obj.name}: {result}"
    bpy.ops.object.mode_set(mode="OBJECT")
    parts = [part for part in bpy.context.selected_objects if part.type == "MESH"]
    assert len(parts) == 16, f"Expected 16 loose teeth in {obj.name}, found {len(parts)}"
    return parts


def object_world_bounds(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    points = [obj.matrix_world @ vertex.co for vertex in obj.data.vertices]
    lower = Vector(tuple(min(point[axis] for point in points) for axis in range(3)))
    upper = Vector(tuple(max(point[axis] for point in points) for axis in range(3)))
    return lower, upper


def object_world_center(obj: bpy.types.Object) -> Vector:
    lower, upper = object_world_bounds(obj)
    return (lower + upper) * 0.5


def assign_fdi_names(parts: list[bpy.types.Object], jaw: str) -> list[bpy.types.Object]:
    ordered_parts = sorted(parts, key=lambda part: object_world_center(part).x)
    if jaw == "upper":
        ordered_fdi = FDI_UPPER_RIGHT + FDI_UPPER_LEFT
    else:
        # Negative X is the patient's right (viewer left). Keep the lower FDI
        # constants in clinical side order, reversing each for rear-to-front.
        ordered_fdi = tuple(reversed(FDI_LOWER_RIGHT)) + tuple(reversed(FDI_LOWER_LEFT))

    for index, (part, fdi) in enumerate(zip(ordered_parts, ordered_fdi, strict=True)):
        part.name = f"__tooth_{jaw}_{index:02d}"
        part.data.name = f"mesh.tooth.{fdi}"
        part["fdi"] = fdi
        part["jaw"] = jaw
    for part, fdi in zip(ordered_parts, ordered_fdi, strict=True):
        part.name = f"tooth.{fdi}"
    return ordered_parts


def bake_world_transforms(objects: list[bpy.types.Object]) -> None:
    for obj in objects:
        obj.data.transform(obj.matrix_world)
        obj.matrix_world = Matrix.Identity(4)


def normalize_bite_to_origin(objects: list[bpy.types.Object]) -> None:
    points = [vertex.co for obj in objects for vertex in obj.data.vertices]
    lower = Vector(tuple(min(point[axis] for point in points) for axis in range(3)))
    upper = Vector(tuple(max(point[axis] for point in points) for axis in range(3)))
    bite_midpoint = (lower + upper) * 0.5
    for obj in objects:
        for vertex in obj.data.vertices:
            vertex.co -= bite_midpoint
        obj.data.update()


def set_origin_without_moving_geometry(obj: bpy.types.Object, pivot: Vector) -> None:
    local_pivot = obj.matrix_world.inverted() @ pivot
    for vertex in obj.data.vertices:
        vertex.co -= local_pivot
    obj.location = pivot
    obj.data.update()
    bpy.context.view_layer.update()


def move_origins_to_gingiva(teeth: list[bpy.types.Object]) -> None:
    for tooth in teeth:
        points = [tooth.matrix_world @ vertex.co for vertex in tooth.data.vertices]
        jaw = tooth["jaw"]
        vertical_values = [point.z for point in points]
        low_z, high_z = min(vertical_values), max(vertical_values)
        band = max((high_z - low_z) * 0.22, 1e-5)
        if jaw == "upper":
            gingival_points = [point for point in points if point.z >= high_z - band]
        else:
            gingival_points = [point for point in points if point.z <= low_z + band]
        pivot = sum(gingival_points, Vector()) / len(gingival_points)
        set_origin_without_moving_geometry(tooth, pivot)


def center_gum_origins(gums: list[bpy.types.Object]) -> None:
    for gum in gums:
        set_origin_without_moving_geometry(gum, object_world_center(gum))


def make_material(
    name: str,
    color: tuple[float, float, float, float],
    roughness: float,
    metallic: float = 0.0,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = color
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Alpha"].default_value = color[3]
    return material


def apply_material(obj: bpy.types.Object, material: bpy.types.Material) -> None:
    obj.data.materials.clear()
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True


def average_centers(objects: list[bpy.types.Object]) -> Vector:
    return sum((object_world_center(obj) for obj in objects), Vector()) / len(objects)


def bounds_for_objects(objects: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    bounds = [object_world_bounds(obj) for obj in objects]
    lower = Vector(tuple(min(bound[0][axis] for bound in bounds) for axis in range(3)))
    upper = Vector(tuple(max(bound[1][axis] for bound in bounds) for axis in range(3)))
    return lower, upper


def create_anchor(name: str, position: Vector) -> bpy.types.Object:
    anchor = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(anchor)
    anchor.empty_display_type = "PLAIN_AXES"
    anchor.empty_display_size = 0.025
    anchor.location = position
    anchor["semantic"] = name.removeprefix("anchor.")
    return anchor


def create_convex_box(
    name: str,
    target_objects: list[bpy.types.Object],
    material: bpy.types.Material,
) -> bpy.types.Object:
    lower, upper = bounds_for_objects(target_objects)
    padding = Vector((0.012, 0.012, 0.012))
    lower -= padding
    upper += padding
    x0, y0, z0 = lower
    x1, y1, z1 = upper
    vertices = [
        (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
        (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1),
    ]
    faces = [
        (0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
        (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7),
    ]
    mesh = bpy.data.meshes.new(f"mesh.{name}")
    mesh.from_pydata(vertices, [], faces)
    mesh.materials.append(material)
    proxy = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(proxy)
    proxy["hitProxy"] = True
    proxy["semantic"] = name.removeprefix("hit.")
    return proxy


def create_semantic_nodes(
    tooth_by_fdi: dict[int, bpy.types.Object],
    gum_upper: bpy.types.Object,
    gum_lower: bpy.types.Object,
    hit_material: bpy.types.Material,
) -> tuple[list[bpy.types.Object], list[bpy.types.Object]]:
    groups = {
        "front": [tooth_by_fdi[fdi] for fdi in (11, 12, 21, 22, 31, 32, 41, 42)],
        "premolar.left": [tooth_by_fdi[fdi] for fdi in (24, 25, 34, 35)],
        "premolar.right": [tooth_by_fdi[fdi] for fdi in (14, 15, 44, 45)],
        "molar.left": [tooth_by_fdi[fdi] for fdi in (26, 27, 28, 36, 37, 38)],
        "molar.right": [tooth_by_fdi[fdi] for fdi in (16, 17, 18, 46, 47, 48)],
        "gum.upper": [gum_upper],
        "gum.lower": [gum_lower],
    }
    anchors = [create_anchor(f"anchor.{name}", average_centers(objects)) for name, objects in groups.items()]
    proxies = [
        create_convex_box(f"hit.{name}", objects, hit_material)
        for name, objects in groups.items()
    ]
    return anchors, proxies


def triangle_count(objects: list[bpy.types.Object]) -> int:
    total = 0
    for obj in objects:
        if obj.type != "MESH":
            continue
        obj.data.calc_loop_triangles()
        total += len(obj.data.loop_triangles)
    return total


def look_at(obj: bpy.types.Object, target: Vector) -> None:
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def add_area_light(name: str, location: tuple[float, float, float], energy: float, size: float) -> None:
    data = bpy.data.lights.new(name, type="AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    light = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(light)
    light.location = location
    look_at(light, Vector((0.0, 0.0, 0.0)))


def configure_render() -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.image_settings.quality = 92
    scene.render.film_transparent = True
    scene.render.image_settings.color_management = "FOLLOW_SCENE"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = -0.75

    world = bpy.data.worlds.new("Jaw Preview World")
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.006, 0.009, 0.014, 1.0)
    background.inputs["Strength"].default_value = 0.18
    scene.world = world

    camera_data = bpy.data.cameras.new("Jaw Preview Camera")
    camera_data.lens = 62
    camera = bpy.data.objects.new("Jaw Preview Camera", camera_data)
    bpy.context.scene.collection.objects.link(camera)
    camera.location = (0.0, -1.52, 0.06)
    look_at(camera, Vector((0.0, 0.0, 0.015)))
    scene.camera = camera

    add_area_light("Jaw Key", (-0.62, -0.75, 0.92), 170, 0.55)
    add_area_light("Jaw Fill", (0.72, -0.30, 0.35), 85, 0.42)
    add_area_light("Jaw Rim", (0.05, 0.56, 0.72), 125, 0.36)


def render_preview(path: Path) -> None:
    bpy.context.scene.render.filepath = str(path)
    result = bpy.ops.render.render(write_still=True)
    assert result == {"FINISHED"}, f"Could not render {path}: {result}"


def separated_pose_offsets(teeth: list[bpy.types.Object], gums: list[bpy.types.Object]) -> dict[str, Vector]:
    original_locations = {obj.name: obj.location.copy() for obj in teeth + gums}
    for obj in teeth + gums:
        is_upper = obj.name == "gum.upper" or obj.get("jaw") == "upper"
        obj.location.z += 0.075 if is_upper else -0.075
        if obj.name.startswith("tooth."):
            fdi = int(obj.name.split(".")[1])
            quadrant, position = divmod(fdi, 10)
            side = -1.0 if quadrant in (1, 4) else 1.0
            if position >= 6:
                obj.location.x += side * 0.045
            elif position >= 4:
                obj.location.x += side * 0.022
    return original_locations


def restore_locations(objects: list[bpy.types.Object], locations: dict[str, Vector]) -> None:
    for obj in objects:
        obj.location = locations[obj.name]


def export_glb(path: Path, objects: list[bpy.types.Object]) -> None:
    select_only(objects)
    result = bpy.ops.export_scene.gltf(
        filepath=str(path),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_extras=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
    )
    assert result == {"FINISHED"}, f"Could not export {path}: {result}"
    inject_asset_attribution(path)


def inject_asset_attribution(path: Path) -> None:
    payload = path.read_bytes()
    magic, version, _ = struct.unpack_from("<4sII", payload, 0)
    assert magic == b"glTF" and version == 2, f"Unexpected GLB header in {path}"
    chunks: list[tuple[int, bytes]] = []
    offset = 12
    while offset < len(payload):
        length, chunk_type = struct.unpack_from("<II", payload, offset)
        offset += 8
        chunks.append((chunk_type, payload[offset : offset + length]))
        offset += length

    json_type = 0x4E4F534A
    assert chunks and chunks[0][0] == json_type, f"Missing JSON chunk in {path}"
    document = json.loads(chunks[0][1].rstrip(b" \x00"))
    document.setdefault("asset", {})["extras"] = ATTRIBUTION
    document["asset"]["copyright"] = "Free Teeth Base Mesh © ferrumiron6, CC BY 4.0"
    json_chunk = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    json_chunk += b" " * ((4 - len(json_chunk) % 4) % 4)
    chunks[0] = (json_type, json_chunk)

    body = b"".join(struct.pack("<II", len(chunk), chunk_type) + chunk for chunk_type, chunk in chunks)
    path.write_bytes(struct.pack("<4sII", b"glTF", 2, 12 + len(body)) + body)


def make_mobile_lod(semantic_meshes: list[bpy.types.Object]) -> None:
    for obj in semantic_meshes:
        obj.data = obj.data.copy()
        modifier = obj.modifiers.new("Mobile LOD", type="DECIMATE")
        modifier.decimate_type = "COLLAPSE"
        modifier.ratio = 0.59
        modifier.use_collapse_triangulate = True
        select_only([obj])
        bpy.context.view_layer.objects.active = obj
        result = bpy.ops.object.modifier_apply(modifier=modifier.name)
        assert result == {"FINISHED"}, f"Could not decimate {obj.name}: {result}"
        obj["lod"] = "mobile"


def validate_pre_export(
    teeth: list[bpy.types.Object],
    gum_upper: bpy.types.Object,
    gum_lower: bpy.types.Object,
) -> None:
    assert len([obj for obj in bpy.data.objects if obj.name.startswith("tooth.")]) == 32
    assert {"gum.upper", "gum.lower"}.issubset(bpy.data.objects.keys())
    assert all(name in bpy.data.objects for name in REQUIRED_ANCHORS + REQUIRED_HIT_PROXIES)
    assert len(teeth) == 32 and gum_upper.type == "MESH" and gum_lower.type == "MESH"

    centers = {int(obj.name.split(".")[1]): object_world_center(obj) for obj in teeth}
    assert centers[18].x < centers[11].x < centers[21].x < centers[28].x
    lower_arch_x = tuple((fdi, round(centers[fdi].x, 6)) for fdi in (48, 41, 31, 38))
    assert centers[48].x < centers[41].x < centers[31].x < centers[38].x, lower_arch_x
    assert all(math.isfinite(value) for center in centers.values() for value in center)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    remove_unapproved_objects()

    gum_upper = bpy.data.objects[SOURCE_PAIRS[0][0]]
    teeth_upper_source = bpy.data.objects[SOURCE_PAIRS[0][1]]
    gum_lower = bpy.data.objects[SOURCE_PAIRS[1][0]]
    teeth_lower_source = bpy.data.objects[SOURCE_PAIRS[1][1]]
    for obj in (gum_upper, teeth_upper_source, gum_lower, teeth_lower_source):
        apply_source_modifiers(obj)

    upper_teeth = assign_fdi_names(separate_loose_parts(teeth_upper_source), "upper")
    lower_teeth = assign_fdi_names(separate_loose_parts(teeth_lower_source), "lower")
    teeth = upper_teeth + lower_teeth
    gum_upper.name = "gum.upper"
    gum_upper.data.name = "mesh.gum.upper"
    gum_upper["jaw"] = "upper"
    gum_lower.name = "gum.lower"
    gum_lower.data.name = "mesh.gum.lower"
    gum_lower["jaw"] = "lower"
    gums = [gum_upper, gum_lower]

    semantic_meshes = teeth + gums
    bake_world_transforms(semantic_meshes)
    normalize_bite_to_origin(semantic_meshes)
    move_origins_to_gingiva(teeth)
    center_gum_origins(gums)

    ivory = make_material("Jaw Ivory", (0.62, 0.46, 0.27, 1.0), 0.30)
    pink = make_material("Jaw Gingiva", (0.24, 0.035, 0.045, 1.0), 0.43)
    invisible = make_material("Jaw Hit Proxy", (0.0, 0.0, 0.0, 0.0), 1.0)
    for tooth in teeth:
        apply_material(tooth, ivory)
    for gum in gums:
        apply_material(gum, pink)

    tooth_by_fdi = {int(tooth.name.split(".")[1]): tooth for tooth in teeth}
    anchors, proxies = create_semantic_nodes(tooth_by_fdi, gum_upper, gum_lower, invisible)
    validate_pre_export(teeth, gum_upper, gum_lower)

    configure_render()
    render_preview(POSTER_PATH)
    closed_locations = separated_pose_offsets(teeth, gums)
    render_preview(FALLBACK_PATH)
    restore_locations(teeth + gums, closed_locations)

    export_objects = teeth + gums + anchors + proxies
    desktop_triangles = triangle_count(export_objects)
    assert desktop_triangles <= 20_000, f"Desktop triangle budget exceeded: {desktop_triangles}"
    export_glb(DESKTOP_RAW, export_objects)

    make_mobile_lod(semantic_meshes)
    mobile_triangles = triangle_count(export_objects)
    assert 9_000 <= mobile_triangles <= 12_000, f"Mobile triangle budget missed: {mobile_triangles}"
    export_glb(MOBILE_RAW, export_objects)

    print(f"Desktop raw: {desktop_triangles} triangles -> {DESKTOP_RAW}")
    print(f"Mobile raw: {mobile_triangles} triangles -> {MOBILE_RAW}")
    print(f"Previews: {POSTER_PATH}, {FALLBACK_PATH}")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        traceback.print_exc()
        sys.exit(1)
