import Foundation
import UIKit
import React
import MLKitVision
import MLKitFaceDetection
import TensorFlowLite

// MARK: - Support types

private struct IRect {
    var left: Int, top: Int, right: Int, bottom: Int
    var width: Int { right - left }
    var height: Int { bottom - top }
}

private struct ModuleError: Error {
    let code: String
    let message: String
    init(_ code: String, _ message: String) { self.code = code; self.message = message }
}

/// Snapshot of the ML Kit face fields we use (keeps quality logic independent of MLKit types).
private struct FaceInfo {
    let rect: IRect
    let eulerY: Float
    let eulerZ: Float
    let hasTracking: Bool
    let leftEyeOpen: Float?
    let rightEyeOpen: Float?
}

private struct LivenessResult {
    var isLive: Bool
    var score: Float
    var label: String
    var confidence: String
    var cameraQuality: Float = 0
    var qualityCategory: String = ""
    var debugInfo: String = ""
    var allScores: [String: Float] = [:]
}

private struct AdaptiveThresholds {
    let high: Float
    let medium: Float
    let low: Float
}

private struct CameraQualityInfo {
    let score: Float
    let category: String
    let description: String
    let hardwareScore: Float
    let imageQualityScore: Float
    let degradationLevel: String
}

/// RGBA8 pixel buffer for fast pixel access (UIImage/CGImage have no getPixel).
private struct RGBImage {
    let width: Int
    let height: Int
    private(set) var data: [UInt8]

    init?(cgImage: CGImage, width w: Int? = nil, height h: Int? = nil) {
        let tw = w ?? cgImage.width
        let th = h ?? cgImage.height
        guard tw > 0, th > 0 else { return nil }
        var buf = [UInt8](repeating: 0, count: tw * th * 4)
        let ok = buf.withUnsafeMutableBytes { ptr -> Bool in
            guard let ctx = CGContext(
                data: ptr.baseAddress, width: tw, height: th,
                bitsPerComponent: 8, bytesPerRow: tw * 4,
                space: CGColorSpaceCreateDeviceRGB(),
                bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
            ) else { return false }
            ctx.interpolationQuality = .high
            ctx.draw(cgImage, in: CGRect(x: 0, y: 0, width: tw, height: th))
            return true
        }
        guard ok else { return nil }
        self.width = tw
        self.height = th
        self.data = buf
    }

    @inline(__always) func rgb(_ x: Int, _ y: Int) -> (r: Int, g: Int, b: Int) {
        let i = (y * width + x) * 4
        return (Int(data[i]), Int(data[i + 1]), Int(data[i + 2]))
    }

    @inline(__always) func gray(_ x: Int, _ y: Int) -> Int {
        let p = rgb(x, y)
        return (p.r + p.g + p.b) / 3
    }

    /// Clamped iteration bounds for a rect inside this image.
    func bounds(_ r: IRect) -> (x0: Int, x1: Int, y0: Int, y1: Int) {
        (max(r.left, 0), min(r.right, width), max(r.top, 0), min(r.bottom, height))
    }
}

// MARK: - Module

@objc(FaceNetModule)
final class FaceNetModule: NSObject {

    private let inputSize = 160
    private let embeddingSize = 512
    private let antiSpoofInputSize = 80   // MiniFASNet

    // Quality thresholds
    private let minFaceSize = 120
    private let minBrightness = 40
    private let maxBrightness = 220
    private let matchThreshold: Float = 0.74
    private let highConfidenceThreshold: Float = 0.0053

    private var faceNet: Interpreter?
    private var antiSpoof: Interpreter?

    // TFLite interpreters are not thread-safe -> everything runs on one serial queue.
    private let queue = DispatchQueue(label: "com.attendance.facenet", qos: .userInitiated)

    private lazy var detector: FaceDetector = {
        let o = FaceDetectorOptions()
        o.performanceMode = .accurate
        o.landmarkMode = .all
        o.classificationMode = .all
        o.minFaceSize = 0.15
        o.isTrackingEnabled = true
        return FaceDetector.faceDetector(options: o)
    }()

    @objc static func requiresMainQueueSetup() -> Bool { false }

    override init() {
        super.init()
        faceNet = loadInterpreter("facenet")
        antiSpoof = loadInterpreter("2.7_80x80_MiniFASNetV2")
    }

    private func loadInterpreter(_ name: String) -> Interpreter? {
        guard let path = Bundle.main.path(forResource: name, ofType: "tflite") else {
            log("❌ FaceNetModule: \(name).tflite not found in bundle")
            return nil
        }
        do {
            var opts = Interpreter.Options()
            opts.threadCount = 4
            let interp = try Interpreter(modelPath: path, options: opts)
            try interp.allocateTensors()
            log("✅ FaceNetModule: \(name) loaded")
            return interp
        } catch {
            log("❌ FaceNetModule: failed loading \(name): \(error)")
            return nil
        }
    }

