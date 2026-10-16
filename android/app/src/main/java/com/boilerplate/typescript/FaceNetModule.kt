package com.attendance.name.facematch
import com.facebook.react.bridge.*
import org.tensorflow.lite.Interpreter
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Rect
import android.graphics.Matrix
import android.media.ExifInterface
import android.util.Base64
import android.util.Log
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.Face
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.google.mlkit.vision.face.FaceDetection
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.io.ByteArrayInputStream
import kotlin.math.sqrt
import kotlin.math.abs
import kotlin.math.exp

class FaceNetModule(reactApplicationContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactApplicationContext) {
    private var faceNetInterpreter: Interpreter? = null
    private var antiSpoofInterpreter: Interpreter? = null
 
    private val inputSize = 160
    private val embeddingSize = 512
 
    // MiniFASNet input size
    private val antiSpoofInputSize = 80
   
    // Optimized detector for real-time performance
    private val detectorOptions = FaceDetectorOptions.Builder()
        .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
        .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
        .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
        .setMinFaceSize(0.15f)
        .enableTracking()
        .build()
    private val detector = FaceDetection.getClient(detectorOptions)
   
    // Quality thresholds
    private val MIN_FACE_SIZE = 120
    private val MIN_BRIGHTNESS = 40
    private val MAX_BRIGHTNESS = 220
    private val MIN_SHARPNESS = 5.0
    private val MATCH_THRESHOLD = 0.74f
    private val HIGH_CONFIDENCE_THRESHOLD = 0.0053f
   
    companion object {
        private const val TAG = "FaceNetModule"
    }
   
    override fun getName(): String = "FaceNetModule"
   
    init {
        try {
            // Load FaceNet model
            val faceNetFile = reactApplicationContext.assets.open("facenet.tflite")
            val faceNetBytes = faceNetFile.readBytes()
            val faceNetBuffer = ByteBuffer.allocateDirect(faceNetBytes.size).apply {
                order(ByteOrder.nativeOrder())
                put(faceNetBytes)
                rewind()
            }
            faceNetInterpreter = Interpreter(faceNetBuffer, Interpreter.Options().apply {
                setNumThreads(4)
                setUseNNAPI(true)
            })
            println("✅ FaceNetModule: FaceNet model loaded successfully")
           
            // Load MiniFASNet anti-spoofing model
            val antiSpoofFile = reactApplicationContext.assets.open("2.7_80x80_MiniFASNetV2.tflite")
            val antiSpoofBytes = antiSpoofFile.readBytes()
            val antiSpoofBuffer = ByteBuffer.allocateDirect(antiSpoofBytes.size).apply {
                order(ByteOrder.nativeOrder())
                put(antiSpoofBytes)
                rewind()
            }
            antiSpoofInterpreter = Interpreter(antiSpoofBuffer, Interpreter.Options().apply {
                setNumThreads(4)
                setUseNNAPI(false)
            })
            println("✅ FaceNetModule: MiniFASNet anti-spoofing model loaded successfully")
        } catch (e: Exception) {
            println("❌ FaceNetModule ERROR loading models => ${e.message}")
            e.printStackTrace()
        }
    }
   
    // 🔄 Decode base64 and handle rotation
    private fun decodeBase64ToBitmap(base64Str: String): Bitmap? {
        return try {
            val cleanBase64 = base64Str.replace("data:image/[^;]+;base64,".toRegex(), "")
            val decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
           
            // Get EXIF orientation
            val orientation = getExifOrientation(decodedBytes)
           
            // Decode bitmap
            var bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                ?: return null
           
            // Rotate based on EXIF orientation
            bitmap = rotateImageIfRequired(bitmap, orientation)
           
            println("✅ Image decoded - Size: ${bitmap.width}x${bitmap.height}, Orientation: $orientation")
           
            bitmap
        } catch (e: Exception) {
            println("❌ FaceNetModule decode ERROR => ${e.message}")
            e.printStackTrace()
            null
        }
    }
   
