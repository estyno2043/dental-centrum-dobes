#!/usr/bin/env -S xcrun swift

import AVFoundation
import CoreMedia
import CoreVideo
import Foundation

// One-time Task 1 normalization for the approved Higgsfield download.
// Copies source rows 4...1083 into a 1920x1080 H.264 stream, preserving every
// presentation timestamp. Task 2 consumes the normalized master and does not
// invoke this helper.

enum CropError: Error, CustomStringConvertible {
  case usage
  case invalidInput(String)
  case operation(String)

  var description: String {
    switch self {
    case .usage:
      return "Usage: xcrun swift scripts/crop-jaw-master.swift <1920x1088-input.mp4> <1920x1080-output.mp4>"
    case .invalidInput(let message), .operation(let message):
      return message
    }
  }
}

func fail(_ error: Error) -> Never {
  FileHandle.standardError.write(Data("\(error)\n".utf8))
  exit(1)
}

func cropJawMaster() async throws {
  guard CommandLine.arguments.count == 3 else { throw CropError.usage }

  let inputURL = URL(fileURLWithPath: CommandLine.arguments[1]).standardizedFileURL
  let outputURL = URL(fileURLWithPath: CommandLine.arguments[2]).standardizedFileURL
  guard inputURL != outputURL else {
    throw CropError.invalidInput("Input and output must be different files")
  }
  guard FileManager.default.fileExists(atPath: inputURL.path) else {
    throw CropError.invalidInput("Input does not exist: \(inputURL.path)")
  }
  guard !FileManager.default.fileExists(atPath: outputURL.path) else {
    throw CropError.invalidInput("Refusing to overwrite existing output: \(outputURL.path)")
  }

  let asset = AVURLAsset(url: inputURL)
  guard let sourceTrack = try await asset.loadTracks(withMediaType: .video).first else {
    throw CropError.invalidInput("Input has no video track")
  }
  let naturalSize = try await sourceTrack.load(.naturalSize)
  guard naturalSize == CGSize(width: 1920, height: 1088) else {
    throw CropError.invalidInput("Expected 1920x1088 input, got \(naturalSize)")
  }
  guard try await asset.loadTracks(withMediaType: .audio).isEmpty else {
    throw CropError.invalidInput("Expected a silent input")
  }
  let sourceDuration = try await asset.load(.duration)

  let reader = try AVAssetReader(asset: asset)
  let readerOutput = AVAssetReaderTrackOutput(
    track: sourceTrack,
    outputSettings: [
      kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    ]
  )
  readerOutput.alwaysCopiesSampleData = false
  guard reader.canAdd(readerOutput) else {
    throw CropError.operation("Cannot attach video reader output")
  }
  reader.add(readerOutput)

  let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
  writer.movieTimeScale = sourceDuration.timescale
  let writerInput = AVAssetWriterInput(
    mediaType: .video,
    outputSettings: [
      AVVideoCodecKey: AVVideoCodecType.h264,
      AVVideoWidthKey: 1920,
      AVVideoHeightKey: 1080,
      AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 8_000_000,
        AVVideoExpectedSourceFrameRateKey: 24,
        AVVideoMaxKeyFrameIntervalKey: 24,
        AVVideoAllowFrameReorderingKey: false,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
      ],
      AVVideoCleanApertureKey: [
        AVVideoCleanApertureWidthKey: 1920,
        AVVideoCleanApertureHeightKey: 1080,
        AVVideoCleanApertureHorizontalOffsetKey: 0,
        AVVideoCleanApertureVerticalOffsetKey: 0,
      ],
    ]
  )
  writerInput.expectsMediaDataInRealTime = false

  let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: writerInput,
    sourcePixelBufferAttributes: [
      kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
      kCVPixelBufferWidthKey as String: 1920,
      kCVPixelBufferHeightKey as String: 1080,
      kCVPixelBufferIOSurfacePropertiesKey as String: [:],
    ]
  )
  guard writer.canAdd(writerInput) else {
    throw CropError.operation("Cannot attach video writer input")
  }
  writer.add(writerInput)

  guard writer.startWriting() else {
    throw CropError.operation("Could not start writer: \(writer.error?.localizedDescription ?? "unknown error")")
  }
  guard reader.startReading() else {
    throw CropError.operation("Could not start reader: \(reader.error?.localizedDescription ?? "unknown error")")
  }
  writer.startSession(atSourceTime: .zero)

  var frameCount = 0
  while let sample = readerOutput.copyNextSampleBuffer() {
    while !writerInput.isReadyForMoreMediaData {
      try await Task<Never, Never>.sleep(for: .milliseconds(1))
    }

    guard let sourceBuffer = CMSampleBufferGetImageBuffer(sample) else {
      throw CropError.operation("Frame \(frameCount) has no pixel buffer")
    }
    guard let pool = adaptor.pixelBufferPool else {
      throw CropError.operation("Writer pixel-buffer pool is unavailable")
    }

    var destinationBuffer: CVPixelBuffer?
    let allocationStatus = CVPixelBufferPoolCreatePixelBuffer(
      kCFAllocatorDefault,
      pool,
      &destinationBuffer
    )
    guard allocationStatus == kCVReturnSuccess, let destinationBuffer else {
      throw CropError.operation("Could not allocate output frame \(frameCount)")
    }
    guard CVPixelBufferGetWidth(sourceBuffer) == 1920,
          CVPixelBufferGetHeight(sourceBuffer) == 1088,
          CVPixelBufferGetPixelFormatType(sourceBuffer) == kCVPixelFormatType_32BGRA,
          CVPixelBufferGetWidth(destinationBuffer) == 1920,
          CVPixelBufferGetHeight(destinationBuffer) == 1080,
          CVPixelBufferGetPixelFormatType(destinationBuffer) == kCVPixelFormatType_32BGRA else {
      throw CropError.operation("Unexpected pixel-buffer layout at frame \(frameCount)")
    }

    CVPixelBufferLockBaseAddress(sourceBuffer, .readOnly)
    CVPixelBufferLockBaseAddress(destinationBuffer, [])
    defer {
      CVPixelBufferUnlockBaseAddress(destinationBuffer, [])
      CVPixelBufferUnlockBaseAddress(sourceBuffer, .readOnly)
    }

    guard let sourceBase = CVPixelBufferGetBaseAddress(sourceBuffer),
          let destinationBase = CVPixelBufferGetBaseAddress(destinationBuffer) else {
      throw CropError.operation("Frame \(frameCount) has no accessible pixel data")
    }

    let sourceBytesPerRow = CVPixelBufferGetBytesPerRow(sourceBuffer)
    let destinationBytesPerRow = CVPixelBufferGetBytesPerRow(destinationBuffer)
    for row in 0..<1080 {
      memcpy(
        destinationBase.advanced(by: row * destinationBytesPerRow),
        sourceBase.advanced(by: (row + 4) * sourceBytesPerRow),
        1920 * 4
      )
    }

    let presentationTime = CMSampleBufferGetPresentationTimeStamp(sample)
    guard adaptor.append(destinationBuffer, withPresentationTime: presentationTime) else {
      throw CropError.operation("Could not append frame \(frameCount): \(writer.error?.localizedDescription ?? "unknown error")")
    }
    frameCount += 1
  }

  guard reader.status == .completed else {
    throw CropError.operation("Reader failed: \(reader.error?.localizedDescription ?? "unknown error")")
  }

  writer.endSession(atSourceTime: sourceDuration)
  writerInput.markAsFinished()
  await writer.finishWriting()
  guard writer.status == .completed else {
    throw CropError.operation("Writer failed: \(writer.error?.localizedDescription ?? "unknown error")")
  }

  print("cropped_frames=\(frameCount)")
  print("crop=top:4,bottom:4,left:0,right:0")
  print("output=\(outputURL.path)")
}

Task {
  do {
    try await cropJawMaster()
    exit(0)
  } catch {
    fail(error)
  }
}
dispatchMain()
