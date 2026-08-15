export type JawSequenceProfile = "desktop" | "mobile";

export type JawSequenceManifest = Readonly<{
  profile: JawSequenceProfile;
  width: number;
  height: number;
  frameCount: number;
  totalBytes: number;
  startFrame: number;
  endFrame: number;
  frames: readonly Readonly<{ index: number; url: string; bytes: number; sha256: string }>[];
}>;

export const jawSequenceManifests = {
  "desktop": {
    "profile": "desktop",
    "width": 1280,
    "height": 720,
    "frameCount": 72,
    "totalBytes": 1456028,
    "startFrame": 1,
    "endFrame": 72,
    "frames": [
      {
        "index": 1,
        "url": "/media/jaw-sequence/desktop/frame-001.webp",
        "bytes": 29880,
        "sha256": "dd88fc3487c2077d3d0ce5cce72f3a19d31973097cfe900e1bb959a5ab7cccd2"
      },
      {
        "index": 2,
        "url": "/media/jaw-sequence/desktop/frame-002.webp",
        "bytes": 18060,
        "sha256": "fbabcb588c2ff3d7befce95f3d9cc8166ba67b00282a928256907d7e1b45be43"
      },
      {
        "index": 3,
        "url": "/media/jaw-sequence/desktop/frame-003.webp",
        "bytes": 18002,
        "sha256": "f30a4568b402ecfc97fad3e520c4bff00585dc0193c7e6a183d0dc9b81a3ff70"
      },
      {
        "index": 4,
        "url": "/media/jaw-sequence/desktop/frame-004.webp",
        "bytes": 18152,
        "sha256": "60204fbc1518656965db35fd318a8eda7baf4d57b9bd8d16309c97238ced7703"
      },
      {
        "index": 5,
        "url": "/media/jaw-sequence/desktop/frame-005.webp",
        "bytes": 18190,
        "sha256": "1f08b7c66d0a7a31cd41a94f4b7fdecf76b79ebe7914fa731c259f94598858a1"
      },
      {
        "index": 6,
        "url": "/media/jaw-sequence/desktop/frame-006.webp",
        "bytes": 18168,
        "sha256": "04282060c0855db670608bb955d5fd20289bc4af24f652c0e5d81a2f61b7aa56"
      },
      {
        "index": 7,
        "url": "/media/jaw-sequence/desktop/frame-007.webp",
        "bytes": 18782,
        "sha256": "0206f6ca0cab354b6cf80dc7033b4420dfb2909a40e736e7e3ce868de31d7312"
      },
      {
        "index": 8,
        "url": "/media/jaw-sequence/desktop/frame-008.webp",
        "bytes": 18574,
        "sha256": "171b0560105b4f2ae1e21a54ab5fcd491712b32fcb0412ac30b5042b39e4ce8c"
      },
      {
        "index": 9,
        "url": "/media/jaw-sequence/desktop/frame-009.webp",
        "bytes": 18542,
        "sha256": "a2e73d4ece241cc329ee9c0d156ca7414a1d5e1e6cc97a7881326a45fdeb54b0"
      },
      {
        "index": 10,
        "url": "/media/jaw-sequence/desktop/frame-010.webp",
        "bytes": 18954,
        "sha256": "d321f8e863eec518a94b328fe1611dc0881b25f48a1e22d49a58b0394aa7cb2b"
      },
      {
        "index": 11,
        "url": "/media/jaw-sequence/desktop/frame-011.webp",
        "bytes": 18776,
        "sha256": "3bf57dfd754f8ef73ee0349388d5d89ad22374e12a13876c6797cc60d5d427ac"
      },
      {
        "index": 12,
        "url": "/media/jaw-sequence/desktop/frame-012.webp",
        "bytes": 18738,
        "sha256": "028b018a0a21ccf272dca340ad0ff03df144e8a7913912585275f741379cb4a6"
      },
      {
        "index": 13,
        "url": "/media/jaw-sequence/desktop/frame-013.webp",
        "bytes": 18928,
        "sha256": "849166c25281d6e1e759619bf9bf40c3269663d63f1b469009caa28dd89bc03f"
      },
      {
        "index": 14,
        "url": "/media/jaw-sequence/desktop/frame-014.webp",
        "bytes": 18946,
        "sha256": "9092c06091959f0746ee822995d5e2ac74f6b4641a9eb57d915d4b7910944104"
      },
      {
        "index": 15,
        "url": "/media/jaw-sequence/desktop/frame-015.webp",
        "bytes": 18648,
        "sha256": "5ef5d9a650a605f3155b7859b6eea2e57ccfc932fc5249dcae6f9dc121da7b2a"
      },
      {
        "index": 16,
        "url": "/media/jaw-sequence/desktop/frame-016.webp",
        "bytes": 18436,
        "sha256": "72d447139cdfdadf6307e124f3afe477406a7ed63de631876110f288c510d813"
      },
      {
        "index": 17,
        "url": "/media/jaw-sequence/desktop/frame-017.webp",
        "bytes": 18520,
        "sha256": "eb6eaed1e33a455e8b70e95563ad541a2038c078a14e36244a5c1deef5ace08d"
      },
      {
        "index": 18,
        "url": "/media/jaw-sequence/desktop/frame-018.webp",
        "bytes": 18612,
        "sha256": "1b339324cab552328258bb811135d47b50d0913614ece145d4497f8b8f65f6d8"
      },
      {
        "index": 19,
        "url": "/media/jaw-sequence/desktop/frame-019.webp",
        "bytes": 18710,
        "sha256": "03364b9fe170f2334713a916e0fa838120ca31127bfe74cf09e7f60c1a9ff69a"
      },
      {
        "index": 20,
        "url": "/media/jaw-sequence/desktop/frame-020.webp",
        "bytes": 18768,
        "sha256": "e9d29e175d965e53159d7f5ef9bc58cd583c9a574a339ab88dd6250e07bbeacb"
      },
      {
        "index": 21,
        "url": "/media/jaw-sequence/desktop/frame-021.webp",
        "bytes": 19130,
        "sha256": "343c6934616058eb5e6448d87d39f60b86acdb70810bdd1524f156aaaa402670"
      },
      {
        "index": 22,
        "url": "/media/jaw-sequence/desktop/frame-022.webp",
        "bytes": 18982,
        "sha256": "76a0bfafe6fa870158dfb74d3a069ada35f44d41ed4bf2e32105dd6c48c7375e"
      },
      {
        "index": 23,
        "url": "/media/jaw-sequence/desktop/frame-023.webp",
        "bytes": 18916,
        "sha256": "ef358b03bf6c1033cca715cce51bd9d49b6f8bd7ae1a74d7b5d9ce05a5749136"
      },
      {
        "index": 24,
        "url": "/media/jaw-sequence/desktop/frame-024.webp",
        "bytes": 19042,
        "sha256": "241c397060efb46b749dfee83339f08281b6c25f96ba5ce6820fa3c974a8c44a"
      },
      {
        "index": 25,
        "url": "/media/jaw-sequence/desktop/frame-025.webp",
        "bytes": 18928,
        "sha256": "aaa2703a4fd21526852c7b5f87407e872bcfb817cfe701850d26611fc0b335a1"
      },
      {
        "index": 26,
        "url": "/media/jaw-sequence/desktop/frame-026.webp",
        "bytes": 19098,
        "sha256": "da59944278ed4b0ade55d12ac8d6f52a998df111f2453a75843baca414a4ac0f"
      },
      {
        "index": 27,
        "url": "/media/jaw-sequence/desktop/frame-027.webp",
        "bytes": 19138,
        "sha256": "46db5203fe7095a6ac50287f37883844399093ad6f8109342d4fc9e752812416"
      },
      {
        "index": 28,
        "url": "/media/jaw-sequence/desktop/frame-028.webp",
        "bytes": 18926,
        "sha256": "978b4697d80fb9f3193be5e83ed7cc235424001306ecdcfc83c3fe5bbbb60613"
      },
      {
        "index": 29,
        "url": "/media/jaw-sequence/desktop/frame-029.webp",
        "bytes": 18974,
        "sha256": "5deecfc7c15aa49e9dfbb10d8fae521d16528560f48077fbea629aeef03362ae"
      },
      {
        "index": 30,
        "url": "/media/jaw-sequence/desktop/frame-030.webp",
        "bytes": 18996,
        "sha256": "c531aaf888d98c43ebb7914d66e419e0a592e30db873d70b905bfb01f1260a78"
      },
      {
        "index": 31,
        "url": "/media/jaw-sequence/desktop/frame-031.webp",
        "bytes": 19220,
        "sha256": "d567ae8abfd9635f87dfdb5a93cf8542a3633c87fe2bd85f9c09fb2d2ba8ef6a"
      },
      {
        "index": 32,
        "url": "/media/jaw-sequence/desktop/frame-032.webp",
        "bytes": 19458,
        "sha256": "53fc7c1787fa9225712ed5f3030d85eea60f46a483db4acd07be0209c561eacf"
      },
      {
        "index": 33,
        "url": "/media/jaw-sequence/desktop/frame-033.webp",
        "bytes": 19360,
        "sha256": "9b47ba8c88e0c25ee1627fd410b002e4eb9ba065956e7fbf3c4fec54a973b19c"
      },
      {
        "index": 34,
        "url": "/media/jaw-sequence/desktop/frame-034.webp",
        "bytes": 19624,
        "sha256": "12368700d92168f149ceb709e8a80ec34dc6f0c8ec5ce81a07c13d7b62d67253"
      },
      {
        "index": 35,
        "url": "/media/jaw-sequence/desktop/frame-035.webp",
        "bytes": 19548,
        "sha256": "ee9ce6a7012f3ddd4472fb178d34bcbfd42996d8a6eb0419531cfa2e4924cdca"
      },
      {
        "index": 36,
        "url": "/media/jaw-sequence/desktop/frame-036.webp",
        "bytes": 19514,
        "sha256": "f1205bc0ab882abcd8d44b4c1c486102a2fce84ff78f018922088e01996208e3"
      },
      {
        "index": 37,
        "url": "/media/jaw-sequence/desktop/frame-037.webp",
        "bytes": 19784,
        "sha256": "64e52d752b6b2468200fcaffa8241ff12b398a43eedae3b8e1bf52d58fd0b55d"
      },
      {
        "index": 38,
        "url": "/media/jaw-sequence/desktop/frame-038.webp",
        "bytes": 19908,
        "sha256": "5d897beeb9d4a376c338e92523d6112843fe4e32550d948ceefd91e7839ed272"
      },
      {
        "index": 39,
        "url": "/media/jaw-sequence/desktop/frame-039.webp",
        "bytes": 20008,
        "sha256": "bff79f3e9944d32f06053922f4388dd3028a2ccb64716d01a117bde6d193271e"
      },
      {
        "index": 40,
        "url": "/media/jaw-sequence/desktop/frame-040.webp",
        "bytes": 20494,
        "sha256": "e860d121f981a9883db8042200b98c71a70f0a1b2c5951cb121806fe26eb4142"
      },
      {
        "index": 41,
        "url": "/media/jaw-sequence/desktop/frame-041.webp",
        "bytes": 20254,
        "sha256": "d8ace40b0f5d7caf0fd27561af478d747bb667c990a4cbab187d255e284236ba"
      },
      {
        "index": 42,
        "url": "/media/jaw-sequence/desktop/frame-042.webp",
        "bytes": 20218,
        "sha256": "e2508b0398ed00fb2e6b6eb1bcb3f4d4e71c4adad33ecfe1e92811ea115cf0c1"
      },
      {
        "index": 43,
        "url": "/media/jaw-sequence/desktop/frame-043.webp",
        "bytes": 20130,
        "sha256": "50a010babf0f44114ec2d1b7de170c2e594a6e934facfad1656195ed97b58d4c"
      },
      {
        "index": 44,
        "url": "/media/jaw-sequence/desktop/frame-044.webp",
        "bytes": 20250,
        "sha256": "b216abbbb620bc0e1002f6a19de2be929475a0c331c60809f43cd4fcf0c1670c"
      },
      {
        "index": 45,
        "url": "/media/jaw-sequence/desktop/frame-045.webp",
        "bytes": 20360,
        "sha256": "1d38f4c5eb52c681582eeef2bc7e3662efab22924ea6a36b0e2776605fa18dc4"
      },
      {
        "index": 46,
        "url": "/media/jaw-sequence/desktop/frame-046.webp",
        "bytes": 20680,
        "sha256": "599b37c6d94242bf4f0425b0c9ac2f7b7e28f75ddb49597502eefeaf7de3f23b"
      },
      {
        "index": 47,
        "url": "/media/jaw-sequence/desktop/frame-047.webp",
        "bytes": 20496,
        "sha256": "e1490ce10286a7ac97881197ee96a177c31c363e4a3125c56a17566deaf2ce34"
      },
      {
        "index": 48,
        "url": "/media/jaw-sequence/desktop/frame-048.webp",
        "bytes": 20512,
        "sha256": "1c4785451417eab68e7f79ff8ed91fdbfc162d446fd7b374ed4eb9a12dcdbd8f"
      },
      {
        "index": 49,
        "url": "/media/jaw-sequence/desktop/frame-049.webp",
        "bytes": 20616,
        "sha256": "edbbf17bec70b576cea5f1745bd17be21b33e21e38b96066f176640e321a511a"
      },
      {
        "index": 50,
        "url": "/media/jaw-sequence/desktop/frame-050.webp",
        "bytes": 20646,
        "sha256": "da816123fa7a22bcdb1bbdc8fbe45f00026a4b725c38140856f8f2310b6599c4"
      },
      {
        "index": 51,
        "url": "/media/jaw-sequence/desktop/frame-051.webp",
        "bytes": 20756,
        "sha256": "2bc5cadf5befb63b225476d01043b50d6f132c4d1fa3489c37156832510866cf"
      },
      {
        "index": 52,
        "url": "/media/jaw-sequence/desktop/frame-052.webp",
        "bytes": 20804,
        "sha256": "b926a78fce270689515649b04902fcfc9dc442ee9881f5897ed20334e9494ef6"
      },
      {
        "index": 53,
        "url": "/media/jaw-sequence/desktop/frame-053.webp",
        "bytes": 20958,
        "sha256": "ba436dd8125a2e69731d682f4ea47268dd7a93774d625d1f1899b59905c8f551"
      },
      {
        "index": 54,
        "url": "/media/jaw-sequence/desktop/frame-054.webp",
        "bytes": 20872,
        "sha256": "e478c677d96e385608806f2ca4f1060c84ae1b2f503fe9f169c7163e08174731"
      },
      {
        "index": 55,
        "url": "/media/jaw-sequence/desktop/frame-055.webp",
        "bytes": 20916,
        "sha256": "e655c7f4e54c7d6b746088bb56ea8b4f1799e75d32437fbe1d3729a84c99f7c0"
      },
      {
        "index": 56,
        "url": "/media/jaw-sequence/desktop/frame-056.webp",
        "bytes": 20988,
        "sha256": "21ba4740aeb3117f7e1600054573df1f36bee6288ff08ee82f1c6bde405ec1d0"
      },
      {
        "index": 57,
        "url": "/media/jaw-sequence/desktop/frame-057.webp",
        "bytes": 21102,
        "sha256": "24c3038dd6f1b4e74e6168fafdb10023766d7e53dc883fe11d1a97856dbe71f0"
      },
      {
        "index": 58,
        "url": "/media/jaw-sequence/desktop/frame-058.webp",
        "bytes": 21176,
        "sha256": "1edab06e25ccbda67dfed72896b84b1d5be47c6719d83915204174c4b1d1b135"
      },
      {
        "index": 59,
        "url": "/media/jaw-sequence/desktop/frame-059.webp",
        "bytes": 21198,
        "sha256": "83d80ecc9924c375559bea517e21e049f16ccb33b14b0fe3cfa5a0196d47f255"
      },
      {
        "index": 60,
        "url": "/media/jaw-sequence/desktop/frame-060.webp",
        "bytes": 21326,
        "sha256": "e4870c1cc086ebd914f4b58dff2ec65e12e022cdd202b63a3a1d9c24a5209d7d"
      },
      {
        "index": 61,
        "url": "/media/jaw-sequence/desktop/frame-061.webp",
        "bytes": 21190,
        "sha256": "39cccdfd99524d0014d4d0982e66b05611e25a9a12ece96d8383ff1bcd249ae0"
      },
      {
        "index": 62,
        "url": "/media/jaw-sequence/desktop/frame-062.webp",
        "bytes": 21316,
        "sha256": "a5b4379481ba526f74174124abd8ec8ae0025d57743f0c8e7de2f0cbede3dc2d"
      },
      {
        "index": 63,
        "url": "/media/jaw-sequence/desktop/frame-063.webp",
        "bytes": 21138,
        "sha256": "f953861ad0b46cb7bfe499e3383b8caf133477f65d6e42f000f3a688b7fb3cc0"
      },
      {
        "index": 64,
        "url": "/media/jaw-sequence/desktop/frame-064.webp",
        "bytes": 21392,
        "sha256": "72b51a6eb9c046e05eee9e5d6ecbc8a0e5e1c19449957d61bcb9962522540c7b"
      },
      {
        "index": 65,
        "url": "/media/jaw-sequence/desktop/frame-065.webp",
        "bytes": 21316,
        "sha256": "27840eacca42b07e14be1c9c508fd632377c921709df7321ef377e06138cb26f"
      },
      {
        "index": 66,
        "url": "/media/jaw-sequence/desktop/frame-066.webp",
        "bytes": 21198,
        "sha256": "d99da29ff057d0c69e9d80708a711cfbaa32b4d0fc64eb7f73bc593bbf14c6b6"
      },
      {
        "index": 67,
        "url": "/media/jaw-sequence/desktop/frame-067.webp",
        "bytes": 21350,
        "sha256": "bb4433e4dee41896404778e3f564ecfb8785ea109508a81e8f94678002ce1f0b"
      },
      {
        "index": 68,
        "url": "/media/jaw-sequence/desktop/frame-068.webp",
        "bytes": 21442,
        "sha256": "4c249b03f52b14f29c11fe9b030f0a53509a33290a8500ffcc91c81695e49ce9"
      },
      {
        "index": 69,
        "url": "/media/jaw-sequence/desktop/frame-069.webp",
        "bytes": 21256,
        "sha256": "7c8521b844c7f5d7dc38e31333eea01655720242832f5e7c389459b759d605eb"
      },
      {
        "index": 70,
        "url": "/media/jaw-sequence/desktop/frame-070.webp",
        "bytes": 21356,
        "sha256": "587683d1751e4952aeb0d0978e7eb9b4a0aa99edbaff4a896294d072e9e09266"
      },
      {
        "index": 71,
        "url": "/media/jaw-sequence/desktop/frame-071.webp",
        "bytes": 21264,
        "sha256": "a4794f350e02e2f5f90f8c28755298932a833e31d67dcfa1e6a1569ca694001e"
      },
      {
        "index": 72,
        "url": "/media/jaw-sequence/desktop/frame-072.webp",
        "bytes": 38118,
        "sha256": "c6dc95d75c109cf540b46bd064c298768b07f90be2ec805c607f25db5b88967e"
      }
    ]
  },
  "mobile": {
    "profile": "mobile",
    "width": 720,
    "height": 1280,
    "frameCount": 60,
    "totalBytes": 756620,
    "startFrame": 1,
    "endFrame": 60,
    "frames": [
      {
        "index": 1,
        "url": "/media/jaw-sequence/mobile/frame-001.webp",
        "bytes": 18570,
        "sha256": "9b77037955142ad105f52662e5176620daaddb318f43e5015b22c21f05397279"
      },
      {
        "index": 2,
        "url": "/media/jaw-sequence/mobile/frame-002.webp",
        "bytes": 11160,
        "sha256": "a3f58d1c5c6d2fe9055da2e41d9d207f5d8ca576dbe6bdfdefd86e7a14ef6f05"
      },
      {
        "index": 3,
        "url": "/media/jaw-sequence/mobile/frame-003.webp",
        "bytes": 11234,
        "sha256": "a834befba55164d84ca3c157915eb6e2854e594740dd36baeb68cae532c64971"
      },
      {
        "index": 4,
        "url": "/media/jaw-sequence/mobile/frame-004.webp",
        "bytes": 11238,
        "sha256": "2f43faf7912d4dc2335536d506471af12a4d12e0785a7ebb8c71409f8c72df72"
      },
      {
        "index": 5,
        "url": "/media/jaw-sequence/mobile/frame-005.webp",
        "bytes": 11402,
        "sha256": "e5ca6b70b06e00e67183bb81804ee37d7c08577e023d76241461441323548a0c"
      },
      {
        "index": 6,
        "url": "/media/jaw-sequence/mobile/frame-006.webp",
        "bytes": 11324,
        "sha256": "da3d37fd5d8d18e2eeebf921335499a46e01f27f9afde7de6cb1638a76dea9f9"
      },
      {
        "index": 7,
        "url": "/media/jaw-sequence/mobile/frame-007.webp",
        "bytes": 11452,
        "sha256": "de930e4128f9a4d514a7ec4e6a5cb88d76cc77912c3554ab00ce36fdb4de4017"
      },
      {
        "index": 8,
        "url": "/media/jaw-sequence/mobile/frame-008.webp",
        "bytes": 11552,
        "sha256": "12c9198355632d55715850265323b9e8bfec2d8ebcbf3e299ad8fba06b6be19d"
      },
      {
        "index": 9,
        "url": "/media/jaw-sequence/mobile/frame-009.webp",
        "bytes": 11616,
        "sha256": "0960f27822261038d2d9e0e1003235d78afbe3d9158a2ca1975c7391d5ab7dbf"
      },
      {
        "index": 10,
        "url": "/media/jaw-sequence/mobile/frame-010.webp",
        "bytes": 11666,
        "sha256": "0225ed0c3e68a370238fc814cfa6ca4ffdbf441a7cf81bc7d92e5204ffbf2449"
      },
      {
        "index": 11,
        "url": "/media/jaw-sequence/mobile/frame-011.webp",
        "bytes": 11768,
        "sha256": "09c4d2b7e61418a4d99ee0b52b31a91e311fa478ee7942a49b096bf374252f12"
      },
      {
        "index": 12,
        "url": "/media/jaw-sequence/mobile/frame-012.webp",
        "bytes": 11584,
        "sha256": "8663b8617840c18e6fb1d10fbc9cfde9a70c8d32ba256d3dba5c1e7397d0c88c"
      },
      {
        "index": 13,
        "url": "/media/jaw-sequence/mobile/frame-013.webp",
        "bytes": 11538,
        "sha256": "03ec39e820087eefd9e7ba0ed60bec81b73055d587c88e6fedf1c898409e27bc"
      },
      {
        "index": 14,
        "url": "/media/jaw-sequence/mobile/frame-014.webp",
        "bytes": 11594,
        "sha256": "6dc219626ae53c431413d25b4a66a1f01e5612cd6636194268f34ff83ee36069"
      },
      {
        "index": 15,
        "url": "/media/jaw-sequence/mobile/frame-015.webp",
        "bytes": 11548,
        "sha256": "03911b76da14bf89d667eb44ff8aaab8df1d77ae2e80d9c337327ca22387ce90"
      },
      {
        "index": 16,
        "url": "/media/jaw-sequence/mobile/frame-016.webp",
        "bytes": 11604,
        "sha256": "2fb644db13c27dacb7f2872f4f653c41c4f7d269c7dfc53f82c47a0dc5ab0e3b"
      },
      {
        "index": 17,
        "url": "/media/jaw-sequence/mobile/frame-017.webp",
        "bytes": 11736,
        "sha256": "9017dce93fff7046e3a09c92141c492a1713a84853e3ea904d5f2cde3070c807"
      },
      {
        "index": 18,
        "url": "/media/jaw-sequence/mobile/frame-018.webp",
        "bytes": 11646,
        "sha256": "64a920403e23fc8c5ca06db071ecec3b51399690967e6732a05e35bfebb6f59c"
      },
      {
        "index": 19,
        "url": "/media/jaw-sequence/mobile/frame-019.webp",
        "bytes": 11644,
        "sha256": "0c3ae05bee1a05c3e5d821a99248936266a25636459042ddc470ba2389f56722"
      },
      {
        "index": 20,
        "url": "/media/jaw-sequence/mobile/frame-020.webp",
        "bytes": 11708,
        "sha256": "5b74bc37553ffb4be44ddc28a501290e86f06076bc6511394653f0479ea2407d"
      },
      {
        "index": 21,
        "url": "/media/jaw-sequence/mobile/frame-021.webp",
        "bytes": 11720,
        "sha256": "2c0351b9c156cd6749a9a4bfaf0d8ac666356edac76057b7ab9472f1a43c796e"
      },
      {
        "index": 22,
        "url": "/media/jaw-sequence/mobile/frame-022.webp",
        "bytes": 11754,
        "sha256": "accce34c4bf96fbd64f0946ce84be0f892723a8686c01d5edf03ff9c2149544d"
      },
      {
        "index": 23,
        "url": "/media/jaw-sequence/mobile/frame-023.webp",
        "bytes": 11716,
        "sha256": "61883791632996186e4ae7e1f1178eac3eb4d8c3a85667978cf374dab0b7f2fb"
      },
      {
        "index": 24,
        "url": "/media/jaw-sequence/mobile/frame-024.webp",
        "bytes": 11862,
        "sha256": "886a7cbdabb251cb9872ab028684477461b21d583a7f2a477bcad707411d47be"
      },
      {
        "index": 25,
        "url": "/media/jaw-sequence/mobile/frame-025.webp",
        "bytes": 11856,
        "sha256": "e6a82fad9d3b8cb4df4fa41cf5d4ce3a544edae05ee859c2d8bd1a9fb3e96473"
      },
      {
        "index": 26,
        "url": "/media/jaw-sequence/mobile/frame-026.webp",
        "bytes": 12014,
        "sha256": "a5dc795e7ce7121c660b7ccf9e1ddda37d06f3cf25232c99e744b5270d0b5cd8"
      },
      {
        "index": 27,
        "url": "/media/jaw-sequence/mobile/frame-027.webp",
        "bytes": 12114,
        "sha256": "d52466552c2bb7f6058f134049788fefb0c032de6392a593830c144eb5d2d172"
      },
      {
        "index": 28,
        "url": "/media/jaw-sequence/mobile/frame-028.webp",
        "bytes": 12164,
        "sha256": "8251485c0eab69e13293f1b4aedc3adbf7e400e99c16304680d32a6150ceb950"
      },
      {
        "index": 29,
        "url": "/media/jaw-sequence/mobile/frame-029.webp",
        "bytes": 12330,
        "sha256": "6f35e29e9053aba9117649b79d961aa23c84c36e0678cdb146630ca3230eeb96"
      },
      {
        "index": 30,
        "url": "/media/jaw-sequence/mobile/frame-030.webp",
        "bytes": 12332,
        "sha256": "865b644e1a83418f93173f3eeacfab700cd53fe9b64cc42e57a6b4db07686945"
      },
      {
        "index": 31,
        "url": "/media/jaw-sequence/mobile/frame-031.webp",
        "bytes": 12506,
        "sha256": "11016301ed3cb74d9b1d1317a425a9b3cbb39ce79b0fce1b7348bab24c667085"
      },
      {
        "index": 32,
        "url": "/media/jaw-sequence/mobile/frame-032.webp",
        "bytes": 12474,
        "sha256": "7491cafaaa8cf20ff456b5ed62e7133fe4e8adc35b7f1012f53a004015092d73"
      },
      {
        "index": 33,
        "url": "/media/jaw-sequence/mobile/frame-033.webp",
        "bytes": 12510,
        "sha256": "42ff0e6b9fb9d4f446529a311bbe9806c8d216e074126e6129746c1d4d570df6"
      },
      {
        "index": 34,
        "url": "/media/jaw-sequence/mobile/frame-034.webp",
        "bytes": 12536,
        "sha256": "66920e14802637138ea13ab29b467da4966ed79796502526c97a0b5584655f1b"
      },
      {
        "index": 35,
        "url": "/media/jaw-sequence/mobile/frame-035.webp",
        "bytes": 12664,
        "sha256": "dec83ab5ed57c46d945ef7dfc65113ce4804cb55a80f2c3c0499ef6568b38254"
      },
      {
        "index": 36,
        "url": "/media/jaw-sequence/mobile/frame-036.webp",
        "bytes": 12636,
        "sha256": "9c49c2a40046dfce175c234f18e2673f9ee7ab6a52ce975a53f4f3454e52edbd"
      },
      {
        "index": 37,
        "url": "/media/jaw-sequence/mobile/frame-037.webp",
        "bytes": 12682,
        "sha256": "e6786dc990adfcff150c2dcdda99164e799eace3f7b84b33cc962bc4b1cb370a"
      },
      {
        "index": 38,
        "url": "/media/jaw-sequence/mobile/frame-038.webp",
        "bytes": 12824,
        "sha256": "f600f0d97d15baaf83d562f3a76c6ce37b5fe11594c1df6d8d65fc71761fccf0"
      },
      {
        "index": 39,
        "url": "/media/jaw-sequence/mobile/frame-039.webp",
        "bytes": 12980,
        "sha256": "543453bf4500020cb10643a1a4c56913deb41e115400f16734225c5da593af4c"
      },
      {
        "index": 40,
        "url": "/media/jaw-sequence/mobile/frame-040.webp",
        "bytes": 12938,
        "sha256": "bf53d3de93bd4d33f43a0557d90eacc79be427a0ffc56a13b6467867ecb00de4"
      },
      {
        "index": 41,
        "url": "/media/jaw-sequence/mobile/frame-041.webp",
        "bytes": 13040,
        "sha256": "792d930641f61dfb24c39ec5e622e7fc4ba65106525632e5bb67e35b58e74e5a"
      },
      {
        "index": 42,
        "url": "/media/jaw-sequence/mobile/frame-042.webp",
        "bytes": 13008,
        "sha256": "8dccca74e51ebc7a9aca4f072e1619495b1abcd9c0090552d3843dd95fe4ca94"
      },
      {
        "index": 43,
        "url": "/media/jaw-sequence/mobile/frame-043.webp",
        "bytes": 13084,
        "sha256": "84a2585217eb66245b74b451766fb579e8811cd8419a659123e707ca84d43706"
      },
      {
        "index": 44,
        "url": "/media/jaw-sequence/mobile/frame-044.webp",
        "bytes": 13114,
        "sha256": "24f7eca237310b78f930116a27c4f1edab4ace584655b2ab2d5d1feb08d94078"
      },
      {
        "index": 45,
        "url": "/media/jaw-sequence/mobile/frame-045.webp",
        "bytes": 13002,
        "sha256": "22890a8b0538476d56960e67d739cda3e4ed4bb6ac61af46cf15fd2a8dec33dd"
      },
      {
        "index": 46,
        "url": "/media/jaw-sequence/mobile/frame-046.webp",
        "bytes": 13204,
        "sha256": "c471ee01b39fa1d335bed33e5d498d67ae0f4c84112e077f17b9266e60d050ce"
      },
      {
        "index": 47,
        "url": "/media/jaw-sequence/mobile/frame-047.webp",
        "bytes": 13236,
        "sha256": "32893fdeb8c5d5f4eb51c047c3aa4ecb00a006f764cc02bf2dbdf5c490f92599"
      },
      {
        "index": 48,
        "url": "/media/jaw-sequence/mobile/frame-048.webp",
        "bytes": 13314,
        "sha256": "38f0c6b1862de23acad08730fa681343ed64888e7f03633cc650c3624ddd20dd"
      },
      {
        "index": 49,
        "url": "/media/jaw-sequence/mobile/frame-049.webp",
        "bytes": 13154,
        "sha256": "e4fd2e1cabb2b05ddecd5b9fddff5d219f6642bb1b8853316992c039e4d43229"
      },
      {
        "index": 50,
        "url": "/media/jaw-sequence/mobile/frame-050.webp",
        "bytes": 13194,
        "sha256": "ff32679bce97cee66c6a6b873e1906b7165ccd991f09403aeb762b605a4add78"
      },
      {
        "index": 51,
        "url": "/media/jaw-sequence/mobile/frame-051.webp",
        "bytes": 13144,
        "sha256": "5944fcc2e90aa9d3cc2f59585f5cefe23dcd0f6934274dcc9354bc2d98916bc2"
      },
      {
        "index": 52,
        "url": "/media/jaw-sequence/mobile/frame-052.webp",
        "bytes": 13310,
        "sha256": "6167446ebb5165414432ab00abf6dd056055869a2de3a252581c53a33d0ef7ff"
      },
      {
        "index": 53,
        "url": "/media/jaw-sequence/mobile/frame-053.webp",
        "bytes": 13270,
        "sha256": "78e33e3d49029c3b7713999cc3f6d1ac616c78e84bee922cea996d96daf82377"
      },
      {
        "index": 54,
        "url": "/media/jaw-sequence/mobile/frame-054.webp",
        "bytes": 13226,
        "sha256": "845650652b4f21b1426aaa3e4559bd546812f366ef7a5c6b63123cc7f07e8a70"
      },
      {
        "index": 55,
        "url": "/media/jaw-sequence/mobile/frame-055.webp",
        "bytes": 13156,
        "sha256": "07ffdf83fb0fa7726c42192cee14f43f4a6e61e7efadee277768c50a831af185"
      },
      {
        "index": 56,
        "url": "/media/jaw-sequence/mobile/frame-056.webp",
        "bytes": 13210,
        "sha256": "6eda3dafd1932c791903d56e19694dfcc27b8a9201b9c52fdcbd142f12999f06"
      },
      {
        "index": 57,
        "url": "/media/jaw-sequence/mobile/frame-057.webp",
        "bytes": 13184,
        "sha256": "c737dfd6603395a0d45ac4862b35bb5167ced33213f2be98ccd63236acc93929"
      },
      {
        "index": 58,
        "url": "/media/jaw-sequence/mobile/frame-058.webp",
        "bytes": 13210,
        "sha256": "f499f0cb54687ce66ab431a8bc9f597d7465efd5d5f398763d825d60e2058d54"
      },
      {
        "index": 59,
        "url": "/media/jaw-sequence/mobile/frame-059.webp",
        "bytes": 13236,
        "sha256": "1ea9a894ed94e491231709f851a712f9dcb59c9893ad3e09593dd4f30cfed3f9"
      },
      {
        "index": 60,
        "url": "/media/jaw-sequence/mobile/frame-060.webp",
        "bytes": 22128,
        "sha256": "79337d0bc6dc6877d65717fb413e31a628e9ab49dff031e83952573e90035673"
      }
    ]
  }
} as const satisfies Readonly<Record<JawSequenceProfile, JawSequenceManifest>>;