    private func log(_ s: String) {
        #if DEBUG
        print(s)
        #endif
    }

    // MARK: - Image decode / encode

    private func decodeBase64ToCGImage(_ base64: String) -> CGImage? {
        let clean = base64.replacingOccurrences(
            of: "data:image/[^;]+;base64,", with: "", options: .regularExpression)
        guard let data = Data(base64Encoded: clean, options: .ignoreUnknownCharacters),
              let image = UIImage(data: data) else { return nil }

        // Redraw -> bakes EXIF orientation into pixels (equivalent of rotateImageIfRequired).
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        format.opaque = true
        let renderer = UIGraphicsImageRenderer(size: image.size, format: format)
        let normalized = renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: image.size))
        }
        return normalized.cgImage
    }

    private func cgImageToBase64(_ cg: CGImage, quality: CGFloat = 1.0) -> String {
        UIImage(cgImage: cg).jpegData(compressionQuality: quality)?.base64EncodedString() ?? ""
    }

    private func crop(_ cg: CGImage, _ r: IRect) -> CGImage? {
        let l = max(r.left, 0), t = max(r.top, 0)
        let rr = min(r.right, cg.width), bb = min(r.bottom, cg.height)
        guard rr > l, bb > t else { return nil }
        return cg.cropping(to: CGRect(x: l, y: t, width: rr - l, height: bb - t))
    }

    private func expandBoundingBox(_ b: IRect, imgW: Int, imgH: Int, margin: Float) -> IRect {
        let ex = Int(Float(b.width) * margin)
        let ey = Int(Float(b.height) * margin)
        return IRect(left: max(b.left - ex, 0), top: max(b.top - ey, 0),
                     right: min(b.right + ex, imgW), bottom: min(b.bottom + ey, imgH))
    }

    // MARK: - Detect + crop

    private func detectAndCropFace(_ cg: CGImage) throws -> (crop: CGImage, face: FaceInfo, liveness: LivenessResult) {
        guard let rgb = RGBImage(cgImage: cg) else { throw ModuleError("QUALITY_ERROR", "Failed to read image pixels") }

        let vision = VisionImage(image: UIImage(cgImage: cg))
        vision.orientation = .up

        let faces: [Face]
        do { faces = try detector.results(in: vision) }
        catch { throw ModuleError("QUALITY_ERROR", "Face detection failed: \(error.localizedDescription)") }

        guard let face = faces.max(by: {
            $0.frame.width * $0.frame.height < $1.frame.width * $1.frame.height
        }) else { throw ModuleError("QUALITY_ERROR", "No face detected") }

        let f = face.frame
        let info = FaceInfo(
            rect: IRect(left: Int(f.minX), top: Int(f.minY), right: Int(f.maxX), bottom: Int(f.maxY)),
            eulerY: Float(face.headEulerAngleY),
            eulerZ: Float(face.headEulerAngleZ),
            hasTracking: face.hasTrackingID,
            leftEyeOpen: face.hasLeftEyeOpenProbability ? Float(face.leftEyeOpenProbability) : nil,
            rightEyeOpen: face.hasRightEyeOpenProbability ? Float(face.rightEyeOpenProbability) : nil
        )

        if let issue = checkFaceQuality(info, rgb) {
            throw ModuleError("QUALITY_ERROR", issue)
        }

        let liveness = performLivenessDetection(cg, rgb, info)
        if !liveness.isLive {
            throw ModuleError("QUALITY_ERROR",
                              "Liveness check failed: \(liveness.label) (\(liveness.qualityCategory))")
        }

        let bbox = expandBoundingBox(info.rect, imgW: cg.width, imgH: cg.height, margin: 0.2)
        guard let cropped = crop(cg, bbox) else { throw ModuleError("QUALITY_ERROR", "Face crop failed") }
        log("✅ Face cropped - Original: \(cg.width)x\(cg.height), Cropped: \(cropped.width)x\(cropped.height)")
        return (cropped, info, liveness)
    }

    // MARK: - Face quality gate

    private func checkFaceQuality(_ face: FaceInfo, _ img: RGBImage) -> String? {
        let b = face.rect
        if b.width < minFaceSize || b.height < minFaceSize { return "Face too small (move closer)" }
        let margin = 20
        if b.left < margin || b.top < margin || b.right > img.width - margin || b.bottom > img.height - margin {
            return "Face too close to edge"
        }
        if abs(face.eulerY) > 20 { return "Face not frontal (turn face towards camera)" }
        if abs(face.eulerZ) > 15 { return "Head tilted too much" }

        let brightness = averageBrightness(img, b)
        if brightness < minBrightness { return "Too dark (need better lighting)" }
        if brightness > maxBrightness { return "Too bright (reduce lighting)" }

        if let l = face.leftEyeOpen, let r = face.rightEyeOpen, !(l > 0.5 && r > 0.5) {
            return "Please open your eyes"
        }

        let sharp = calculateSharpness(img, b)
        let minSharp = brightness > 180 ? 5.0 : 8.0
        if sharp < minSharp { return "Image too blurry (hold steady)" }
        log("🔍 Sharpness: \(String(format: "%.2f", sharp)) | Brightness: \(brightness)")
        return nil
    }

    // MARK: - Liveness

    private func performLivenessDetection(_ cg: CGImage, _ img: RGBImage, _ face: FaceInfo) -> LivenessResult {
        guard antiSpoof != nil else {
            return LivenessResult(isLive: false, score: 0, label: "Model not loaded",
                                  confidence: "low", cameraQuality: 0, qualityCategory: "Unknown")
        }
        let q = assessCameraQuality(img, face.rect)
        log("📊 Camera Quality: \(q.score)/100 - \(q.category) | HW \(q.hardwareScore) IMG \(q.imageQualityScore) deg \(q.degradationLevel)")

        switch q.score {
        case 60...:
            return runModelLogic(cg, img, face, q, mode: "high_quality")
        case 30..<60:
            return runModelLogic(cg, img, face, q, mode: "medium_low")
        default:
            return runHeuristicFallback(img, face, q)
        }
    }

    // MARK: Camera quality

    private func assessCameraQuality(_ img: RGBImage, _ bbox: IRect) -> CameraQualityInfo {
        let hw = assessHardwareQuality(img, bbox)
        let iq = assessActualImageQuality(img, bbox)
        let combined = hw * 0.4 + iq * 0.6

        let degradation: String
        switch true {
        case iq >= hw * 0.90: degradation = "None/Minimal"
        case iq >= hw * 0.75: degradation = "Slight"
        case iq >= hw * 0.60: degradation = "Moderate"
        case iq >= hw * 0.45: degradation = "Significant"
        default: degradation = "Severe"
        }

        let (category, description): (String, String)
        switch combined {
        case 85...: (category, description) = ("Excellent", "Premium camera with optimal conditions")
        case 70...: (category, description) = ("Very Good", "Modern smartphone with good lighting")
        case 55...: (category, description) = ("Good", "Average smartphone with acceptable conditions")
        case 40...: (category, description) = ("Fair", "Budget phone or degraded camera quality")
        case 25...: (category, description) = ("Poor", "Old/damaged device or poor lighting")
        default:    (category, description) = ("Very Poor", "Severely degraded camera or bad environment")
        }

        return CameraQualityInfo(score: combined, category: category, description: description,
                                 hardwareScore: hw, imageQualityScore: iq, degradationLevel: degradation)
    }

    private func assessHardwareQuality(_ img: RGBImage, _ bbox: IRect) -> Float {
        var s: Float = 0

        let res = img.width * img.height
        switch res {
        case 12_000_000...: s += 35
        case 8_000_000...:  s += 30
        case 5_000_000...:  s += 24
        case 3_000_000...:  s += 18
        case 2_000_000...:  s += 12
        case 1_000_000...:  s += 6
        default:            s += 2
        }

        let faceSize = (bbox.width + bbox.height) / 2
        switch faceSize {
        case 250...: s += 30
        case 200...: s += 25
        case 160...: s += 20
        case 130...: s += 14
        case 100...: s += 8
        default:     s += 3
        }

        let dr = calculateDynamicRange(img, bbox)
        switch dr {
        case 180...: s += 20
        case 150...: s += 16
        case 120...: s += 12
        case 90...:  s += 8
        case 60...:  s += 4
        default:     s += 1
        }

        let cd = estimateColorDepth(img, bbox)
        switch cd {
        case 240...: s += 15
        case 200...: s += 12
        case 160...: s += 9
        case 120...: s += 6
        case 80...:  s += 3
        default:     s += 0
        }
        return s
    }

    private func assessActualImageQuality(_ img: RGBImage, _ bbox: IRect) -> Float {
        var s: Float = 0

        let sharp = calculateSharpness(img, bbox)
        switch sharp {
        case 100...: s += 30
        case 80...:  s += 27
        case 60...:  s += 24
        case 40...:  s += 20
        case 25...:  s += 15
        case 15...:  s += 10
        case 8...:   s += 5
        case 3...:   s += 2
        default:     s += 0
        }

        let noise = calculateNoiseLevel(img, bbox)
        switch noise {
        case ...5:  s += 25
        case ...10: s += 22
        case ...15: s += 18
        case ...20: s += 14
        case ...30: s += 10
        case ...45: s += 5
        default:    s += 1
        }

        let contrast = calculateContrastQuality(img, bbox)
        switch contrast {
        case 70...: s += 20
        case 55...: s += 17
        case 40...: s += 14
        case 28...: s += 10
        case 18...: s += 6
        case 10...: s += 3
        default:    s += 0
        }

        let ca = calculateColorAccuracy(img, bbox)
        switch ca {
        case 0.85...: s += 15
        case 0.75...: s += 13
        case 0.65...: s += 11
        case 0.55...: s += 8
        case 0.45...: s += 5
        case 0.35...: s += 2
        default:      s += 0
        }

        let ab = detectChromaticAberration(img, bbox)
        switch ab {
        case ...2:  s += 10
        case ...5:  s += 8
        case ...10: s += 6
        case ...15: s += 4
        case ...25: s += 2
        default:    s += 0
        }
        return s
    }

    // MARK: Pixel helpers

    private func calculateDynamicRange(_ img: RGBImage, _ bbox: IRect) -> Int {
        let b = img.bounds(bbox)
        var px = [Int]()
        for y in stride(from: b.y0, to: b.y1, by: 3) {
            for x in stride(from: b.x0, to: b.x1, by: 3) { px.append(img.gray(x, y)) }
        }
        if px.isEmpty { return 0 }
        px.sort()
        return px[Int(Double(px.count) * 0.95)] - px[Int(Double(px.count) * 0.05)]
    }

    private func estimateColorDepth(_ img: RGBImage, _ bbox: IRect) -> Int {
        let b = img.bounds(bbox)
        var unique = Set<UInt32>()
        outer: for y in stride(from: b.y0, to: b.y1, by: 2) {
            for x in stride(from: b.x0, to: b.x1, by: 2) {
                let p = img.rgb(x, y)
                unique.insert(UInt32(p.r) << 16 | UInt32(p.g) << 8 | UInt32(p.b))
                if unique.count > 300 { break outer }
            }
        }
        let area = (bbox.width / 2) * (bbox.height / 2)
        if area <= 0 { return 0 }
        let diversity = Float(unique.count) / Float(area) * 255
        return max(0, min(255, Int(diversity)))
    }

    private func calculateNoiseLevel(_ img: RGBImage, _ bbox: IRect) -> Double {
        let x0 = max(bbox.left, 0), y0 = max(bbox.top, 0)
        let x1 = min(bbox.right - 1, img.width - 1), y1 = min(bbox.bottom - 1, img.height - 1)
        var sum = 0.0, n = 0
        for y in stride(from: y0, to: y1, by: 4) {
            for x in stride(from: x0, to: x1, by: 4) {
                let g1 = img.gray(x, y), g2 = img.gray(x + 1, y), g3 = img.gray(x, y + 1)
                sum += Double(abs(g1 - g2) + abs(g1 - g3))
                n += 1
            }
        }
        return n > 0 ? sum / Double(n) : 0
    }

    private func calculateContrastQuality(_ img: RGBImage, _ bbox: IRect) -> Double {
        let b = img.bounds(bbox)
        var px = [Int]()
        for y in stride(from: b.y0, to: b.y1, by: 3) {
            for x in stride(from: b.x0, to: b.x1, by: 3) { px.append(img.gray(x, y)) }
        }
        if px.count < 2 { return 0 }
        px.sort()
        return Double(px[Int(Double(px.count) * 0.90)] - px[Int(Double(px.count) * 0.10)])
    }

    private func calculateColorAccuracy(_ img: RGBImage, _ bbox: IRect) -> Float {
        let b = img.bounds(bbox)
        var valid = 0, total = 0
        for y in stride(from: b.y0, to: b.y1, by: 4) {
            for x in stride(from: b.x0, to: b.x1, by: 4) {
                let p = img.rgb(x, y)
                if p.r > p.g && p.g > p.b && p.r > 60 {
                    let rg = Float(p.r) / Float(p.g)
                    let gb = Float(p.g) / Float(p.b)   // b == 0 -> +inf, same as Kotlin
                    if (1.1...1.9).contains(rg) && (1.1...2.5).contains(gb) { valid += 1 }
                }
                total += 1
            }
        }
        return total > 0 ? Float(valid) / Float(total) : 0
    }

    private func detectChromaticAberration(_ img: RGBImage, _ bbox: IRect) -> Double {
        let x0 = max(bbox.left, 0), y0 = max(bbox.top, 0)
        let x1 = min(bbox.right - 2, img.width - 2), y1 = min(bbox.bottom, img.height)
        var sum = 0.0, n = 0
        for y in stride(from: y0, to: y1, by: 5) {
            for x in stride(from: x0, to: x1, by: 5) {
                let p1 = img.rgb(x, y), p2 = img.rgb(x + 2, y)
                let rd = abs(p1.r - p2.r), gd = abs(p1.g - p2.g), bd = abs(p1.b - p2.b)
                sum += Double(abs(rd - gd) + abs(gd - bd) + abs(bd - rd))
                n += 1
            }
        }
        return n > 0 ? sum / Double(n) : 0
    }

    private func calculateTextureVariance(_ img: RGBImage, _ bbox: IRect) -> Double {
        let b = img.bounds(bbox)
        var sum = 0.0, sumSq = 0.0, n = 0.0
        for y in stride(from: b.y0, to: b.y1, by: 3) {
            for x in stride(from: b.x0, to: b.x1, by: 3) {
                let g = Double(img.gray(x, y))
                sum += g; sumSq += g * g; n += 1
            }
        }
        if n < 2 { return 0 }
        let mean = sum / n
        return max(0, sumSq / n - mean * mean).squareRoot()
    }

    private func calculateColorNaturalness(_ img: RGBImage, _ bbox: IRect) -> Double {
        let b = img.bounds(bbox)
        var r = 0.0, g = 0.0, bl = 0.0, n = 0.0
        for y in stride(from: b.y0, to: b.y1, by: 4) {
            for x in stride(from: b.x0, to: b.x1, by: 4) {
                let p = img.rgb(x, y)
                r += Double(p.r); g += Double(p.g); bl += Double(p.b); n += 1
            }
        }
        if n == 0 { return 0 }
        let ra = r / n / 255, ga = g / n / 255, ba = bl / n / 255
        return ((ra - ga) * (ra - ga) + (ga - ba) * (ga - ba) + (ba - ra) * (ba - ra)).squareRoot() / 3
    }

    private func averageBrightness(_ img: RGBImage, _ bbox: IRect) -> Int {
        let b = img.bounds(bbox)
        var total = 0, n = 0
        for y in stride(from: b.y0, to: b.y1, by: 5) {
            for x in stride(from: b.x0, to: b.x1, by: 5) { total += img.gray(x, y); n += 1 }
        }
        return n > 0 ? total / n : 0
    }

    /// Variance of grayscale over the whole bbox (same metric as Kotlin version).
    private func calculateSharpness(_ img: RGBImage, _ bbox: IRect) -> Double {
        let b = img.bounds(bbox)
        var sum = 0.0, sumSq = 0.0, n = 0.0
        for y in b.y0..<max(b.y0, b.y1) {
            for x in b.x0..<max(b.x0, b.x1) {
                let g = Double(img.gray(x, y))
                sum += g; sumSq += g * g; n += 1
            }
        }
        if n < 2 { return 0 }
        let mean = sum / n
        return max(0, sumSq / n - mean * mean)
    }

    // MARK: Model-based liveness (high + medium-low share the same logic)

    private func runModelLogic(_ cg: CGImage, _ img: RGBImage, _ face: FaceInfo,
                               _ q: CameraQualityInfo, mode: String) -> LivenessResult {
        var allScores: [String: Float] = [:]

        do {
            let pad = Int(Float(face.rect.width) * 0.25)
            let region = IRect(left: max(face.rect.left - pad, 0), top: max(face.rect.top - pad, 0),
                               right: min(face.rect.right + pad, cg.width),
                               bottom: min(face.rect.bottom + pad, cg.height))
            guard let faceCrop = crop(cg, region),
                  let small = RGBImage(cgImage: faceCrop, width: antiSpoofInputSize, height: antiSpoofInputSize)
            else { throw ModuleError("LIVENESS", "crop failed") }

            let methods: [(String, (Float, Int) -> Float)] = [
                ("method1_0to1", { v, _ in v / 255 }),
                ("method2_neg1to1", { v, _ in (v - 127.5) / 127.5 }),
                ("method3_imagenet", { v, c in
                    let mean: [Float] = [0.485, 0.456, 0.406]
                    let std: [Float] = [0.229, 0.224, 0.225]
                    return (v / 255 - mean[c]) / std[c]
                })
            ]
            for (name, norm) in methods {
                do {
                    let input = toTensorInput(small, normalize: norm)
                    allScores[name] = try runAntiSpoof(input)
                    log("📊 \(name) => \(allScores[name]!)")
                } catch {
                    log("⚠️ \(name) failed: \(error)")
                }
            }
        } catch {
            log("⚠️ liveness preprocessing failed: \(error)")
        }

        guard let finalScore = allScores.values.max(),
              let bestMethod = allScores.max(by: { $0.value < $1.value })?.key else {
            return LivenessResult(isLive: false, score: 0, label: "Error: All preprocessing methods failed",
                                  confidence: "low", cameraQuality: 0, qualityCategory: "Error")
        }

        let thresholds = getAdaptiveThresholds(q.score)
        var decision = makeAdaptiveDecision(finalScore: finalScore, allScores: allScores,
                                            q: q, t: thresholds, img: img, face: face)
        decision.cameraQuality = q.score
        decision.qualityCategory = q.category
        decision.allScores = allScores
        decision.debugInfo = "method=\(bestMethod), quality=\(String(format: "%.1f", q.score)), category=\(q.category), mode=\(mode)"
        log("🎯 FINAL: live=\(decision.isLive) score=\(decision.score) label=\(decision.label) conf=\(decision.confidence)")
        return decision
    }

    private func toTensorInput(_ img: RGBImage, normalize: (Float, Int) -> Float) -> [Float] {
        var out = [Float](repeating: 0, count: img.width * img.height * 3)
        var i = 0
        for y in 0..<img.height {
            for x in 0..<img.width {
                let p = img.rgb(x, y)
                out[i] = normalize(Float(p.r), 0)
                out[i + 1] = normalize(Float(p.g), 1)
                out[i + 2] = normalize(Float(p.b), 2)
                i += 3
            }
        }
        return out
    }

    private func runAntiSpoof(_ input: [Float]) throws -> Float {
        guard let interp = antiSpoof else { throw ModuleError("LIVENESS", "Model not loaded") }
        try interp.copy(input.withUnsafeBufferPointer { Data(buffer: $0) }, toInputAt: 0)
        try interp.invoke()
        let out = try interp.output(at: 0)
        let floats = out.data.withUnsafeBytes { Array($0.bindMemory(to: Float.self)) }
        guard !floats.isEmpty else { throw ModuleError("LIVENESS", "Empty model output") }
        let dims = out.shape.dimensions
        let size = dims.count > 1 ? dims[1] : 1
        return parseModelOutput(floats, size: size)
    }

    private func parseModelOutput(_ o: [Float], size: Int) -> Float {
        switch size {
        case 2 where o.count >= 2:
            let m = max(o[0], o[1])
            let e0 = expf(o[0] - m), e1 = expf(o[1] - m)
            return e1 / (e0 + e1)
        case 3 where o.count >= 3:
            let m = max(o[0], o[1], o[2])
            let e0 = expf(o[0] - m), e1 = expf(o[1] - m), e2 = expf(o[2] - m)
            return e1 / (e0 + e1 + e2)
        default:
            return o[0]
        }
    }

    // MARK: Heuristic fallback (very low quality)

    private func runHeuristicFallback(_ img: RGBImage, _ face: FaceInfo, _ q: CameraQualityInfo) -> LivenessResult {
        let bbox = face.rect
        let veryLow = q.score < 25
        var score: Float = 0

        if calculateTextureVariance(img, bbox) > (veryLow ? 2.0 : 3.0) { score += 0.30 }
        if calculateColorNaturalness(img, bbox) > (veryLow ? 0.01 : 0.02) { score += 0.25 }
        if calculateSharpness(img, bbox) > (veryLow ? 1.5 : 2.0) { score += 0.20 }
        if face.hasTracking { score += 0.15 }
        if let l = face.leftEyeOpen, let r = face.rightEyeOpen {
            let t: Float = veryLow ? 0.2 : 0.3
            if l > t && r > t { score += 0.10 }
        }

        let threshold: Float = veryLow ? 0.40 : 0.50
        let isLive = score > threshold
        return LivenessResult(
            isLive: isLive, score: score,
            label: isLive ? "Real Face (Low-end device mode)" : "Heuristic fail",
            confidence: score > 0.60 ? "medium" : "low",
            cameraQuality: q.score, qualityCategory: q.category,
            debugInfo: "mode=heuristic_fallback, score=\(String(format: "%.2f", score)), threshold=\(threshold)",
            allScores: [:])
    }

    // MARK: Adaptive thresholds + decision

    private func getAdaptiveThresholds(_ q: Float) -> AdaptiveThresholds {
        switch q {
        case 85...: return AdaptiveThresholds(high: 0.0075, medium: 0.0065, low: 0.0058)
        case 70...: return AdaptiveThresholds(high: 0.0065, medium: 0.0058, low: 0.0050)
        case 55...: return AdaptiveThresholds(high: 0.0055, medium: 0.0048, low: 0.0040)
        case 40...: return AdaptiveThresholds(high: 0.0038, medium: 0.0028, low: 0.0018)
        case 25...: return AdaptiveThresholds(high: 0.0028, medium: 0.0018, low: 0.0008)
        default:    return AdaptiveThresholds(high: 0.0020, medium: 0.0010, low: 0.0005)
        }
    }

    private func makeAdaptiveDecision(finalScore: Float, allScores: [String: Float],
                                      q qi: CameraQualityInfo, t: AdaptiveThresholds,
                                      img: RGBImage, face: FaceInfo) -> LivenessResult {
        let quality = qi.score

        func result(_ live: Bool, _ label: String, _ conf: String) -> LivenessResult {
            LivenessResult(isLive: live, score: finalScore, label: label, confidence: conf)
        }

        // Very poor quality: accept on any signal
        if quality < 30 && finalScore > 0.0005 {
            return result(true, "Real Face (Low-end device mode)", "low")
        }

        // Excellent quality: extra strict
        if quality >= 85 {
            if !allScores.values.allSatisfy({ $0 > t.low }) {
                return result(false, "Spoof Detected - High-quality camera inconsistency", "high")
            }
            if scoreVariance(Array(allScores.values)) > 0.003 {
                return result(false, "Spoof Detected - Inconsistent responses", "high")
            }
        }

        if finalScore > t.high { return result(true, "Real Face Detected", "high") }
        if finalScore > t.medium { return result(true, "Real Face Detected", "medium") }

        // Consensus voting
        if finalScore > t.low {
            let realVotes = allScores.values.filter { $0 > t.low }.count
            let total = allScores.count
            let required: Int
            switch quality {
            case 70...: required = total
            case 55...: required = total - 1
            case 40...: required = 2
            default:    required = 1
            }
            if realVotes >= required {
                let conf: String
                switch quality {
                case 70...: conf = "high"
                case 55...: conf = "medium"
                case 40...: conf = "low"
                default:    conf = "very_low"
                }
                return result(true, "Real Face Detected - Consensus (\(realVotes)/\(total))", conf)
            } else if quality >= 70 {
                return result(false, "Spoof Detected - Consensus failed", "high")
            }
        }

        // Quality-based fallback for uncertain zone
        if finalScore > 0.0010 {
            let qc = performEnhancedQualityChecks(img, face, quality)
            let qThreshold: Float
            switch quality {
            case 85...: qThreshold = 0.85
            case 70...: qThreshold = 0.75
            case 55...: qThreshold = 0.65
            case 40...: qThreshold = 0.50
            default:    qThreshold = 0.35
            }
            if qc.score > qThreshold { return result(true, "Real Face Detected - Quality verified", "low") }
            if quality < 30 && qc.score > 0.30 {
                return result(true, "Real Face Detected - Low-quality camera mode", "low")
            }
        }

        // Clear rejection
        let rejectionUpper: Float = quality < 40 ? 0.80 : 0.70
        if finalScore < 0.0010 || finalScore > rejectionUpper {
            return result(false, "Spoof Detected", "high")
        }

        let defaultAccept = quality < 40
        return result(defaultAccept,
                      defaultAccept ? "Real Face Detected - Poor quality accept" : "Spoof Detected - Medium confidence",
                      defaultAccept ? "low" : "medium")
    }

    private func scoreVariance(_ s: [Float]) -> Float {
        if s.isEmpty { return 0 }
        let mean = s.reduce(0, +) / Float(s.count)
        return s.map { ($0 - mean) * ($0 - mean) }.reduce(0, +) / Float(s.count)
    }

    private func performEnhancedQualityChecks(_ img: RGBImage, _ face: FaceInfo, _ cq: Float) -> LivenessResult {
        let bbox = face.rect
        var s: Float = 0

        let tex = calculateTextureVariance(img, bbox)
        let texPass: Bool
        switch cq {
        case 70...: texPass = tex > 12.0
        case 50...: texPass = tex > 8.0
        case 40...: texPass = tex > 6.0
        default:    texPass = tex > 3.0
        }
        if texPass { s += 0.30 }

        let col = calculateColorNaturalness(img, bbox)
        let colPass: Bool
        switch cq {
        case 70...: colPass = col > 0.15
        case 50...: colPass = col > 0.10
        case 40...: colPass = col > 0.07
        default:    colPass = col > 0.03
        }
        if colPass { s += 0.25 }

        let sharp = calculateSharpness(img, bbox)
        let sharpPass: Bool
        switch cq {
        case 70...: sharpPass = sharp >= 15.0
        case 50...: sharpPass = sharp >= 8.0
        case 40...: sharpPass = sharp >= 5.0
        default:    sharpPass = sharp >= 2.0
        }
        if sharpPass { s += 0.20 }

        if face.hasTracking { s += 0.15 }

        if let l = face.leftEyeOpen, let r = face.rightEyeOpen {
            let t: Float = cq < 40 ? 0.2 : 0.3
            if l > t && r > t { s += 0.10 }
        }

        return LivenessResult(isLive: s > 0.6, score: s, label: "Quality Check",
                              confidence: s > 0.75 ? "high" : (s > 0.60 ? "medium" : "low"))
    }

    // MARK: - FaceNet embedding

    private func getEmbedding(_ face: CGImage) throws -> [Float] {
        guard let interp = faceNet else { throw ModuleError("EMBEDDING_ERROR", "FaceNet model not loaded") }
        guard let small = RGBImage(cgImage: face, width: inputSize, height: inputSize) else {
            throw ModuleError("EMBEDDING_ERROR", "Failed to preprocess face")
        }
        let input = toTensorInput(small) { v, _ in (v - 127.5) / 128 }
        try interp.copy(input.withUnsafeBufferPointer { Data(buffer: $0) }, toInputAt: 0)
        try interp.invoke()
        let out = try interp.output(at: 0)
        let raw = out.data.withUnsafeBytes { Array($0.bindMemory(to: Float.self)) }
        guard raw.count >= embeddingSize else { throw ModuleError("EMBEDDING_ERROR", "Failed to extract embedding") }
        return normalize(Array(raw.prefix(embeddingSize)))
    }

    private func normalize(_ e: [Float]) -> [Float] {
        let norm = e.reduce(0) { $0 + $1 * $1 }.squareRoot()
        return norm == 0 ? e : e.map { $0 / norm }
    }

    private func cosineSimilarity(_ a: [Float], _ b: [Float]) -> Float {
        var dot: Float = 0
        for i in 0..<min(a.count, b.count) { dot += a[i] * b[i] }
        return max(-1, min(1, dot))
    }

    private func livenessFields(_ l: LivenessResult) -> [String: Any] {
        [
            "isLive": l.isLive,
            "livenessScore": Double(l.score),
            "livenessLabel": l.label,
            "livenessConfidence": l.confidence,
            "cameraQuality": Double(l.cameraQuality),
            "qualityCategory": l.qualityCategory,
            "livenessDebug": l.debugInfo,
            "allMethodScores": l.allScores.mapValues { Double($0) }
        ]
    }

    // MARK: - React Native API

    @objc(captureAndGetEmbedding:resolver:rejecter:)
    func captureAndGetEmbedding(_ imageBase64: String,
                                resolver resolve: @escaping RCTPromiseResolveBlock,
                                rejecter reject: @escaping RCTPromiseRejectBlock) {
        queue.async { [self] in
            do {
                guard let cg = decodeBase64ToCGImage(imageBase64) else {
                    throw ModuleError("CAPTURE_ERROR", "Failed to decode image")
                }
                let det = try detectAndCropFace(cg)
                let embedding = try getEmbedding(det.crop)

                var result: [String: Any] = [
                    "embedding": embedding.map { Double($0) },
                    "status": "success",
                    "faceWidth": Double(det.face.rect.width),
                    "faceHeight": Double(det.face.rect.height),
                    "croppedFaceBase64": cgImageToBase64(det.crop)
                ]
                result.merge(livenessFields(det.liveness)) { $1 }
                resolve(result)
            } catch let e as ModuleError {
                reject(e.code == "EMBEDDING_ERROR" ? "CAPTURE_ERROR" : e.code, e.message, nil)
            } catch {
                reject("CAPTURE_ERROR", error.localizedDescription, nil)
            }
        }
    }

    @objc(matchWithEmbeddings:referenceEmbeddings:resolver:rejecter:)
    func matchWithEmbeddings(_ testImageBase64: String,
                             referenceEmbeddings: NSArray,
                             resolver resolve: @escaping RCTPromiseResolveBlock,
                             rejecter reject: @escaping RCTPromiseRejectBlock) {
        queue.async { [self] in
            do {
                guard let cg = decodeBase64ToCGImage(testImageBase64) else {
                    throw ModuleError("MATCH_ERROR", "Failed to decode test image")
                }
                let det = try detectAndCropFace(cg)
                let testEmb = try getEmbedding(det.crop)

                var refs = [[Float]]()
                for item in referenceEmbeddings {
                    if let arr = item as? [NSNumber], arr.count == embeddingSize {
                        refs.append(arr.map { $0.floatValue })
                    }
                }
                guard !refs.isEmpty else {
                    throw ModuleError("NO_EMBEDDINGS", "No valid reference embeddings provided")
                }

                let sims = refs.map { cosineSimilarity(testEmb, $0) }
                let maxSim = sims.max() ?? 0
                let avgSim = sims.reduce(0, +) / Float(sims.count)
                let isMatch = maxSim >= matchThreshold

                let confidence: String
                if maxSim >= highConfidenceThreshold { confidence = "high" }
                else if maxSim >= matchThreshold { confidence = "medium" }
                else { confidence = "low" }

                var result: [String: Any] = [
                    "isMatch": isMatch,
                    "matchStatus": isMatch ? "MATCH_FOUND" : "MATCH_NOT_FOUND",
                    "similarity": Double(maxSim),
                    "avgSimilarity": Double(avgSim),
                    "confidence": confidence,
                    "threshold": Double(matchThreshold),
                    "referencesCompared": refs.count,
                    "croppedFaceBase64": cgImageToBase64(det.crop)
                ]
                result.merge(livenessFields(det.liveness)) { $1 }
                resolve(result)
            } catch let e as ModuleError {
                reject(e.code == "EMBEDDING_ERROR" ? "MATCH_ERROR" : e.code, e.message, nil)
            } catch {
                reject("MATCH_ERROR", error.localizedDescription, nil)
            }
        }
    }

    @objc(enrollFace:resolver:rejecter:)
    func enrollFace(_ imageBase64: String,
                    resolver resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
        captureAndGetEmbedding(imageBase64, resolver: resolve, rejecter: reject)
    }
}