    // 🔄 Convert bitmap to base64 with high quality
    private fun bitmapToBase64(bitmap: Bitmap, quality: Int = 100): String {
        return try {
            val outputStream = java.io.ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream)
            val byteArray = outputStream.toByteArray()
            val base64 = Base64.encodeToString(byteArray, Base64.NO_WRAP)
            println("✅ Bitmap converted to base64 - Size: ${bitmap.width}x${bitmap.height}, Quality: $quality%, Base64 length: ${base64.length}")
            base64
        } catch (e: Exception) {
            println("❌ Error converting bitmap to base64: ${e.message}")
            ""
        }
    }
   
    // 🔄 Get EXIF orientation from byte array
    private fun getExifOrientation(imageData: ByteArray): Int {
        return try {
            val inputStream = ByteArrayInputStream(imageData)
            val exif = ExifInterface(inputStream)
            exif.getAttributeInt(
                ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_NORMAL
            )
        } catch (e: Exception) {
            println("⚠️ Could not read EXIF data: ${e.message}")
            ExifInterface.ORIENTATION_NORMAL
        }
    }
   
    // 🔄 Rotate bitmap based on EXIF orientation
    private fun rotateImageIfRequired(bitmap: Bitmap, orientation: Int): Bitmap {
        val matrix = Matrix()
       
        when (orientation) {
            ExifInterface.ORIENTATION_ROTATE_90 -> {
                println("🔄 Rotating image 90°")
                matrix.postRotate(90f)
            }
            ExifInterface.ORIENTATION_ROTATE_180 -> {
                println("🔄 Rotating image 180°")
                matrix.postRotate(180f)
            }
            ExifInterface.ORIENTATION_ROTATE_270 -> {
                println("🔄 Rotating image 270°")
                matrix.postRotate(270f)
            }
            ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> {
                println("🔄 Flipping image horizontally")
                matrix.postScale(-1f, 1f)
            }
            ExifInterface.ORIENTATION_FLIP_VERTICAL -> {
                println("🔄 Flipping image vertically")
                matrix.postScale(1f, -1f)
            }
            ExifInterface.ORIENTATION_TRANSPOSE -> {
                println("🔄 Transposing image")
                matrix.postRotate(90f)
                matrix.postScale(-1f, 1f)
            }
            ExifInterface.ORIENTATION_TRANSVERSE -> {
                println("🔄 Transverse image")
                matrix.postRotate(270f)
                matrix.postScale(-1f, 1f)
            }
            else -> {
                // ORIENTATION_NORMAL or ORIENTATION_UNDEFINED - no rotation needed
                return bitmap
            }
        }
       
        return try {
            val rotatedBitmap = Bitmap.createBitmap(
                bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true
            )
            if (rotatedBitmap != bitmap) {
                bitmap.recycle()
            }
            rotatedBitmap
        } catch (e: Exception) {
            println("❌ Error rotating image: ${e.message}")
            bitmap
        }
    }
   
    // 🔥 LIVENESS RESULT DATA CLASS
    data class LivenessResult(
        val isLive: Boolean,
        val score: Float,
        val label: String,
        val confidence: String,
        val cameraQuality: Float = 0f,
        val qualityCategory: String = "",
        val debugInfo: String = "",
        val allScores: Map<String, Float> = emptyMap()
    )
   
    // 📊 ADAPTIVE THRESHOLDS DATA CLASS
    data class AdaptiveThresholds(
        val high: Float,
        val medium: Float,
        val low: Float
    )
   
    // 📊 CAMERA QUALITY CATEGORY - ENHANCED
    data class CameraQualityInfo(
        val score: Float,
        val category: String,
        val description: String,
        val hardwareScore: Float,
        val imageQualityScore: Float,
        val degradationLevel: String
    )
   
    private fun detectAndCropFace(bitmap: Bitmap, callback: (Bitmap?, Face?, String?, LivenessResult?) -> Unit) {
        val image = InputImage.fromBitmap(bitmap, 0)
     
        detector.process(image)
            .addOnSuccessListener { faces ->
                if (faces.isEmpty()) {
                    callback(null, null, "No face detected", null)
                    return@addOnSuccessListener
                }
                val face = faces.maxByOrNull { it.boundingBox.width() * it.boundingBox.height() }!!
             
                val qualityIssue = checkFaceQuality(face, bitmap)
                if (qualityIssue != null) {
                    callback(null, face, qualityIssue, null)
                    return@addOnSuccessListener
                }
               
                // 🔥 PERFORM ADAPTIVE LIVENESS DETECTION
                val livenessResult = performLivenessDetection(bitmap, face)
             
                if (!livenessResult.isLive) {
                    val reason = "Liveness check failed: ${livenessResult.label} (${livenessResult.qualityCategory})"
                    callback(null, face, reason, livenessResult)
                    return@addOnSuccessListener
                }
               
                // 🎯 Use original bitmap for cropping to maintain quality
                val bbox = expandBoundingBox(face.boundingBox, bitmap, 0.2f)
             
                // Create high-quality crop with proper sampling
                val croppedFace = Bitmap.createBitmap(
                    bitmap,
                    bbox.left,
                    bbox.top,
                    bbox.width(),
                    bbox.height(),
                    null,
                    true // Enable filtering for better quality
                )
               
                println("✅ Face cropped - Original: ${bitmap.width}x${bitmap.height}, Cropped: ${croppedFace.width}x${croppedFace.height}")
               
                callback(croppedFace, face, null, livenessResult)
            }
            .addOnFailureListener { e ->
                callback(null, null, "Face detection failed: ${e.message}", null)
            }
    }
   
    // 🔥 ADAPTIVE LIVENESS DETECTION - Enhanced for low-end devices
    private fun performLivenessDetection(bitmap: Bitmap, face: Face): LivenessResult {
        if (antiSpoofInterpreter == null) {
            println("⚠️ Anti-spoofing model not loaded")
            return LivenessResult(
                isLive = false,
                score = 0.0f,
                label = "Model not loaded",
                confidence = "low",
                cameraQuality = 0f,
                qualityCategory = "Unknown"
            )
        }
       
        try {
            val bbox = face.boundingBox
         
            println("========================================")
            println("🔍 ADAPTIVE LIVENESS DETECTION")
            println("========================================")
         
            // 📊 STEP 1: Assess camera quality (enhanced with degradation detection)
            val qualityInfo = assessCameraQuality(bitmap, bbox)
            println("📊 Camera Quality: ${qualityInfo.score}/100 - ${qualityInfo.category}")
            println("   ${qualityInfo.description}")
            println("   🔧 Hardware: ${qualityInfo.hardwareScore}/100")
            println("   📸 Image Quality: ${qualityInfo.imageQualityScore}/100")
            println("   ⚠️ Degradation: ${qualityInfo.degradationLevel}")
         
            // 🎯 HYBRID STRATEGY BASED ON QUALITY
            return when {
                qualityInfo.score >= 60 -> {
                    // High quality: use MiniFASNetV2 strictly with adaptive logic
                    runNormalAdaptiveLogic(bitmap, face, qualityInfo)
                }
                qualityInfo.score >= 30 -> {
                    // Medium-low: use MiniFASNetV2 with very lenient thresholds + consensus
                    runAdaptiveWithLenientThresholds(bitmap, face, qualityInfo)
                }
                else -> {
                    // Very low quality: heuristic + light model or accept with warning
                    runHeuristicFallback(bitmap, face, qualityInfo)
                }
            }
         
        } catch (e: Exception) {
            println("❌ Liveness error: ${e.message}")
            e.printStackTrace()
            return LivenessResult(
                isLive = false,
                score = 0.0f,
                label = "Error: ${e.message}",
                confidence = "low",
                cameraQuality = 0f,
                qualityCategory = "Error"
            )
        }
    }
   
    // 📊 ENHANCED CAMERA QUALITY ASSESSMENT - Hardware + Image Quality
    private fun assessCameraQuality(bitmap: Bitmap, bbox: Rect): CameraQualityInfo {
        // PART 1: HARDWARE-BASED ASSESSMENT (inherent camera capability)
        val hardwareScore = assessHardwareQuality(bitmap, bbox)
        
        // PART 2: IMAGE QUALITY ASSESSMENT (actual photo quality - degradation indicator)
        val imageQualityScore = assessActualImageQuality(bitmap, bbox)
        
        // PART 3: COMBINED SCORING with weighted approach
        // Hardware matters more for baseline, but image quality shows degradation
        val combinedScore = (hardwareScore * 0.4f) + (imageQualityScore * 0.6f)
        
        // Determine degradation level
        val degradationLevel = when {
            imageQualityScore >= hardwareScore * 0.9f -> "None/Minimal"
            imageQualityScore >= hardwareScore * 0.75f -> "Slight"
            imageQualityScore >= hardwareScore * 0.60f -> "Moderate"
            imageQualityScore >= hardwareScore * 0.45f -> "Significant"
            else -> "Severe"
        }
        
        println("========================================")
        println("📊 CAMERA QUALITY ANALYSIS:")
        println("========================================")
        println("🔧 Hardware Score: ${"%.1f".format(hardwareScore)}/100")
        println("📸 Actual Image Quality: ${"%.1f".format(imageQualityScore)}/100")
        println("🔄 Degradation Level: $degradationLevel")
        println("🎯 Combined Score: ${"%.1f".format(combinedScore)}/100")
        
        // Categorize based on combined score
        val (category, description) = when {
            combinedScore >= 85 -> "Excellent" to "Premium camera with optimal conditions"
            combinedScore >= 70 -> "Very Good" to "Modern smartphone with good lighting"
            combinedScore >= 55 -> "Good" to "Average smartphone with acceptable conditions"
            combinedScore >= 40 -> "Fair" to "Budget phone or degraded camera quality"
            combinedScore >= 25 -> "Poor" to "Old/damaged device or poor lighting"
            else -> "Very Poor" to "Severely degraded camera or bad environment"
        }
        
        println("✅ Final Category: $category")
        println("========================================")
        
        return CameraQualityInfo(
            score = combinedScore,
            category = category,
            description = description,
            hardwareScore = hardwareScore,
            imageQualityScore = imageQualityScore,
            degradationLevel = degradationLevel
        )
    }
    
    // 🔧 PART 1: Hardware-based quality (inherent camera specs)
    private fun assessHardwareQuality(bitmap: Bitmap, bbox: Rect): Float {
        var hardwareScore = 0f
        
        // Factor 1: Sensor Resolution (0-35 points)
        val imageResolution = bitmap.width * bitmap.height
        val resolutionScore = when {
            imageResolution >= 12_000_000 -> 35f  // 12MP+
            imageResolution >= 8_000_000 -> 30f   // 8MP+
            imageResolution >= 5_000_000 -> 24f   // 5MP+
            imageResolution >= 3_000_000 -> 18f   // 3MP+
            imageResolution >= 2_000_000 -> 12f   // 2MP+
            imageResolution >= 1_000_000 -> 6f    // 1MP+
            else -> 2f
        }
        hardwareScore += resolutionScore
        
        // Factor 2: Face Detection Size (indicates sensor capability) (0-30 points)
        val faceSize = (bbox.width() + bbox.height()) / 2
        val faceSizeScore = when {
            faceSize >= 250 -> 30f
            faceSize >= 200 -> 25f
            faceSize >= 160 -> 20f
            faceSize >= 130 -> 14f
            faceSize >= 100 -> 8f
            else -> 3f
        }
        hardwareScore += faceSizeScore
        
        // Factor 3: Dynamic Range Capability (0-20 points)
        val dynamicRange = calculateDynamicRange(bitmap, bbox)
        val dynamicRangeScore = when {
            dynamicRange >= 180 -> 20f  // High-end sensor
            dynamicRange >= 150 -> 16f
            dynamicRange >= 120 -> 12f
            dynamicRange >= 90 -> 8f
            dynamicRange >= 60 -> 4f
            else -> 1f
        }
        hardwareScore += dynamicRangeScore
        
        // Factor 4: Color Bit Depth Estimate (0-15 points)
        val colorDepth = estimateColorDepth(bitmap, bbox)
        val colorDepthScore = when {
            colorDepth >= 240 -> 15f  // Near 24-bit
            colorDepth >= 200 -> 12f
            colorDepth >= 160 -> 9f
            colorDepth >= 120 -> 6f
            colorDepth >= 80 -> 3f
            else -> 0f
        }
        hardwareScore += colorDepthScore
        
        println("  🔧 Hardware Components:")
        println("    Resolution: ${"%.1f".format(resolutionScore)}/35 (${imageResolution}px)")
        println("    Face Size: ${"%.1f".format(faceSizeScore)}/30 (${faceSize}px)")
        println("    Dynamic Range: ${"%.1f".format(dynamicRangeScore)}/20 ($dynamicRange)")
        println("    Color Depth: ${"%.1f".format(colorDepthScore)}/15 ($colorDepth)")
        
        return hardwareScore
    }
    
    // 📸 PART 2: Actual image quality (shows degradation over time)
    private fun assessActualImageQuality(bitmap: Bitmap, bbox: Rect): Float {
        var imageScore = 0f
        
        // Factor 1: Sharpness (0-30 points) - Degrades with lens scratches/dirt
        val sharpness = calculateSharpness(bitmap, bbox)
        val sharpnessScore = when {
            sharpness >= 100 -> 30f
            sharpness >= 80 -> 27f
            sharpness >= 60 -> 24f
            sharpness >= 40 -> 20f
            sharpness >= 25 -> 15f
            sharpness >= 15 -> 10f
            sharpness >= 8 -> 5f
            sharpness >= 3 -> 2f
            else -> 0f
        }
        imageScore += sharpnessScore
        
        // Factor 2: Noise Level (0-25 points) - Increases with sensor degradation
        val noiseLevel = calculateNoiseLevel(bitmap, bbox)
        val noiseScore = when {
            noiseLevel <= 5 -> 25f    // Very clean
            noiseLevel <= 10 -> 22f
            noiseLevel <= 15 -> 18f
            noiseLevel <= 20 -> 14f
            noiseLevel <= 30 -> 10f
            noiseLevel <= 45 -> 5f
            else -> 1f                // Very noisy
        }
        imageScore += noiseScore
        
        // Factor 3: Contrast Quality (0-20 points) - Degrades with lens coating damage
        val contrast = calculateContrastQuality(bitmap, bbox)
        val contrastScore = when {
            contrast >= 70 -> 20f
            contrast >= 55 -> 17f
            contrast >= 40 -> 14f
            contrast >= 28 -> 10f
            contrast >= 18 -> 6f
            contrast >= 10 -> 3f
            else -> 0f
        }
        imageScore += contrastScore
        
        // Factor 4: Color Accuracy (0-15 points) - Degrades with sensor aging
        val colorAccuracy = calculateColorAccuracy(bitmap, bbox)
        val colorScore = when {
            colorAccuracy >= 0.85f -> 15f
            colorAccuracy >= 0.75f -> 13f
            colorAccuracy >= 0.65f -> 11f
            colorAccuracy >= 0.55f -> 8f
            colorAccuracy >= 0.45f -> 5f
            colorAccuracy >= 0.35f -> 2f
            else -> 0f
        }
        imageScore += colorScore
        
        // Factor 5: Chromatic Aberration (0-10 points) - Increases with lens damage
        val chromaticAberration = detectChromaticAberration(bitmap, bbox)
        val aberrationScore = when {
            chromaticAberration <= 2 -> 10f   // Minimal
            chromaticAberration <= 5 -> 8f
            chromaticAberration <= 10 -> 6f
            chromaticAberration <= 15 -> 4f
            chromaticAberration <= 25 -> 2f
            else -> 0f                         // Severe
        }
        imageScore += aberrationScore
        
        println("  📸 Image Quality Components:")
        println("    Sharpness: ${"%.1f".format(sharpnessScore)}/30 (${"%.1f".format(sharpness)})")
        println("    Noise Level: ${"%.1f".format(noiseScore)}/25 (${"%.1f".format(noiseLevel)})")
        println("    Contrast: ${"%.1f".format(contrastScore)}/20 (${"%.1f".format(contrast)})")
        println("    Color Accuracy: ${"%.1f".format(colorScore)}/15 (${"%.2f".format(colorAccuracy)})")
        println("    Aberration: ${"%.1f".format(aberrationScore)}/10 (${"%.1f".format(chromaticAberration)})")
        
        return imageScore
    }
    
    // 🔍 Helper: Calculate dynamic range
    private fun calculateDynamicRange(bitmap: Bitmap, bbox: Rect): Int {
        val pixels = mutableListOf<Int>()
        
        for (y in bbox.top until bbox.bottom step 3) {
            for (x in bbox.left until bbox.right step 3) {
                if (x < bitmap.width && y < bitmap.height) {
                    val pixel = bitmap.getPixel(x, y)
                    val gray = (Color.red(pixel) + Color.green(pixel) + Color.blue(pixel)) / 3
                    pixels.add(gray)
                }
            }
        }
        
        if (pixels.isEmpty()) return 0
        
        val sorted = pixels.sorted()
        val p5 = sorted[(pixels.size * 0.05).toInt()]
        val p95 = sorted[(pixels.size * 0.95).toInt()]
        
        return p95 - p5
    }
    
    // 🔍 Helper: Estimate color bit depth
    private fun estimateColorDepth(bitmap: Bitmap, bbox: Rect): Int {
        val uniqueColors = mutableSetOf<Int>()
        
        for (y in bbox.top until bbox.bottom step 2) {
            for (x in bbox.left until bbox.right step 2) {
                if (x < bitmap.width && y < bitmap.height) {
                    uniqueColors.add(bitmap.getPixel(x, y))
                    if (uniqueColors.size > 300) break  // Early exit
                }
            }
            if (uniqueColors.size > 300) break
        }
        
        // Estimate based on unique colors in sample
        val sampledArea = ((bbox.width() / 2) * (bbox.height() / 2))
        val colorDiversity = (uniqueColors.size.toFloat() / sampledArea.toFloat()) * 255f
        
        return colorDiversity.toInt().coerceIn(0, 255)
    }
    
    // 🔍 Helper: Calculate noise level
    private fun calculateNoiseLevel(bitmap: Bitmap, bbox: Rect): Double {
        val noiseValues = mutableListOf<Double>()
        
        // Sample in uniform areas (where we expect smoothness)
        for (y in bbox.top until bbox.bottom - 1 step 4) {
            for (x in bbox.left until bbox.right - 1 step 4) {
                if (x + 1 < bitmap.width && y + 1 < bitmap.height) {
                    val pixel1 = bitmap.getPixel(x, y)
                    val pixel2 = bitmap.getPixel(x + 1, y)
                    val pixel3 = bitmap.getPixel(x, y + 1)
                    
                    val gray1 = (Color.red(pixel1) + Color.green(pixel1) + Color.blue(pixel1)) / 3
                    val gray2 = (Color.red(pixel2) + Color.green(pixel2) + Color.blue(pixel2)) / 3
                    val gray3 = (Color.red(pixel3) + Color.green(pixel3) + Color.blue(pixel3)) / 3
                    
                    val localVariation = abs(gray1 - gray2) + abs(gray1 - gray3)
                    noiseValues.add(localVariation.toDouble())
                }
            }
        }
        
        return if (noiseValues.isNotEmpty()) noiseValues.average() else 0.0
    }
    
    // 🔍 Helper: Calculate contrast quality
    private fun calculateContrastQuality(bitmap: Bitmap, bbox: Rect): Double {
        val pixels = mutableListOf<Int>()
        
        for (y in bbox.top until bbox.bottom step 3) {
            for (x in bbox.left until bbox.right step 3) {
                if (x < bitmap.width && y < bitmap.height) {
                    val pixel = bitmap.getPixel(x, y)
                    val gray = (Color.red(pixel) + Color.green(pixel) + Color.blue(pixel)) / 3
                    pixels.add(gray)
                }
            }
        }
        
        if (pixels.size < 2) return 0.0
        
        val sorted = pixels.sorted()
        val p10 = sorted[(pixels.size * 0.10).toInt()]
        val p90 = sorted[(pixels.size * 0.90).toInt()]
        
        return (p90 - p10).toDouble()
    }
    
    // 🔍 Helper: Calculate color accuracy (skin tone detection)
    private fun calculateColorAccuracy(bitmap: Bitmap, bbox: Rect): Float {
        var validSkinTones = 0
        var totalSamples = 0
        
        for (y in bbox.top until bbox.bottom step 4) {
            for (x in bbox.left until bbox.right step 4) {
                if (x < bitmap.width && y < bitmap.height) {
                    val pixel = bitmap.getPixel(x, y)
                    val r = Color.red(pixel)
                    val g = Color.green(pixel)
                    val b = Color.blue(pixel)
                    
                    // Skin tone heuristic: R > G > B, with reasonable ratios
                    if (r > g && g > b && r > 60 && 
                        (r.toFloat() / g.toFloat()) in 1.1f..1.9f &&
                        (g.toFloat() / b.toFloat()) in 1.1f..2.5f) {
                        validSkinTones++
                    }
                    totalSamples++
                }
            }
        }
        
        return if (totalSamples > 0) validSkinTones.toFloat() / totalSamples.toFloat() else 0f
    }
    
    // 🔍 Helper: Detect chromatic aberration (color fringing)
    private fun detectChromaticAberration(bitmap: Bitmap, bbox: Rect): Double {
        var aberrationSum = 0.0
        var count = 0
        
        // Check edges where chromatic aberration is most visible
        for (y in bbox.top until bbox.bottom step 5) {
            for (x in bbox.left until bbox.right - 2 step 5) {
                if (x + 2 < bitmap.width && y < bitmap.height) {
                    val pixel1 = bitmap.getPixel(x, y)
                    val pixel2 = bitmap.getPixel(x + 2, y)
                    
                    // Check color channel differences
                    val rDiff = abs(Color.red(pixel1) - Color.red(pixel2))
                    val gDiff = abs(Color.green(pixel1) - Color.green(pixel2))
                    val bDiff = abs(Color.blue(pixel1) - Color.blue(pixel2))
                    
                    // Chromatic aberration shows as unequal channel shifts
                    val channelVariance = abs(rDiff - gDiff) + abs(gDiff - bDiff) + abs(bDiff - rDiff)
                    aberrationSum += channelVariance
                    count++
                }
            }
        }
        
        return if (count > 0) aberrationSum / count else 0.0
    }
   
    // High quality logic (original adaptive) - FIXED: Select max score instead of closest to 0.5
    private fun runNormalAdaptiveLogic(bitmap: Bitmap, face: Face, qualityInfo: CameraQualityInfo): LivenessResult {
        val allScores = mutableMapOf<String, Float>()
     
        val methods = listOf(
            "method1_0to1" to ::preprocessMethod1,
            "method2_neg1to1" to ::preprocessMethod2,
            "method3_imagenet" to ::preprocessMethod3
        )
     
        for ((methodName, preprocessFunc) in methods) {
            try {
                val padding = (face.boundingBox.width() * 0.25f).toInt()
                val left = (face.boundingBox.left - padding).coerceAtLeast(0)
                val top = (face.boundingBox.top - padding).coerceAtLeast(0)
                val right = (face.boundingBox.right + padding).coerceAtMost(bitmap.width)
                val bottom = (face.boundingBox.bottom + padding).coerceAtMost(bitmap.height)
             
                val faceCrop = Bitmap.createBitmap(bitmap, left, top, right - left, bottom - top)
             
                val input = preprocessFunc(faceCrop)
             
                val outputShape = antiSpoofInterpreter!!.getOutputTensor(0).shape()
                val outputSize = if (outputShape.size > 1) outputShape[1] else 1
                val output = Array(1) { FloatArray(outputSize) }
             
                antiSpoofInterpreter!!.run(input, output)
             
                val score = parseModelOutput(output[0], outputSize, methodName)
                allScores[methodName] = score
             
                println("📊 $methodName => score=${"%.4f".format(score)}")
             
            } catch (e: Exception) {
                println("⚠️ $methodName failed: ${e.message}")
            }
        }
     
        if (allScores.isEmpty()) {
            throw Exception("All preprocessing methods failed")
        }
     
        // 🎯 STEP 3: Get adaptive thresholds based on camera quality
        val thresholds = getAdaptiveThresholds(qualityInfo.score)
        println("🎯 Adaptive Thresholds for ${qualityInfo.category}:")
        println("  High: ${"%.4f".format(thresholds.high)}")
        println("  Medium: ${"%.4f".format(thresholds.medium)}")
        println("  Low: ${"%.4f".format(thresholds.low)}")
     
        // 🎯 STEP 4: Select BEST method as MAX real score
        val finalScore = allScores.values.maxOrNull() ?: 0f
        val bestMethod = allScores.maxByOrNull { it.value }?.key ?: "unknown"
     
        println("🎯 Best Method: $bestMethod (max score)")
        println("🎯 Final Score: ${"%.4f".format(finalScore)}")
     
        // 🎯 STEP 5: Make adaptive decision
        val decision = makeAdaptiveDecision(
            finalScore = finalScore,
            allScores = allScores,
            qualityInfo = qualityInfo,
            thresholds = thresholds,
            bitmap = bitmap,
            face = face
        )
     
        Log.i(TAG, "========================================")
        Log.i(TAG, "🎯 FINAL DECISION:")
        Log.i(TAG, "  IsLive: ${decision.isLive}")
        Log.i(TAG, "  Score: ${"%.4f".format(decision.score)}")
        Log.i(TAG, "  Label: ${decision.label}")
        Log.i(TAG, "  Confidence: ${decision.confidence}")
        Log.i(
            TAG,
            "  Camera: ${qualityInfo.category} (${"%.1f".format(qualityInfo.score)}/100)"
        )
        Log.i(TAG, "========================================")
     
        return decision.copy(
            cameraQuality = qualityInfo.score,
            qualityCategory = qualityInfo.category,
            debugInfo = "method=$bestMethod, quality=${"%.1f".format(qualityInfo.score)}, category=${qualityInfo.category}, mode=high_quality",
            allScores = allScores
        )
    }
   
    // Medium-low quality logic (lenient thresholds) - FIXED: Select max score
    private fun runAdaptiveWithLenientThresholds(bitmap: Bitmap, face: Face, qualityInfo: CameraQualityInfo): LivenessResult {
        val allScores = mutableMapOf<String, Float>()
     
        val methods = listOf(
            "method1_0to1" to ::preprocessMethod1,
            "method2_neg1to1" to ::preprocessMethod2,
            "method3_imagenet" to ::preprocessMethod3
        )
     
        for ((methodName, preprocessFunc) in methods) {
            try {
                val padding = (face.boundingBox.width() * 0.25f).toInt()
                val left = (face.boundingBox.left - padding).coerceAtLeast(0)
                val top = (face.boundingBox.top - padding).coerceAtLeast(0)
                val right = (face.boundingBox.right + padding).coerceAtMost(bitmap.width)
                val bottom = (face.boundingBox.bottom + padding).coerceAtMost(bitmap.height)
             
                val faceCrop = Bitmap.createBitmap(bitmap, left, top, right - left, bottom - top)
             
                val input = preprocessFunc(faceCrop)
             
                val outputShape = antiSpoofInterpreter!!.getOutputTensor(0).shape()
                val outputSize = if (outputShape.size > 1) outputShape[1] else 1
                val output = Array(1) { FloatArray(outputSize) }
             
                antiSpoofInterpreter!!.run(input, output)
             
                val score = parseModelOutput(output[0], outputSize, methodName)
                allScores[methodName] = score
             
                println("📊 $methodName => score=${"%.4f".format(score)}")
             
            } catch (e: Exception) {
                println("⚠️ $methodName failed: ${e.message}")
            }
        }
     
        if (allScores.isEmpty()) {
            throw Exception("All preprocessing methods failed")
        }
     
        val thresholds = getAdaptiveThresholds(qualityInfo.score)
        val finalScore = allScores.values.maxOrNull() ?: 0f
        val bestMethod = allScores.maxByOrNull { it.value }?.key ?: "unknown"
     
        val decision = makeAdaptiveDecision(
            finalScore = finalScore,
            allScores = allScores,
            qualityInfo = qualityInfo,
            thresholds = thresholds,
            bitmap = bitmap,
            face = face
        )
     
        return decision.copy(
            cameraQuality = qualityInfo.score,
            qualityCategory = qualityInfo.category,
            debugInfo = "method=$bestMethod, quality=${"%.1f".format(qualityInfo.score)}, category=${qualityInfo.category}, mode=medium_low",
            allScores = allScores
        )
    }
   
    // Very low quality: Heuristic fallback - ENHANCED: More lenient for poor cameras
    private fun runHeuristicFallback(bitmap: Bitmap, face: Face, qualityInfo: CameraQualityInfo): LivenessResult {
        println("🔄 VERY LOW QUALITY MODE: Using heuristic fallback")
        val bbox = face.boundingBox
        var heuristicScore = 0f
     
        // Texture (30%) - Lowered threshold for poor cameras
        val textureScore = calculateTextureVariance(bitmap, bbox)
        val textureThreshold = if (qualityInfo.score < 25) 2.0 else 3.0
        val texturePass = textureScore > textureThreshold
        if (texturePass) heuristicScore += 0.30f
     
        // Color naturalness (25%) - Lowered threshold
        val colorScore = calculateColorNaturalness(bitmap, bbox)
        val colorThreshold = if (qualityInfo.score < 25) 0.01 else 0.02
        val colorPass = colorScore > colorThreshold
        if (colorPass) heuristicScore += 0.25f
     
        // Sharpness (20%) - Adjusted for low quality
        val sharpness = calculateSharpness(bitmap, bbox)
        val sharpnessThreshold = if (qualityInfo.score < 25) 1.5 else 2.0
        val sharpnessPass = sharpness > sharpnessThreshold
        if (sharpnessPass) heuristicScore += 0.20f
     
        // Tracking (15%)
        if (face.trackingId != null) heuristicScore += 0.15f
     
        // Eyes open (10%) - More lenient
        if (face.leftEyeOpenProbability != null && face.rightEyeOpenProbability != null) {
            val eyeThreshold = if (qualityInfo.score < 25) 0.2f else 0.3f
            if (face.leftEyeOpenProbability!! > eyeThreshold && face.rightEyeOpenProbability!! > eyeThreshold) {
                heuristicScore += 0.10f
            }
        }
     
        // Lower overall threshold for very poor quality
        val overallThreshold = if (qualityInfo.score < 25) 0.40f else 0.50f
        val isLive = heuristicScore > overallThreshold
        val label = if (isLive) "Real Face (Low-end device mode)" else "Heuristic fail"
        val confidence = if (heuristicScore > 0.60f) "medium" else "low"
     
        println("📊 Heuristic Score: ${"%.2f".format(heuristicScore)} - IsLive: $isLive (threshold: $overallThreshold)")
     
        return LivenessResult(
            isLive = isLive,
            score = heuristicScore,
            label = label,
            confidence = confidence,
            cameraQuality = qualityInfo.score,
            qualityCategory = qualityInfo.category,
            debugInfo = "mode=heuristic_fallback, score=${"%.2f".format(heuristicScore)}, threshold=$overallThreshold",
            allScores = emptyMap()
        )
    }
   
    // 🎯 Get adaptive thresholds based on camera quality - ADJUSTED: More lenient for poor/fair cameras
    private fun getAdaptiveThresholds(cameraQuality: Float): AdaptiveThresholds {
        return when {
            cameraQuality >= 85 -> AdaptiveThresholds(
                high = 0.0075f,
                medium = 0.0065f,
                low = 0.0058f
            )
            cameraQuality >= 70 -> AdaptiveThresholds(
                high = 0.0065f,
                medium = 0.0058f,
                low = 0.0050f
            )
            cameraQuality >= 55 -> AdaptiveThresholds(
                high = 0.0055f,
                medium = 0.0048f,
                low = 0.0040f
            )
            cameraQuality >= 40 -> AdaptiveThresholds(
                high = 0.0038f,
                medium = 0.0028f,
                low = 0.0018f
            )
            cameraQuality >= 25 -> AdaptiveThresholds(
                high = 0.0028f,
                medium = 0.0018f,
                low = 0.0008f
            )
            else -> AdaptiveThresholds(
                high = 0.0020f,
                medium = 0.0010f,
                low = 0.0005f
            )
        }
    }
   
    // 🎯 Make adaptive decision based on camera quality - ENHANCED: Better handling for poor quality consensus and fallbacks
    private fun makeAdaptiveDecision(
        finalScore: Float,
        allScores: Map<String, Float>,
        qualityInfo: CameraQualityInfo,
        thresholds: AdaptiveThresholds,
        bitmap: Bitmap,
        face: Face
    ): LivenessResult {
     
        val quality = qualityInfo.score
     
        // 🚨 SPECIAL CASE: Very poor quality - more accepting if any signal
        if (quality < 30 && finalScore > 0.0005f) {
            return LivenessResult(
                isLive = true,
                score = finalScore,
                label = "Real Face (Low-end device mode)",
                confidence = "low"
            )
        }
     
        // 🚨 EXCELLENT QUALITY MODE (85-100): Extra strict
        if (quality >= 85) {
            println("🚨 EXCELLENT QUALITY MODE - Extra strict checks")
         
            // Require ALL methods to agree
            val allAboveLow = allScores.values.all { it > thresholds.low }
            if (!allAboveLow) {
                return LivenessResult(
                    isLive = false,
                    score = finalScore,
                    label = "Spoof Detected - High-quality camera inconsistency",
                    confidence = "high"
                )
            }
         
            // Check score variance
            val variance = calculateScoreVariance(allScores.values.toList())
            if (variance > 0.003f) {
                return LivenessResult(
                    isLive = false,
                    score = finalScore,
                    label = "Spoof Detected - Inconsistent responses",
                    confidence = "high"
                )
            }
        }
     
        // Strategy 1: High confidence
        if (finalScore > thresholds.high) {
            return LivenessResult(
                isLive = true,
                score = finalScore,
                label = "Real Face Detected",
                confidence = "high"
            )
        }
     
        // Strategy 2: Medium confidence
        if (finalScore > thresholds.medium) {
            return LivenessResult(
                isLive = true,
                score = finalScore,
                label = "Real Face Detected",
                confidence = "medium"
            )
        }
     
        // Strategy 3: Consensus voting (quality-adaptive) - ENHANCED: More lenient votes for poor quality
        if (finalScore > thresholds.low) {
            val realVotes = allScores.values.count { it > thresholds.low }
            val totalVotes = allScores.size
         
            val requiredVotes = when {
                quality >= 70 -> totalVotes
                quality >= 55 -> totalVotes - 1  // Allow 1 disagreement
                quality >= 40 -> 2  // Lenient for fair/poor
                else -> 1  // Very lenient for very poor
            }
         
            if (realVotes >= requiredVotes) {
                return LivenessResult(
                    isLive = true,
                    score = finalScore,
                    label = "Real Face Detected - Consensus ($realVotes/$totalVotes)",
                    confidence = when {
                        quality >= 70 -> "high"
                        quality >= 55 -> "medium"
                        quality >= 40 -> "low"
                        else -> "very_low"
                    }
                )
            } else if (quality >= 70) {
                return LivenessResult(
                    isLive = false,
                    score = finalScore,
                    label = "Spoof Detected - Consensus failed",
                    confidence = "high"
                )
            }
        }
     
        // Strategy 4: Quality-based fallback for uncertain zone - ENHANCED: Lower thresholds for poor
        if (finalScore > 0.0010f) {
            val qualityResult = performEnhancedQualityChecks(bitmap, face, quality)
         
            val qualityThreshold = when {
                quality >= 85 -> 0.85f
                quality >= 70 -> 0.75f
                quality >= 55 -> 0.65f
                quality >= 40 -> 0.50f
                else -> 0.35f
            }
         
            if (qualityResult.score > qualityThreshold) {
                return LivenessResult(
                    isLive = true,
                    score = finalScore,
                    label = "Real Face Detected - Quality verified",
                    confidence = "low"
                )
            }
         
            if (quality < 30 && qualityResult.score > 0.30f) {
                return LivenessResult(
                    isLive = true,
                    score = finalScore,
                    label = "Real Face Detected - Low-quality camera mode",
                    confidence = "low"
                )
            }
        }
     
        // Strategy 5: Clear rejection - Adjusted: Higher upper bound for rejection in poor quality
        val rejectionUpper = if (quality < 40) 0.80f else 0.70f
        if (finalScore < 0.0010f || finalScore > rejectionUpper) {
            return LivenessResult(
                isLive = false,
                score = finalScore,
                label = "Spoof Detected",
                confidence = "high"
            )
        }
     
        // Default: Reject uncertain in good quality, accept in poor
        val defaultAccept = quality < 40
        return LivenessResult(
            isLive = defaultAccept,
            score = finalScore,
            label = if (defaultAccept) "Real Face Detected - Poor quality accept" else "Spoof Detected - Medium confidence",
            confidence = if (defaultAccept) "low" else "medium"
        )
    }
   
    private fun calculateScoreVariance(scores: List<Float>): Float {
        if (scores.isEmpty()) return 0f
        val mean = scores.average().toFloat()
        return scores.map { (it - mean) * (it - mean) }.average().toFloat()
    }
   
    private fun performEnhancedQualityChecks(
        bitmap: Bitmap,
        face: Face,
        cameraQuality: Float
    ): LivenessResult {
        val bbox = face.boundingBox
        var qualityScore = 0f
     
        val textureScore = calculateTextureVariance(bitmap, bbox)
        val texturePass = when {
            cameraQuality >= 70 -> textureScore > 12.0
            cameraQuality >= 50 -> textureScore > 8.0
            cameraQuality >= 40 -> textureScore > 6.0
            else -> textureScore > 3.0
        }
        if (texturePass) qualityScore += 0.30f
     
        val colorScore = calculateColorNaturalness(bitmap, bbox)
        val colorPass = when {
            cameraQuality >= 70 -> colorScore > 0.15
            cameraQuality >= 50 -> colorScore > 0.10
            cameraQuality >= 40 -> colorScore > 0.07
            else -> colorScore > 0.03
        }
        if (colorPass) qualityScore += 0.25f
     
        val sharpness = calculateSharpness(bitmap, bbox)
        val sharpnessPass = when {
            cameraQuality >= 70 -> sharpness >= 15.0
            cameraQuality >= 50 -> sharpness >= 8.0
            cameraQuality >= 40 -> sharpness >= 5.0
            else -> sharpness >= 2.0
        }
        if (sharpnessPass) qualityScore += 0.20f
     
        if (face.trackingId != null) qualityScore += 0.15f
     
        if (face.leftEyeOpenProbability != null && face.rightEyeOpenProbability != null) {
            val eyeThreshold = if (cameraQuality < 40) 0.2f else 0.3f
            if (face.leftEyeOpenProbability!! > eyeThreshold && face.rightEyeOpenProbability!! > eyeThreshold) {
                qualityScore += 0.10f
            }
        }
     
        return LivenessResult(
            isLive = qualityScore > 0.6f,
            score = qualityScore,
            label = "Quality Check",
            confidence = when {
                qualityScore > 0.75f -> "high"
                qualityScore > 0.60f -> "medium"
                else -> "low"
            }
        )
    }
   
    private fun parseModelOutput(output: FloatArray, size: Int, methodName: String): Float {
        return when (size) {
            1 -> output[0]
            2 -> {
                val maxVal = Math.max(output[0], output[1])
                val exp0 = exp(output[0] - maxVal)
                val exp1 = exp(output[1] - maxVal)
                val prob1 = exp1 / (exp0 + exp1)
                prob1
            }
            3 -> {
                val maxVal = Math.max(Math.max(output[0], output[1]), output[2])
                val exp0 = exp(output[0] - maxVal)
                val exp1 = exp(output[1] - maxVal)
                val exp2 = exp(output[2] - maxVal)
                val prob1 = exp1 / (exp0 + exp1 + exp2)
                prob1
            }
            else -> output[0]
        }
    }
   
    // METHOD 1: [0, 1] normalization
    private fun preprocessMethod1(bitmap: Bitmap): Array<Array<Array<FloatArray>>> {
        val resized = Bitmap.createScaledBitmap(bitmap, antiSpoofInputSize, antiSpoofInputSize, true)
        val input = Array(1) { Array(antiSpoofInputSize) { Array(antiSpoofInputSize) { FloatArray(3) } } }
        for (y in 0 until antiSpoofInputSize) {
            for (x in 0 until antiSpoofInputSize) {
                val pixel = resized.getPixel(x, y)
                input[0][y][x][0] = Color.red(pixel) / 255f
                input[0][y][x][1] = Color.green(pixel) / 255f
                input[0][y][x][2] = Color.blue(pixel) / 255f
            }
        }
        if (resized != bitmap) resized.recycle()
        return input
    }
   
    // METHOD 2: [-1, 1] normalization
    private fun preprocessMethod2(bitmap: Bitmap): Array<Array<Array<FloatArray>>> {
        val resized = Bitmap.createScaledBitmap(bitmap, antiSpoofInputSize, antiSpoofInputSize, true)
        val input = Array(1) { Array(antiSpoofInputSize) { Array(antiSpoofInputSize) { FloatArray(3) } } }
        for (y in 0 until antiSpoofInputSize) {
            for (x in 0 until antiSpoofInputSize) {
                val pixel = resized.getPixel(x, y)
                input[0][y][x][0] = (Color.red(pixel) - 127.5f) / 127.5f
                input[0][y][x][1] = (Color.green(pixel) - 127.5f) / 127.5f
                input[0][y][x][2] = (Color.blue(pixel) - 127.5f) / 127.5f
            }
        }
        if (resized != bitmap) resized.recycle()
        return input
    }
   
    // METHOD 3: ImageNet normalization
    private fun preprocessMethod3(bitmap: Bitmap): Array<Array<Array<FloatArray>>> {
        val resized = Bitmap.createScaledBitmap(bitmap, antiSpoofInputSize, antiSpoofInputSize, true)
        val input = Array(1) { Array(antiSpoofInputSize) { Array(antiSpoofInputSize) { FloatArray(3) } } }
        for (y in 0 until antiSpoofInputSize) {
            for (x in 0 until antiSpoofInputSize) {
                val pixel = resized.getPixel(x, y)
                input[0][y][x][0] = (Color.red(pixel) / 255f - 0.485f) / 0.229f
                input[0][y][x][1] = (Color.green(pixel) / 255f - 0.456f) / 0.224f
                input[0][y][x][2] = (Color.blue(pixel) / 255f - 0.406f) / 0.225f
            }
        }
        if (resized != bitmap) resized.recycle()
        return input
    }
   
    private fun calculateTextureVariance(bitmap: Bitmap, bbox: Rect): Double {
        val pixels = mutableListOf<Int>()
        for (y in bbox.top until bbox.bottom step 3) {
            for (x in bbox.left until bbox.right step 3) {
                if (x < bitmap.width && y < bitmap.height) {
                    val pixel = bitmap.getPixel(x, y)
                    val gray = (Color.red(pixel) + Color.green(pixel) + Color.blue(pixel)) / 3
                    pixels.add(gray)
                }
            }
        }
        if (pixels.size < 2) return 0.0
        val mean = pixels.average()
        val variance = pixels.map { (it - mean) * (it - mean) }.average()
        return sqrt(variance)
    }
   
    private fun calculateColorNaturalness(bitmap: Bitmap, bbox: Rect): Double {
        var rSum = 0.0
        var gSum = 0.0
        var bSum = 0.0
        var count = 0
     
        for (y in bbox.top until bbox.bottom step 4) {
            for (x in bbox.left until bbox.right step 4) {
                if (x < bitmap.width && y < bitmap.height) {
                    val pixel = bitmap.getPixel(x, y)
                    rSum += Color.red(pixel)
                    gSum += Color.green(pixel)
                    bSum += Color.blue(pixel)
                    count++
                }
            }
        }
     
        if (count == 0) return 0.0
        val rAvg = rSum / count / 255.0
        val gAvg = gSum / count / 255.0
        val bAvg = bSum / count / 255.0
     
        return sqrt((rAvg - gAvg) * (rAvg - gAvg) + (gAvg - bAvg) * (gAvg - bAvg) + (bAvg - rAvg) * (bAvg - rAvg)) / 3.0
    }
   
    private fun checkFaceQuality(face: Face, bitmap: Bitmap): String? {
        val bbox = face.boundingBox
        if (bbox.width() < MIN_FACE_SIZE || bbox.height() < MIN_FACE_SIZE) {
            return "Face too small (move closer)"
        }
        val margin = 20
        if (bbox.left < margin || bbox.top < margin ||
            bbox.right > bitmap.width - margin ||
            bbox.bottom > bitmap.height - margin) {
            return "Face too close to edge"
        }
        val headEulerAngleY = face.headEulerAngleY
        val headEulerAngleZ = face.headEulerAngleZ
        if (abs(headEulerAngleY) > 20) {
            return "Face not frontal (turn face towards camera)"
        }
        if (abs(headEulerAngleZ) > 15) {
            return "Head tilted too much"
        }
        val avgBrightness = calculateAverageBrightness(bitmap, bbox)
        if (avgBrightness < MIN_BRIGHTNESS) {
            return "Too dark (need better lighting)"
        }
        if (avgBrightness > MAX_BRIGHTNESS) {
            return "Too bright (reduce lighting)"
        }
        if (face.leftEyeOpenProbability != null && face.rightEyeOpenProbability != null) {
            val leftEyeOpen = face.leftEyeOpenProbability!! > 0.5
            val rightEyeOpen = face.rightEyeOpenProbability!! > 0.5
         
            if (!leftEyeOpen || !rightEyeOpen) {
                return "Please open your eyes" 
            }
        }
        val sharpness = calculateSharpness(bitmap, bbox)
        val minSharpnessThreshold = if (avgBrightness > 180) 5.0 else 8.0
        if (sharpness < minSharpnessThreshold) {
            return "Image too blurry (hold steady)"
        }
        println("🔍 Sharpness: ${"%.2f".format(sharpness)} | Brightness: $avgBrightness")
        return null
    }
   
    private fun expandBoundingBox(bbox: Rect, bitmap: Bitmap, margin: Float): Rect {
        val expandX = (bbox.width() * margin).toInt()
        val expandY = (bbox.height() * margin).toInt()
        return Rect(
            (bbox.left - expandX).coerceAtLeast(0),
            (bbox.top - expandY).coerceAtLeast(0),
            (bbox.right + expandX).coerceAtMost(bitmap.width),
            (bbox.bottom + expandY).coerceAtMost(bitmap.height)
        )
    }
   
    private fun calculateAverageBrightness(bitmap: Bitmap, bbox: Rect): Int {
        var totalBrightness = 0
        var pixelCount = 0
        for (y in bbox.top until bbox.bottom step 5) {
            for (x in bbox.left until bbox.right step 5) {
                val pixel = bitmap.getPixel(x, y)
                val brightness = (Color.red(pixel) + Color.green(pixel) + Color.blue(pixel)) / 3
                totalBrightness += brightness
                pixelCount++
            }
        }
        return if (pixelCount > 0) totalBrightness / pixelCount else 0
    }
   
    private fun calculateSharpness(bitmap: Bitmap, bbox: Rect): Double {
        var variance = 0.0
        val pixels = mutableListOf<Int>()
        for (y in bbox.top until bbox.bottom.coerceAtMost(bitmap.height)) {
            for (x in bbox.left until bbox.right.coerceAtMost(bitmap.width)) {
                val pixel = bitmap.getPixel(x, y)
                val gray = (Color.red(pixel) + Color.green(pixel) + Color.blue(pixel)) / 3
                pixels.add(gray)
            }
        }
        if (pixels.size < 2) return 0.0
        val mean = pixels.average()
        variance = pixels.map { (it - mean) * (it - mean) }.average()
        return variance
    }
   
    private fun preprocessImage(bitmap: Bitmap): Array<Array<Array<FloatArray>>> {
        val resized = Bitmap.createScaledBitmap(bitmap, inputSize, inputSize, true)
        val input = Array(1) { Array(inputSize) { Array(inputSize) { FloatArray(3) } } }
        for (y in 0 until inputSize) {
            for (x in 0 until inputSize) {
                val pixel = resized.getPixel(x, y)
                input[0][y][x][0] = (Color.red(pixel) - 127.5f) / 128f
                input[0][y][x][1] = (Color.green(pixel) - 127.5f) / 128f
                input[0][y][x][2] = (Color.blue(pixel) - 127.5f) / 128f
            }
        }
        if (resized != bitmap) resized.recycle()
        return input
    }
   
    private fun getEmbedding(bitmap: Bitmap): FloatArray? {
        val input = preprocessImage(bitmap)
        val output = Array(1) { FloatArray(embeddingSize) }
        faceNetInterpreter?.run(input, output)
        val normalized = normalizeEmbedding(output[0])
        return normalized
    }
   
    private fun normalizeEmbedding(embedding: FloatArray): FloatArray {
        var norm = 0f
        embedding.forEach { norm += it * it }
        norm = sqrt(norm)
        if (norm == 0f) return embedding
        val result = FloatArray(embedding.size)
        for (i in embedding.indices) result[i] = embedding[i] / norm
        return result
    }
   
    private fun cosineSimilarity(a: FloatArray, b: FloatArray): Float {
        var dot = 0f
        for (i in a.indices) {
            dot += a[i] * b[i]
        }
        return dot.coerceIn(-1f, 1f)
    }
   
    @ReactMethod
    fun captureAndGetEmbedding(imageBase64: String, promise: Promise) {
        Thread {
            try {
                val bitmap = decodeBase64ToBitmap(imageBase64)
                    ?: throw Exception("Failed to decode image")
               
                detectAndCropFace(bitmap) { croppedFace, face, error, livenessResult ->
                    if (error != null) {
                        reactApplicationContext.runOnUiQueueThread {
                            promise.reject("QUALITY_ERROR", error)
                        }
                        return@detectAndCropFace
                    }
                    if (croppedFace == null) {
                        reactApplicationContext.runOnUiQueueThread {
                            promise.reject("NO_FACE", "No face detected")
                        }
                        return@detectAndCropFace
                    }
                   
                    val embedding = getEmbedding(croppedFace)
                        ?: throw Exception("Failed to extract embedding")
                   
                    // Convert cropped face to base64
                    val croppedFaceBase64 = bitmapToBase64(croppedFace)
                   
                    val embeddingArray = Arguments.createArray()
                    embedding.forEach { embeddingArray.pushDouble(it.toDouble()) }
                   
                    val result = Arguments.createMap().apply {
                        putArray("embedding", embeddingArray)
                        putString("status", "success")
                        putDouble("faceWidth", face?.boundingBox?.width()?.toDouble() ?: 0.0)
                        putDouble("faceHeight", face?.boundingBox?.height()?.toDouble() ?: 0.0)
                        putString("croppedFaceBase64", croppedFaceBase64)
                     
                        if (livenessResult != null) {
                            putBoolean("isLive", livenessResult.isLive)
                            putDouble("livenessScore", livenessResult.score.toDouble())
                            putString("livenessLabel", livenessResult.label)
                            putString("livenessConfidence", livenessResult.confidence)
                            putDouble("cameraQuality", livenessResult.cameraQuality.toDouble())
                            putString("qualityCategory", livenessResult.qualityCategory)
                            putString("livenessDebug", livenessResult.debugInfo)
                         
                            val scoresMap = Arguments.createMap()
                            livenessResult.allScores.forEach { (method, score) ->
                                scoresMap.putDouble(method, score.toDouble())
                            }
                            putMap("allMethodScores", scoresMap)
                        }
                    }
                   
                    println("✅ Embedding extracted (${embedding.size} dims)")
                    println("✅ Cropped face image prepared (${croppedFaceBase64.length} bytes)")
                    reactApplicationContext.runOnUiQueueThread {
                        promise.resolve(result)
                    }
                }
            } catch (e: Exception) {
                println("❌ FaceNetModule ERROR => ${e.message}")
                reactApplicationContext.runOnUiQueueThread {
                    promise.reject("CAPTURE_ERROR", e.message)
                }
            }
        }.start()
    }
   
    @ReactMethod
    fun matchWithEmbeddings(testImageBase64: String, referenceEmbeddings: ReadableArray, promise: Promise) {
        Thread {
            try {
                val testBitmap = decodeBase64ToBitmap(testImageBase64)
                    ?: throw Exception("Failed to decode test image")
               
                detectAndCropFace(testBitmap) { testFace, face, error, livenessResult ->
                    if (error != null) {
                        reactApplicationContext.runOnUiQueueThread {
                            promise.reject("QUALITY_ERROR", error)
                        }
                        return@detectAndCropFace
                    }
                    if (testFace == null) {
                        reactApplicationContext.runOnUiQueueThread {
                            promise.reject("NO_FACE", "No face detected in test image")
                        }
                        return@detectAndCropFace
                    }
                   
                    val testEmbedding = getEmbedding(testFace)
                        ?: throw Exception("Failed to extract test embedding")
                   
                    // Convert cropped face to base64
                    val croppedFaceBase64 = bitmapToBase64(testFace)
                   
                    val refEmbeddings = mutableListOf<FloatArray>()
                 
                    for (i in 0 until referenceEmbeddings.size()) {
                        val embArray = referenceEmbeddings.getArray(i)
                        if (embArray != null && embArray.size() == embeddingSize) {
                            val embedding = FloatArray(embeddingSize)
                            for (j in 0 until embeddingSize) {
                                embedding[j] = embArray.getDouble(j).toFloat()
                            }
                            refEmbeddings.add(embedding)
                        }
                    }
                   
                    if (refEmbeddings.isEmpty()) {
                        reactApplicationContext.runOnUiQueueThread {
                            promise.reject("NO_EMBEDDINGS", "No valid reference embeddings provided")
                        }
                        return@detectAndCropFace
                    }
                   
                    val similarities = refEmbeddings.map { refEmb ->
                        cosineSimilarity(testEmbedding, refEmb)
                    }
                    val maxSimilarity = similarities.maxOrNull() ?: 0f
                    val avgSimilarity = similarities.average().toFloat()
                    val isMatch = maxSimilarity >= MATCH_THRESHOLD
                    val matchStatus = if (isMatch) "MATCH_FOUND" else "MATCH_NOT_FOUND"
                 
                    val confidence = when {
                        maxSimilarity >= HIGH_CONFIDENCE_THRESHOLD -> "high"
                        maxSimilarity >= MATCH_THRESHOLD -> "medium"
                        else -> "low"
                    }
                   
                    println("========================================")
                    println("🎯 MATCH RESULTS:")
                    println("Status: $matchStatus")
                    println("Max Similarity: $maxSimilarity")
                    println("Avg Similarity: $avgSimilarity")
                    println("Confidence: $confidence")
                    println("Liveness: ${livenessResult?.isLive} (${livenessResult?.qualityCategory})")
                    println("========================================")
                   
                    val result = Arguments.createMap().apply {
                        putBoolean("isMatch", isMatch)
                        putString("matchStatus", matchStatus)
                        putDouble("similarity", maxSimilarity.toDouble())
                        putDouble("avgSimilarity", avgSimilarity.toDouble())
                        putString("confidence", confidence)
                        putDouble("threshold", MATCH_THRESHOLD.toDouble())
                        putInt("referencesCompared", refEmbeddings.size)
                        putString("croppedFaceBase64", croppedFaceBase64)
                     
                        if (livenessResult != null) {
                            putBoolean("isLive", livenessResult.isLive)
                            putDouble("livenessScore", livenessResult.score.toDouble())
                            putString("livenessLabel", livenessResult.label)
                            putString("livenessConfidence", livenessResult.confidence)
                            putDouble("cameraQuality", livenessResult.cameraQuality.toDouble())
                            putString("qualityCategory", livenessResult.qualityCategory)
                            putString("livenessDebug", livenessResult.debugInfo)
                         
                            val scoresMap = Arguments.createMap()
                            livenessResult.allScores.forEach { (method, score) ->
                                scoresMap.putDouble(method, score.toDouble())
                            }
                            putMap("allMethodScores", scoresMap)
                        }
                    }
                   
                    println("✅ Cropped face image prepared (${croppedFaceBase64.length} bytes)")
                    reactApplicationContext.runOnUiQueueThread {
                        promise.resolve(result)
                    }
                }
            } catch (e: Exception) {
                println("❌ FaceNetModule ERROR => ${e.message}")
                reactApplicationContext.runOnUiQueueThread {
                    promise.reject("MATCH_ERROR", e.message)
                }   
            }
        }.start()
    }
   
    @ReactMethod
    fun enrollFace(imageBase64: String, promise: Promise) {
        captureAndGetEmbedding(imageBase64, promise)
    }
   
    override fun onCatalystInstanceDestroy() {
        faceNetInterpreter?.close()
        antiSpoofInterpreter?.close()
        detector.close()
        println("FaceNetModule destroyed")
        super.onCatalystInstanceDestroy()
    }
}