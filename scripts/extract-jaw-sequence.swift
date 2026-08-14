#!/usr/bin/env -S xcrun swift

import AVFoundation
import CoreImage
import CoreMedia
import CoreVideo
import Foundation
import ImageIO
import UniformTypeIdentifiers

enum ExtractionError: Error, CustomStringConvertible {
  case usage
  case invalidInput(String)
  case operation(String)

  var description: String {
    switch self {
    case .usage:
      return "Usage: xcrun swift scripts/extract-jaw-sequence.swift <master.mp4> <output-directory>"
    case .invalidInput(let message), .operation(let message):
      return message
    }
  }
}

struct Profile {
  let name: String
  let frameCount: Int
}

let profiles = [
  Profile(name: "desktop", frameCount: 72),
  Profile(name: "mobile", frameCount: 60),
]

func fail(_ error: Error) -> Never {
  FileHandle.standardError.write(Data("\(error)\n".utf8))
  exit(1)
}

func makeReader(asset: AVAsset, track: AVAssetTrack) throws -> (AVAssetReader, AVAssetReaderTrackOutput) {
  let reader = try AVAssetReader(asset: asset)
  let output = AVAssetReaderTrackOutput(
    track: track,
    outputSettings: [
      kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    ]
  )
  output.alwaysCopiesSampleData = false
  guard reader.canAdd(output) else {
    throw ExtractionError.operation("Cannot attach video reader output")
  }
  reader.add(output)
  guard reader.startReading() else {
    throw ExtractionError.operation("Could not start video reader: \(reader.error?.localizedDescription ?? "unknown error")")
  }
  return (reader, output)
}

func writePNG(_ buffer: CVPixelBuffer, to outputURL: URL, context: CIContext) throws {
  let width = CVPixelBufferGetWidth(buffer)
  let height = CVPixelBufferGetHeight(buffer)
  let image = CIImage(cvImageBuffer: buffer)
  guard let cgImage = context.createCGImage(
    image,
    from: CGRect(x: 0, y: 0, width: width, height: height)
  ) else {
    throw ExtractionError.operation("Could not create CGImage for \(outputURL.lastPathComponent)")
  }
  guard let destination = CGImageDestinationCreateWithURL(
    outputURL as CFURL,
    UTType.png.identifier as CFString,
    1,
    nil
  ) else {
    throw ExtractionError.operation("Could not create PNG destination \(outputURL.path)")
  }
  CGImageDestinationAddImage(destination, cgImage, nil)
  guard CGImageDestinationFinalize(destination) else {
    throw ExtractionError.operation("Could not finalize PNG \(outputURL.path)")
  }
}

func extractJawFrames() async throws {
  guard CommandLine.arguments.count == 3 else { throw ExtractionError.usage }

  let inputURL = URL(fileURLWithPath: CommandLine.arguments[1]).standardizedFileURL
  let outputRoot = URL(fileURLWithPath: CommandLine.arguments[2]).standardizedFileURL
  guard FileManager.default.fileExists(atPath: inputURL.path) else {
    throw ExtractionError.invalidInput("Input does not exist: \(inputURL.path)")
  }

  let asset = AVURLAsset(url: inputURL)
  guard let track = try await asset.loadTracks(withMediaType: .video).first else {
    throw ExtractionError.invalidInput("Input has no video track")
  }
  let size = try await track.load(.naturalSize)
  guard size == CGSize(width: 1920, height: 1080) else {
    throw ExtractionError.invalidInput("Expected 1920x1080 input, got \(size)")
  }

  let (countReader, countOutput) = try makeReader(asset: asset, track: track)
  var sourceFrameCount = 0
  while countOutput.copyNextSampleBuffer() != nil {
    sourceFrameCount += 1
  }
  guard countReader.status == .completed else {
    throw ExtractionError.operation("Frame-count reader failed: \(countReader.error?.localizedDescription ?? "unknown error")")
  }
  guard sourceFrameCount > 1 else {
    throw ExtractionError.invalidInput("Input must contain at least two video frames")
  }

  var destinationsBySourceIndex: [Int: [URL]] = [:]
  for profile in profiles {
    let profileDirectory = outputRoot.appendingPathComponent(profile.name, isDirectory: true)
    try FileManager.default.createDirectory(at: profileDirectory, withIntermediateDirectories: true)
    for targetIndex in 0..<profile.frameCount {
      let ratio = Double(targetIndex) / Double(profile.frameCount - 1)
      let sourceIndex = Int((ratio * Double(sourceFrameCount - 1)).rounded())
      let outputURL = profileDirectory.appendingPathComponent(
        String(format: "frame-%03d.png", targetIndex + 1)
      )
      destinationsBySourceIndex[sourceIndex, default: []].append(outputURL)
    }
  }

  let context = CIContext(options: [.cacheIntermediates: false])
  let (renderReader, renderOutput) = try makeReader(asset: asset, track: track)
  var sourceIndex = 0
  var outputCount = 0
  while let sample = renderOutput.copyNextSampleBuffer() {
    if let destinations = destinationsBySourceIndex[sourceIndex] {
      guard let buffer = CMSampleBufferGetImageBuffer(sample) else {
        throw ExtractionError.operation("Source frame \(sourceIndex) has no pixel buffer")
      }
      for destination in destinations {
        try writePNG(buffer, to: destination, context: context)
        outputCount += 1
      }
    }
    sourceIndex += 1
  }
  guard renderReader.status == .completed else {
    throw ExtractionError.operation("Frame renderer failed: \(renderReader.error?.localizedDescription ?? "unknown error")")
  }

  let expectedOutputCount = profiles.reduce(0) { $0 + $1.frameCount }
  guard outputCount == expectedOutputCount else {
    throw ExtractionError.operation("Expected \(expectedOutputCount) output frames, wrote \(outputCount)")
  }

  print("extractor=AVFoundation")
  print("source_frames=\(sourceFrameCount)")
  for profile in profiles {
    print("\(profile.name)_frames=\(profile.frameCount)")
  }
}

Task {
  do {
    try await extractJawFrames()
    exit(0)
  } catch {
    fail(error)
  }
}
dispatchMain()
