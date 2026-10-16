
// import React, { useState, useEffect, useRef } from 'react';
// import { View, StyleSheet, Text, TouchableOpacity, Platform, NativeModules, Alert, ActivityIndicator, Vibration } from 'react-native';
// import { Camera, useCameraDevices } from 'react-native-vision-camera';
// import RNFS from 'react-native-fs';
// import FaceDetection from '@react-native-ml-kit/face-detection';
// import Theme from 'FaceEmbading/Theme';
// import ImageResizer from 'react-native-image-resizer';
// import { request, openSettings as RNPOpenSettings, PERMISSIONS, RESULTS } from "react-native-permissions";
// import { XIcon } from 'assets/Svg/svg';
// import { ScreenHeight, ScreenWidth } from '@freakycoder/react-native-helpers';
// import Svg, { Rect, Defs, Mask, Ellipse } from "react-native-svg";

// const { FaceNetModule } = NativeModules;

// // Device-specific rotation mapping
// const DEVICE_ROTATION_MAP = {
//   'realme': 0,
//   'oppo': 0,
//   'vivo': 0,
//   'samsung': 0,
//   'xiaomi': 90,
//   'redmi': 90,
//   'poco': 90,
//   'oneplus': 90,
//   'google': 90,
//   'motorola': 90,
//   'moto': 90,
//   'apple': 270,
// };

// // Get device brand
// const getDeviceBrand = () => {
//   try {
//     if (Platform.OS === 'android') {
//       const brand = Platform.constants?.Brand || '';
//       const manufacturer = Platform.constants?.Manufacturer || '';
//       return (brand || manufacturer).toLowerCase();
//     }
//     return 'apple';
//   } catch (e) {
//     return Platform.OS === 'ios' ? 'apple' : 'unknown';
//   }
// };

// // Get rotation angle based on device
// const getRotationForDevice = () => {
//   const brand = getDeviceBrand();
//   console.log('📱 Device Brand:', brand);

//   for (const [key, rotation] of Object.entries(DEVICE_ROTATION_MAP)) {
//     if (brand.includes(key)) {
//       console.log(`🔄 Using ${rotation}° rotation for ${key}`);
//       return rotation;
//     }
//   }

//   const defaultRotation = Platform.OS === 'ios' ? 270 : 0;
//   console.log(`🔄 Using default ${defaultRotation}° rotation`);
//   return defaultRotation;
// };

// export default function FaceCaptureModalforfacnet({ onCapture, closebutton}) {

//   const [faceAligned, setFaceAligned] = useState(false);
//   const [permissionStatus, setPermissionStatus] = useState('loading');
//   const [device, setDevice] = useState(null);
//   const [statusMessage, setStatusMessage] = useState("Align your face within the oval");
//   const [livenessStatus, setLivenessStatus] = useState(null);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [isCheckingLiveness, setIsCheckingLiveness] = useState(false);
//   const [cameraScore, setCameraScore] = useState(0);
//   const [deviceBrand, setDeviceBrand] = useState('');
//   const [retryCount, setRetryCount] = useState(0);
//   const [close, setclose] = useState(false);

//   const cameraRef = useRef(null);
//   const devices = useCameraDevices();

//   const processingRef = useRef(false);
//   const capturedRef = useRef(false);

//   /* ---------------- DETECT DEVICE ---------------- */
//   useEffect(() => {
//     const brand = getDeviceBrand();
//     setDeviceBrand(brand);
//   }, []);

//   /* ---------------- CAMERA QUALITY ---------------- */
//   function getCameraQualityPercentage(device) {
//     if (!device?.formats?.length) return 0;

//     let score = 0;

//     const resolutions = device.formats
//       .filter(f => f?.videoWidth && f?.videoHeight)
//       .map(f => f.videoWidth * f.videoHeight);

//     const maxPixels = resolutions.length ? Math.max(...resolutions) : 0;
//     const resolutionScore = Math.min(35, (maxPixels / 8_000_000) * 35);
//     score += resolutionScore;

//     const fpsValues = device.formats.flatMap(f =>
//       Array.isArray(f.frameRateRanges)
//         ? f.frameRateRanges.map(r => r.maxFrameRate || 0)
//         : []
//     );

//     const maxFps = fpsValues.length ? Math.max(...fpsValues) : 0;
//     const fpsScore = Math.min(25, (maxFps / 60) * 25);
//     score += fpsScore;

//     if (device.hardwareLevel === 'LEVEL_3') score += 15;
//     else if (device.hardwareLevel?.toLowerCase() === 'full') score += 12;
//     else if (device.hardwareLevel === 'LIMITED') score += 7;

//     const zoomScore = Math.min(10, ((device.maxZoom || 1) / 10) * 10);
//     score += zoomScore;

//     const formatScore = Math.min(15, (device.formats.length / 300) * 15);
//     score += formatScore;

//     return Math.round(Math.min(100, score));
//   }

//   useEffect(() => {
//     setclose(closebutton);
//     console.log("closebutton",closebutton);
//     if (device) {
//       const quality = getCameraQualityPercentage(device);
//       setCameraScore(quality);
//       console.log(`📱 Camera Quality: ${quality}/100`);
//     }
//   }, [device]);

//   /* ---------------- PERMISSION ---------------- */
//   useEffect(() => { 
//     (async () => {
//       try {
//         const status = Camera.getCameraPermissionStatus();
//         if (status === 'not-determined') {
//           const req = await Camera.requestCameraPermission();
//           setPermissionStatus(req);
//         } else {
//           setPermissionStatus(status);
//         }
//       } catch {
//         setPermissionStatus("denied");
//       }
//     })();
//   }, []);

//   async function askCameraPermission() {
//     const permission =
//       Platform.OS === "ios"
//         ? PERMISSIONS.IOS.CAMERA
//         : PERMISSIONS.ANDROID.CAMERA;

//     const result = await request(permission);
//     if (result === RESULTS.GRANTED) {
//       setPermissionStatus("granted");
//     } else {
//       RNPOpenSettings();
//       onCapture("");
//     }
//   }

//   useEffect(() => {
//     if (!devices) return;

//     if (permissionStatus === "granted" || permissionStatus === "authorized") {
//       const front = devices.find(d => d.position === "front") || devices[0];
//       setDevice(front);
//     }

//     if (permissionStatus === "denied") askCameraPermission();
//   }, [permissionStatus, devices]);

//   /* ---------------- FACE DETECTION LOOP ---------------- */
//   useEffect(() => {
//     if (!device || !cameraRef.current) return;

//     const interval = setInterval(async () => {
//       if (processingRef.current || capturedRef.current || isCapturing) return;
//       processingRef.current = true;

//       let snapshotPath;

//       try {
//         const snap = await cameraRef.current.takeSnapshot({
//           quality: 0.5,
//           skipMetadata: true,
//         });

//         snapshotPath = snap.path;
//         const uri = "file://" + snap.path;

//         const faces = await FaceDetection.detect(uri, {
//           classificationMode: "all",
//         });

//         if (!faces.length) {
//           setFaceAligned(false);
//           setStatusMessage("Align your face inside the oval.");
//           return;
//         }

//         const face = faces[0];
//         const aligned = isFaceInsideOval(face, snap.width, snap.height);
//         setFaceAligned(aligned);

//         if (aligned) { 
//           // Automatically capture when face is aligned
//           if (!capturedRef.current && !isCapturing) {
//             capturedRef.current = true;
//             setIsCapturing(true);
//             clearInterval(interval);

//             // Small delay for better stability
//             setTimeout(() => capturePhoto(), 300);
//           }
//         } else {
//           setStatusMessage("Align your face inside the oval.");
//         }

//       } catch (e) {
//         console.log("Face detection error:", e);
//       } finally {
//         if (snapshotPath) RNFS.unlink(snapshotPath).catch(() => {});
//         processingRef.current = false;
//       }
//     }, 60);

//     return () => clearInterval(interval);
//   }, [device, isCapturing]);

//   /* ---------------- CAPTURE WITH DEVICE-SPECIFIC ROTATION ---------------- */
//   async function capturePhoto() {
//     const startTime = Date.now();
//     let photoPath = null;

//     try {
//       if (!cameraRef.current) {
//         throw new Error("Camera reference not available");
//       }

//       console.log("========================================");
//       console.log("📸 STARTING CAPTURE PROCESS");
//       console.log("   Device Brand:", deviceBrand);
//       console.log("   Camera Quality:", cameraScore);
//       console.log("   Retry Count:", retryCount);
//       console.log("========================================");

//       setStatusMessage("Capturing image...");

//       // Step 1: Take photo
//       const photo = await cameraRef.current.takePhoto({
//         qualityPrioritization: "quality",
//         skipMetadata: false,
//         enableShutterSound: false,
//       });

//       photoPath = photo.path;
//       console.log("✅ Photo captured:", {
//         width: photo.width,
//         height: photo.height,
//         path: photo.path
//       });

//       setStatusMessage("Processing...");

//       // Convert photo directly to base64 (no resizing)
//       const base64Image = await RNFS.readFile(
//         photo.path, 
//         'base64'
//       );

//       console.log(`✅ Base64: ${(base64Image.length / 1024).toFixed(0)}KB`);

//       // Show "Please wait" message during liveness check
//       setIsCheckingLiveness(true);
//       setStatusMessage("Please wait...");

//       // Step 7: Call FaceNet with timeout
//       const timeoutDuration = cameraScore < 50 ? 45000 : 30000;

//       const timeoutPromise = new Promise((_, reject) => 
//         setTimeout(() => reject(new Error(`Timeout (${timeoutDuration/1000}s)`)), timeoutDuration)
//       );

//       const resultPromise = FaceNetModule.captureAndGetEmbedding(base64Image);
//       const result = await Promise.race([resultPromise, timeoutPromise]);

//       setIsCheckingLiveness(false);

//       const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
//       console.log(`⏱️ Processing time: ${processingTime}s`);

//       console.log("========================================");
//       console.log("🎯 LIVENESS RESULT:");
//       console.log("   Is Live:", result.isLive);
//       console.log("   Score:", result.livenessScore);
//       console.log("   Label:", result.livenessLabel);
//       console.log("========================================");

//       // Handle liveness failure
//       if (!result.isLive) {
//         console.log("❌ LIVENESS CHECK FAILED");

//         // Vibrate device on failure
//         Vibration.vibrate([0, 200, 100, 200]); // Pattern: wait 0ms, vibrate 200ms, wait 100ms, vibrate 200ms

//         const errorLabel = (result.livenessLabel || '').toLowerCase();
//         let errorMessage = "Please present a real face";
//         let suggestions = "• Move to good lighting\n• Look directly at the camera\n• Keep the phone steady";

//         if (errorLabel.includes("tilt")) {
//           errorMessage = "Keep your head straight";
//           suggestions = "• Hold your head straight\n• Keep phone at eye level\n• Do not tilt your head";
//         } else if (result.beautyModeDetected) {
//           errorMessage = "Beauty mode detected";
//           suggestions = "• Disable beauty mode\n• Turn off AI enhancements\n• Remove filters";
//         } else if (result.isPrintOrScreen) {
//           errorMessage = "Printed image or screen detected";
//           suggestions = "• Present a real face\n• Do not use photos or screens";
//         } else if (errorLabel.includes("blur")) {
//           errorMessage = "Image is blurry";
//           suggestions = "• Hold phone steady\n• Improve lighting";
//         }

//         setLivenessStatus({
//           success: false,
//           message: errorMessage,
//           score: result.livenessScore
//         });

//         setStatusMessage(`${errorMessage}. Retrying...`);

//         const newRetryCount = retryCount + 1;
//         setRetryCount(newRetryCount);

//         // Show alert without blocking automatic recapture
//         Alert.alert(
//           "❌ Liveness verification failed",
//           `${errorMessage}\n\n📊 Details:\n` +
//           `• Score: ${result.livenessScore?.toFixed(4)}\n` +
//           `• Camera: ${cameraScore}/100\n` +
//           `• Device: ${deviceBrand}\n` +
//           `• Label: ${result.livenessLabel}\n\n` +
//           `💡 Suggestions:\n${suggestions}\n\n` +
//           `Attempts: ${newRetryCount}/3`,
//           [
//             { 
//               text: newRetryCount >= 3 ? "Cancel" : "OK", 
//               onPress: () => {
//                 if (newRetryCount >= 3) {
//                   setRetryCount(0);
//                   onCapture("");
//                 }
//               },
//               style: newRetryCount >= 3 ? "cancel" : "default"
//             },
//             ...(newRetryCount >= 3 ? [{
//               text: "Start Over",
//               onPress: () => {
//                 setRetryCount(0);
//                 resetCapture();
//               }
//             }] : [])
//           ]
//         );

//         // Automatically reset and recapture after 2 seconds if under retry limit
//         if (newRetryCount < 3) {
//           setTimeout(() => {
//             resetCapture();
//           }, 2000);
//         }

//         return;
//       }

//       // Success!
//       console.log("✅ LIVENESS CHECK PASSED");
//       setRetryCount(0);

//       setLivenessStatus({
//         success: true,
//         message: "Verified ✓",
//         score: result.livenessScore
//       });

//       setStatusMessage("Success! ✓");
//       const savePath = RNFS.DocumentDirectoryPath + `/myFace_${Date.now()}.jpg`;
//       await RNFS.copyFile(photo.path, savePath);

//       console.log("✅ Image saved:", savePath);
//       console.log("========================================");

//       onCapture({
//         uri: "file://" + savePath,
//         livenessData: {
//           isLive: result.isLive,
//           score: result.livenessScore,
//           label: result.livenessLabel,
//           confidence: result.livenessConfidence,
//           cameraQuality: cameraScore,
//           processingTime: processingTime,
//           deviceBrand: deviceBrand
//         },
//         embedding: result.embedding,
//         faceData: {
//           width: result.faceWidth,
//           height: result.faceHeight
//         }
//       });

//     } catch (e) {
//       console.log("========================================");
//       console.log("❌ CAPTURE ERROR:");
//       console.log("   Message:", e.message);
//       console.log("========================================");

//       setIsCheckingLiveness(false);

//       // Vibrate on error
//       Vibration.vibrate(500);

//       setLivenessStatus({
//         success: false,
//         message: "Error",
//         score: 0
//       });

//       let errorMsg = "Error - Please try again";

//       if (e.message.includes("timeout") || e.message.includes("Timeout")) {
//         errorMsg = "Processing slow - Please try again";
//       } else if (e.message.toLowerCase().includes("tilt")) {
//         errorMsg = "Keep your head straight";
//       }

//       setStatusMessage(errorMsg);
//       setRetryCount(retryCount + 1);

//       // Auto retry after error
//       setTimeout(() => resetCapture(), 1500);

//     } finally {
//       // Cleanup temporary files
//       if (photoPath) {
//         RNFS.unlink(photoPath).catch(() => {});
//       }
//     }
//   }

//   /* ---------------- RESET ---------------- */
//   function resetCapture() {
//     capturedRef.current = false;
//     setIsCapturing(false);
//     setIsCheckingLiveness(false);
//     setLivenessStatus(null);
//     setStatusMessage("Align your face inside the oval");
//   }

//   /* ---------------- UI ---------------- */
//   if (!device || !["granted", "authorized"].includes(permissionStatus)) {
//     return (
//       <View style={styles.fullScreen2}>
//         <ActivityIndicator size="large" color={Theme.colors.primary} />
//         <Text style={{ marginTop: 20 }}>Camera loading...</Text>
//       </View>
//     );
//   }

//   const ovalWidth = ScreenWidth * 0.7;
//   const ovalHeight = ScreenHeight * 0.45;
//   const ovalX = (ScreenWidth - ovalWidth) / 2;
//   const ovalY = (ScreenHeight - ovalHeight) / 2;

//   return (
//     <View style={styles.fullScreen}>

//       {close && (
//         <TouchableOpacity style={styles.cutButton} onPress={() => onCapture("")}>
//           <XIcon height={30} width={30} color={Theme.colors.white} />
//         </TouchableOpacity>
//       )}

//       <Camera
//         ref={cameraRef}
//         style={{ height: ScreenHeight, width: ScreenWidth }}
//         device={device}
//         isActive
//         photo
//       />

//       <Svg height={ScreenHeight} width={ScreenWidth} style={{ position: "absolute" }}>
//         <Defs>
//           <Mask id="mask">
//             <Rect width="100%" height="100%" fill="white" />
//             <Ellipse
//               cx={ScreenWidth / 2}
//               cy={ScreenHeight / 2}
//               rx={ovalWidth / 2}
//               ry={ovalHeight / 2}
//               fill="black"
//             />
//           </Mask>
//         </Defs>
//         <Rect width="100%" height="100%" fill="white" opacity="0.85" mask="url(#mask)" />
//       </Svg>

//       <Text style={[styles.statusText, {
//         top: ovalY - 90,
//         color: livenessStatus 
//           ? (livenessStatus.success ? "green" : "red")
//           : isCheckingLiveness
//             ? "orange"
//             : isCapturing
//               ? "green"
//               : faceAligned ? "rgb(29,91,65)" : "red",
//       }]}>
//         {statusMessage}
//       </Text>

//       {livenessStatus && (
//         <Text style={[styles.scoreText, { top: ovalY - 60 }]}>
//           Score: {livenessStatus.score?.toFixed(4)}
//         </Text>
//       )}

//       <View style={{
//         position: "absolute",
//         top: ovalY,
//         left: ovalX,
//         width: ovalWidth,
//         height: ovalHeight,
//         borderWidth: 5,
//         borderColor: livenessStatus
//           ? (livenessStatus.success ? "green" : "red")
//           : isCheckingLiveness
//             ? "orange"
//             : isCapturing
//               ? "green"
//               : faceAligned ? "rgb(29,91,65)" : "red",
//         borderRadius: ovalWidth / 2,
//       }} />

//       {/* Show "Please wait..." inside the oval during liveness check */}
//       {isCheckingLiveness && (
//         <View style={{
//           position: 'absolute',
//           top: ovalY + ovalHeight / 2 - 40,
//           left: ovalX,
//           width: ovalWidth,
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}>
//           <ActivityIndicator size="large" color="#FFF" />
//           <Text style={{
//             color: '#FFF',
//             fontSize: 18,
//             fontWeight: '700',
//             marginTop: 10,
//             textAlign: 'center',
//           }}>
//             Please wait...
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// }

// /* ---------------- FACE OVAL CHECK ---------------- */
// function isFaceInsideOval(bounds, w, h) {
//   if (!bounds?.frame) return false;
//   const f = bounds.frame;

//   const x = f.left / w;
//   const y = f.top / h;
//   const fw = f.width / w;
//   const fh = f.height / h;

//   return x >= 0.15 && x + fw <= 0.85 && y >= 0.2 && y + fh <= 0.8;
// }

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   fullScreen: {
//     flex: 1,
//     backgroundColor: "black",
//     position: "absolute",
//     width: "100%",
//     height: "100%",
//     zIndex: 999,
//   },
//   fullScreen2: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "white",
//   },
//   cutButton: {
//     position: "absolute",
//     top: 40,
//     left: 20,
//     padding: 10,
//     zIndex: 10,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 25,
//   },
//   qualityBadge: {
//     position: "absolute",
//     top: 40,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//     zIndex: 10,
//   },
//   qualityText: {
//     color: '#FFF',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   brandText: {
//     color: '#FFF',
//     fontSize: 10,
//     marginTop: 2,
//     textAlign: 'center',
//   },
//   statusText: {
//     position: "absolute",
//     width: "100%",
//     textAlign: "center",
//     fontSize: 18,
//     fontWeight: "700",
//     paddingHorizontal: 20,
//   },
//   scoreText: {
//     position: "absolute",
//     width: "100%",
//     textAlign: "center",
//     fontSize: 14,
//     fontWeight: "600",
//     color: "white",
//   },
// });
// import React, { useState, useEffect, useRef } from 'react';
// import { View, StyleSheet, Text, TouchableOpacity, Platform, NativeModules, Alert, ActivityIndicator, Vibration } from 'react-native';
// import { Camera, useCameraDevices } from 'react-native-vision-camera';
// import RNFS from 'react-native-fs';
// import FaceDetection from '@react-native-ml-kit/face-detection';
// import Theme from 'FaceEmbading/Theme';
// import ImageResizer from 'react-native-image-resizer';
// import { request, openSettings as RNPOpenSettings, PERMISSIONS, RESULTS } from "react-native-permissions";
// import { XIcon } from 'assets/Svg/svg';
// import { ScreenHeight, ScreenWidth } from '@freakycoder/react-native-helpers';
// import Svg, { Rect, Defs, Mask, Ellipse } from "react-native-svg";

// const { FaceNetModule } = NativeModules;

// // Device-specific rotation mapping
// const DEVICE_ROTATION_MAP = {
//   'realme': 0,
//   'oppo': 0,
//   'vivo': 0,
//   'samsung': 0,
//   'xiaomi': 90,
//   'redmi': 90,
//   'poco': 90,
//   'oneplus': 90,
//   'google': 90,
//   'motorola': 90,
//   'moto': 90,
//   'apple': 270,
// };

// // Get device brand
// const getDeviceBrand = () => {
//   try {
//     if (Platform.OS === 'android') {
//       const brand = Platform.constants?.Brand || '';
//       const manufacturer = Platform.constants?.Manufacturer || '';
//       return (brand || manufacturer).toLowerCase();
//     }
//     return 'apple';
//   } catch (e) {
//     return Platform.OS === 'ios' ? 'apple' : 'unknown';
//   }
// };

// // Get rotation angle based on device
// const getRotationForDevice = () => {
//   const brand = getDeviceBrand();
//   console.log('📱 Device Brand:', brand);

//   for (const [key, rotation] of Object.entries(DEVICE_ROTATION_MAP)) {
//     if (brand.includes(key)) {
//       console.log(`🔄 Using ${rotation}° rotation for ${key}`);
//       return rotation;
//     }
//   }

//   const defaultRotation = Platform.OS === 'ios' ? 270 : 0;
//   console.log(`🔄 Using default ${defaultRotation}° rotation`);
//   return defaultRotation;
// };

// export default function FaceCaptureModalforfacnet({ onCapture, closebutton}) {

//   const [faceAligned, setFaceAligned] = useState(false);
//   const [permissionStatus, setPermissionStatus] = useState('loading');
//   const [device, setDevice] = useState(null);
//   const [statusMessage, setStatusMessage] = useState("Align your face within the oval");
//   const [livenessStatus, setLivenessStatus] = useState(null);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [isCheckingLiveness, setIsCheckingLiveness] = useState(false);
//   const [cameraScore, setCameraScore] = useState(0);
//   const [deviceBrand, setDeviceBrand] = useState('');
//   const [retryCount, setRetryCount] = useState(0);
//   const [close, setclose] = useState(false);

//   // NEW: camera position + flash/torch state
//   const [cameraPosition, setCameraPosition] = useState('front'); // 'front' | 'back'
//   const [torchOn, setTorchOn] = useState(false);

//   const cameraRef = useRef(null);
//   const devices = useCameraDevices();

//   const processingRef = useRef(false);
//   const capturedRef = useRef(false);

//   /* ---------------- DETECT DEVICE ---------------- */
//   useEffect(() => {
//     const brand = getDeviceBrand();
//     setDeviceBrand(brand);
//   }, []);

//   /* ---------------- CAMERA QUALITY ---------------- */
//   function getCameraQualityPercentage(device) {
//     if (!device?.formats?.length) return 0;

//     let score = 0;

//     const resolutions = device.formats
//       .filter(f => f?.videoWidth && f?.videoHeight)
//       .map(f => f.videoWidth * f.videoHeight);

//     const maxPixels = resolutions.length ? Math.max(...resolutions) : 0;
//     const resolutionScore = Math.min(35, (maxPixels / 8_000_000) * 35);
//     score += resolutionScore;

//     const fpsValues = device.formats.flatMap(f =>
//       Array.isArray(f.frameRateRanges)
//         ? f.frameRateRanges.map(r => r.maxFrameRate || 0)
//         : []
//     );

//     const maxFps = fpsValues.length ? Math.max(...fpsValues) : 0;
//     const fpsScore = Math.min(25, (maxFps / 60) * 25);
//     score += fpsScore;

//     if (device.hardwareLevel === 'LEVEL_3') score += 15;
//     else if (device.hardwareLevel?.toLowerCase() === 'full') score += 12;
//     else if (device.hardwareLevel === 'LIMITED') score += 7;

//     const zoomScore = Math.min(10, ((device.maxZoom || 1) / 10) * 10);
//     score += zoomScore;

//     const formatScore = Math.min(15, (device.formats.length / 300) * 15);
//     score += formatScore;

//     return Math.round(Math.min(100, score));
//   }

//   useEffect(() => {
//     setclose(closebutton);
//     console.log("closebutton",closebutton);
//     if (device) {
//       const quality = getCameraQualityPercentage(device);
//       setCameraScore(quality);
//       console.log(`📱 Camera Quality: ${quality}/100`);
//     }
//   }, [device]);

//   /* ---------------- PERMISSION ---------------- */
//   useEffect(() => { 
//     (async () => {
//       try {
//         const status = Camera.getCameraPermissionStatus();
//         if (status === 'not-determined') {
//           const req = await Camera.requestCameraPermission();
//           setPermissionStatus(req);
//         } else {
//           setPermissionStatus(status);
//         }
//       } catch {
//         setPermissionStatus("denied");
//       }
//     })();
//   }, []);

//   async function askCameraPermission() {
//     const permission =
//       Platform.OS === "ios"
//         ? PERMISSIONS.IOS.CAMERA
//         : PERMISSIONS.ANDROID.CAMERA;

//     const result = await request(permission);
//     if (result === RESULTS.GRANTED) {
//       setPermissionStatus("granted");
//     } else {
//       RNPOpenSettings();
//       onCapture("");
//     }
//   }

//   // UPDATED: device selection now reacts to cameraPosition
//   useEffect(() => {
//     if (!devices) return;

//     if (permissionStatus === "granted" || permissionStatus === "authorized") {
//       const match = devices.find(d => d.position === cameraPosition) || devices[0];
//       setDevice(match);
//     }

//     if (permissionStatus === "denied") askCameraPermission();
//   }, [permissionStatus, devices, cameraPosition]);

//   /* ---------------- FACE DETECTION LOOP ---------------- */
//   useEffect(() => {
//     if (!device || !cameraRef.current) return;

//     const interval = setInterval(async () => {
//       if (processingRef.current || capturedRef.current || isCapturing) return;
//       processingRef.current = true;

//       let snapshotPath;

//       try {
//         const snap = await cameraRef.current.takeSnapshot({
//           quality: 0.5,
//           skipMetadata: true,
//         });

//         snapshotPath = snap.path;
//         const uri = "file://" + snap.path;

//         const faces = await FaceDetection.detect(uri, {
//           classificationMode: "all",
//         });

//         if (!faces.length) {
//           setFaceAligned(false);
//           setStatusMessage("Align your face inside the oval.");
//           return;
//         }

//         const face = faces[0];
//         const aligned = isFaceInsideOval(face, snap.width, snap.height);
//         setFaceAligned(aligned);

//         if (aligned) { 
//           // Automatically capture when face is aligned
//           if (!capturedRef.current && !isCapturing) {
//             capturedRef.current = true;
//             setIsCapturing(true);
//             clearInterval(interval);

//             // Small delay for better stability
//             setTimeout(() => capturePhoto(), 300);
//           }
//         } else {
//           setStatusMessage("Align your face inside the oval.");
//         }

//       } catch (e) {
//         console.log("Face detection error:", e);
//       } finally {
//         if (snapshotPath) RNFS.unlink(snapshotPath).catch(() => {});
//         processingRef.current = false;
//       }
//     }, 60);

//     return () => clearInterval(interval);
//   }, [device, isCapturing]);

//   /* ---------------- CAPTURE WITH DEVICE-SPECIFIC ROTATION ---------------- */
//   async function capturePhoto() {
//     const startTime = Date.now();
//     let photoPath = null;

//     try {
//       if (!cameraRef.current) {
//         throw new Error("Camera reference not available");
//       }

//       console.log("========================================");
//       console.log("📸 STARTING CAPTURE PROCESS");
//       console.log("   Device Brand:", deviceBrand);
//       console.log("   Camera Quality:", cameraScore);
//       console.log("   Retry Count:", retryCount);
//       console.log("========================================");

//       setStatusMessage("Capturing image...");

//       // Step 1: Take photo
//       const photo = await cameraRef.current.takePhoto({
//         qualityPrioritization: "quality",
//         skipMetadata: false,
//         enableShutterSound: false,
//         flash: torchOn ? "on" : "off",
//       });

//       photoPath = photo.path;
//       console.log("✅ Photo captured:", {
//         width: photo.width,
//         height: photo.height,
//         path: photo.path
//       });

//       setStatusMessage("Processing...");

//       // Convert photo directly to base64 (no resizing)
//       const base64Image = await RNFS.readFile(
//         photo.path, 
//         'base64'
//       );

//       console.log(`✅ Base64: ${(base64Image.length / 1024).toFixed(0)}KB`);

//       // Show "Please wait" message during liveness check
//       setIsCheckingLiveness(true);
//       setStatusMessage("Please wait...");

//       // Step 7: Call FaceNet with timeout
//       const timeoutDuration = cameraScore < 50 ? 45000 : 30000;

//       const timeoutPromise = new Promise((_, reject) => 
//         setTimeout(() => reject(new Error(`Timeout (${timeoutDuration/1000}s)`)), timeoutDuration)
//       );

//       const resultPromise = FaceNetModule.captureAndGetEmbedding(base64Image);
//       const result = await Promise.race([resultPromise, timeoutPromise]);

//       setIsCheckingLiveness(false);

//       const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
//       console.log(`⏱️ Processing time: ${processingTime}s`);

//       console.log("========================================");
//       console.log("🎯 LIVENESS RESULT:");
//       console.log("   Is Live:", result.isLive);
//       console.log("   Score:", result.livenessScore);
//       console.log("   Label:", result.livenessLabel);
//       console.log("========================================");

//       // Handle liveness failure
//       if (!result.isLive) {
//         console.log("❌ LIVENESS CHECK FAILED");

//         // Vibrate device on failure
//         Vibration.vibrate([0, 200, 100, 200]);

//         const errorLabel = (result.livenessLabel || '').toLowerCase();
//         let errorMessage = "Please present a real face";
//         let suggestions = "• Move to good lighting\n• Look directly at the camera\n• Keep the phone steady";

//         if (errorLabel.includes("tilt")) {
//           errorMessage = "Keep your head straight";
//           suggestions = "• Hold your head straight\n• Keep phone at eye level\n• Do not tilt your head";
//         } else if (result.beautyModeDetected) {
//           errorMessage = "Beauty mode detected";
//           suggestions = "• Disable beauty mode\n• Turn off AI enhancements\n• Remove filters";
//         } else if (result.isPrintOrScreen) {
//           errorMessage = "Printed image or screen detected";
//           suggestions = "• Present a real face\n• Do not use photos or screens";
//         } else if (errorLabel.includes("blur")) {
//           errorMessage = "Image is blurry";
//           suggestions = "• Hold phone steady\n• Improve lighting";
//         }

//         setLivenessStatus({
//           success: false,
//           message: errorMessage,
//           score: result.livenessScore
//         });

//         setStatusMessage(`${errorMessage}. Retrying...`);

//         const newRetryCount = retryCount + 1;
//         setRetryCount(newRetryCount);

//         // Show alert without blocking automatic recapture
//         Alert.alert(
//           "❌ Liveness verification failed",
//           `${errorMessage}\n\n📊 Details:\n` +
//           `• Score: ${result.livenessScore?.toFixed(4)}\n` +
//           `• Camera: ${cameraScore}/100\n` +
//           `• Device: ${deviceBrand}\n` +
//           `• Label: ${result.livenessLabel}\n\n` +
//           `💡 Suggestions:\n${suggestions}\n\n` +
//           `Attempts: ${newRetryCount}/3`,
//           [
//             { 
//               text: newRetryCount >= 3 ? "Cancel" : "OK", 
//               onPress: () => {
//                 if (newRetryCount >= 3) {
//                   setRetryCount(0);
//                   onCapture("");
//                 }
//               },
//               style: newRetryCount >= 3 ? "cancel" : "default"
//             },
//             ...(newRetryCount >= 3 ? [{
//               text: "Start Over",
//               onPress: () => {
//                 setRetryCount(0);
//                 resetCapture();
//               }
//             }] : [])
//           ]
//         );

//         // Automatically reset and recapture after 2 seconds if under retry limit
//         if (newRetryCount < 3) {
//           setTimeout(() => {
//             resetCapture();
//           }, 2000);
//         }

//         return;
//       }

//       // Success!
//       console.log("✅ LIVENESS CHECK PASSED");
//       setRetryCount(0);

//       setLivenessStatus({
//         success: true,
//         message: "Verified ✓",
//         score: result.livenessScore
//       });

//       setStatusMessage("Success! ✓");
//       const savePath = RNFS.DocumentDirectoryPath + `/myFace_${Date.now()}.jpg`;
//       await RNFS.copyFile(photo.path, savePath);

//       console.log("✅ Image saved:", savePath);
//       console.log("========================================");

//       onCapture({
//         uri: "file://" + savePath,
//         livenessData: {
//           isLive: result.isLive,
//           score: result.livenessScore,
//           label: result.livenessLabel,
//           confidence: result.livenessConfidence,
//           cameraQuality: cameraScore,
//           processingTime: processingTime,
//           deviceBrand: deviceBrand
//         },
//         embedding: result.embedding,
//         faceData: {
//           width: result.faceWidth,
//           height: result.faceHeight
//         }
//       });

//     } catch (e) {
//       console.log("========================================");
//       console.log("❌ CAPTURE ERROR:");
//       console.log("   Message:", e.message);
//       console.log("========================================");

//       setIsCheckingLiveness(false);

//       // Vibrate on error
//       Vibration.vibrate(500);

//       setLivenessStatus({
//         success: false,
//         message: "Error",
//         score: 0
//       });

//       let errorMsg = "Error - Please try again";

//       if (e.message.includes("timeout") || e.message.includes("Timeout")) {
//         errorMsg = "Processing slow - Please try again";
//       } else if (e.message.toLowerCase().includes("tilt")) {
//         errorMsg = "Keep your head straight";
//       }

//       setStatusMessage(errorMsg);
//       setRetryCount(retryCount + 1);

//       // Auto retry after error
//       setTimeout(() => resetCapture(), 1500);

//     } finally {
//       // Cleanup temporary files
//       if (photoPath) {
//         RNFS.unlink(photoPath).catch(() => {});
//       }
//     }
//   }

//   /* ---------------- RESET ---------------- */
//   function resetCapture() {
//     capturedRef.current = false;
//     setIsCapturing(false);
//     setIsCheckingLiveness(false);
//     setLivenessStatus(null);
//     setStatusMessage("Align your face inside the oval");
//   }

//   // NEW: toggle handlers
//   const toggleCameraPosition = () => {
//     setCameraPosition(prev => (prev === 'front' ? 'back' : 'front'));
//     setTorchOn(false); // reset torch when switching, front usually has none
//     resetCapture();
//   };

//   const toggleTorch = () => {
//     setTorchOn(prev => !prev);
//   };

//   /* ---------------- UI ---------------- */
//   if (!device || !["granted", "authorized"].includes(permissionStatus)) {
//     return (
//       <View style={styles.fullScreen2}>
//         <ActivityIndicator size="large" color={Theme.colors.primary} />
//         <Text style={{ marginTop: 20 }}>Camera loading...</Text>
//       </View>
//     );
//   }

//   const ovalWidth = ScreenWidth * 0.7;
//   const ovalHeight = ScreenHeight * 0.45;
//   const ovalX = (ScreenWidth - ovalWidth) / 2;
//   const ovalY = (ScreenHeight - ovalHeight) / 2;

//   return (
//     <View style={styles.fullScreen}>

//       {close && (
//         <TouchableOpacity style={styles.cutButton} onPress={() => onCapture("")}>
//           <XIcon height={30} width={30} color={Theme.colors.white} />
//         </TouchableOpacity>
//       )}

//       {/* NEW: Swap camera + Flash toggle - top right overlay */}
//       <View style={styles.topRightContainer}>
//         <TouchableOpacity style={styles.iconButton} onPress={toggleCameraPosition}>
//           <Text style={styles.iconText}>🔄</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.iconButton,
//             { backgroundColor: torchOn ? '#FFD70099' : 'rgba(0,0,0,0.5)' },
//           ]}
//           onPress={toggleTorch}
//           disabled={cameraPosition === 'front'}
//         >
//           <Text style={styles.iconText}>{torchOn ? '⚡' : '⚡️'}</Text>
//         </TouchableOpacity>
//       </View>

//       <Camera
//         ref={cameraRef}
//         style={{ height: ScreenHeight, width: ScreenWidth }}
//         device={device}
//         isActive
//         photo
//         torch={torchOn ? 'on' : 'off'}
//       />

//       <Svg height={ScreenHeight} width={ScreenWidth} style={{ position: "absolute" }}>
//         <Defs>
//           <Mask id="mask">
//             <Rect width="100%" height="100%" fill="white" />
//             <Ellipse
//               cx={ScreenWidth / 2}
//               cy={ScreenHeight / 2}
//               rx={ovalWidth / 2}
//               ry={ovalHeight / 2}
//               fill="black"
//             />
//           </Mask>
//         </Defs>
//         <Rect width="100%" height="100%" fill="white" opacity="0.85" mask="url(#mask)" />
//       </Svg>

//       <Text style={[styles.statusText, {
//         top: ovalY - 90,
//         color: livenessStatus 
//           ? (livenessStatus.success ? "green" : "red")
//           : isCheckingLiveness
//             ? "orange"
//             : isCapturing
//               ? "green"
//               : faceAligned ? "rgb(29,91,65)" : "red",
//       }]}>
//         {statusMessage}
//       </Text>

//       {livenessStatus && (
//         <Text style={[styles.scoreText, { top: ovalY - 60 }]}>
//           Score: {livenessStatus.score?.toFixed(4)}
//         </Text>
//       )}

//       <View style={{
//         position: "absolute",
//         top: ovalY,
//         left: ovalX,
//         width: ovalWidth,
//         height: ovalHeight,
//         borderWidth: 5,
//         borderColor: livenessStatus
//           ? (livenessStatus.success ? "green" : "red")
//           : isCheckingLiveness
//             ? "orange"
//             : isCapturing
//               ? "green"
//               : faceAligned ? "rgb(29,91,65)" : "red",
//         borderRadius: ovalWidth / 2,
//       }} />

//       {/* Show "Please wait..." inside the oval during liveness check */}
//       {isCheckingLiveness && (
//         <View style={{
//           position: 'absolute',
//           top: ovalY + ovalHeight / 2 - 40,
//           left: ovalX,
//           width: ovalWidth,
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}>
//           <ActivityIndicator size="large" color="#FFF" />
//           <Text style={{
//             color: '#FFF',
//             fontSize: 18,
//             fontWeight: '700',
//             marginTop: 10,
//             textAlign: 'center',
//           }}>
//             Please wait...
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// }

// /* ---------------- FACE OVAL CHECK ---------------- */
// function isFaceInsideOval(bounds, w, h) {
//   if (!bounds?.frame) return false;
//   const f = bounds.frame;

//   const x = f.left / w;
//   const y = f.top / h;
//   const fw = f.width / w;
//   const fh = f.height / h;

//   return x >= 0.15 && x + fw <= 0.85 && y >= 0.2 && y + fh <= 0.8;
// }

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   fullScreen: {
//     flex: 1,
//     backgroundColor: "black",
//     position: "absolute",
//     width: "100%",
//     height: "100%",
//     zIndex: 999,
//   },
//   fullScreen2: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "white",
//   },
//   cutButton: {
//     position: "absolute",
//     top: 40,
//     left: 20,
//     padding: 10,
//     zIndex: 10,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 25,
//   },
//   topRightContainer: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 10,
//     flexDirection: 'row',
//   },
//   iconButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 10,
//   },
//   iconText: {
//     fontSize: 20,
//   },
//   qualityBadge: {
//     position: "absolute",
//     top: 40,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//     zIndex: 10,
//   },
//   qualityText: {
//     color: '#FFF',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   brandText: {
//     color: '#FFF',
//     fontSize: 10,
//     marginTop: 2,
//     textAlign: 'center',
//   },
//   statusText: {
//     position: "absolute",
//     width: "100%",
//     textAlign: "center",
//     fontSize: 18,
//     fontWeight: "700",
//     paddingHorizontal: 20,
//   },
//   scoreText: {
//     position: "absolute",
//     width: "100%",
//     textAlign: "center",
//     fontSize: 14,
//     fontWeight: "600",
//     color: "white",
//   },
// });
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, NativeModules, Alert, ActivityIndicator, Vibration } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import FaceDetection from '@react-native-ml-kit/face-detection';
import Theme from 'FaceEmbading/Theme';
import ImageResizer from 'react-native-image-resizer';
import { request, openSettings as RNPOpenSettings, PERMISSIONS, RESULTS } from "react-native-permissions";
import { XIcon } from 'assets/Svg/svg';
import { ScreenHeight, ScreenWidth } from '@freakycoder/react-native-helpers';
import Svg, { Rect, Defs, Mask, Ellipse } from "react-native-svg";
import SystemSetting from 'react-native-system-setting'; // NEW: replaces react-native-screen-brightness
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const { FaceNetModule } = NativeModules;

// Device-specific rotation mapping
const DEVICE_ROTATION_MAP = {
  'realme': 0,
  'oppo': 0,
  'vivo': 0,
  'samsung': 0,
  'xiaomi': 90,
  'redmi': 90,
  'poco': 90,
  'oneplus': 90,
  'google': 90,
  'motorola': 90,
  'moto': 90,
  'apple': 270,
};

const getDeviceBrand = () => {
  try {
    if (Platform.OS === 'android') {
      const brand = Platform.constants?.Brand || '';
      const manufacturer = Platform.constants?.Manufacturer || '';
      return (brand || manufacturer).toLowerCase();
    }
    return 'apple';
  } catch (e) {
    return Platform.OS === 'ios' ? 'apple' : 'unknown';
  }
};

const getRotationForDevice = () => {
  const brand = getDeviceBrand();
  for (const [key, rotation] of Object.entries(DEVICE_ROTATION_MAP)) {
    if (brand.includes(key)) return rotation;
  }
  return Platform.OS === 'ios' ? 270 : 0;
};

export default function FaceCaptureModalforfacnet({ onCapture, closebutton }) {

  const [faceAligned, setFaceAligned] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('loading');
  const [device, setDevice] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Align your face within the oval");
  const [livenessStatus, setLivenessStatus] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCheckingLiveness, setIsCheckingLiveness] = useState(false);
  const [cameraScore, setCameraScore] = useState(0);
  const [deviceBrand, setDeviceBrand] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [close, setclose] = useState(false);

  const [cameraPosition, setCameraPosition] = useState('front');
  const [torchOn, setTorchOn] = useState(false);

  // keep track of original brightness to restore later
  const originalBrightnessRef = useRef(null);
  const brightnessRestoredRef = useRef(false);

  const cameraRef = useRef(null);
  const devices = useCameraDevices();

  const processingRef = useRef(false);
  const capturedRef = useRef(false);

  /* ---------------- AUTO FULL BRIGHTNESS (app-scoped, no permission needed) ---------------- */

  // Reusable restore function — called from unmount cleanup AND explicitly from the
  // close button / successful capture, so we don't depend purely on unmount timing
  // (which can be delayed or skipped depending on how the parent hides this modal).
  const restoreBrightness = async () => {
    if (brightnessRestoredRef.current) return; // avoid double-restore
    brightnessRestoredRef.current = true;
    try {
      const saved = originalBrightnessRef.current;
      // If we never captured a real override (-1 / null / undefined), just release
      // the app-level override entirely so it falls back to whatever the system
      // brightness is *right now* (also handles the user changing brightness
      // while the camera was open).
      if (saved === null || saved === -1 || saved === undefined) {
        await SystemSetting.setAppBrightness(-1);
      } else {
        await SystemSetting.setAppBrightness(saved);
      }
      console.log('🔅 App brightness restored to', saved);
    } catch (e) {
      console.log('⚠️ Could not restore app brightness, forcing release:', e?.message);
      try { await SystemSetting.setAppBrightness(-1); } catch (_) { }
    }
  };

  useEffect(() => {
    let isMounted = true;
    brightnessRestoredRef.current = false;

    (async () => {
      try {
        // Save current app brightness so we can restore it later
        const current = await SystemSetting.getAppBrightness();
        if (isMounted) originalBrightnessRef.current = current;

        // Set app brightness to full — this only affects this screen/app,
        // not the device's system-wide brightness, so no special permission is required.
        await SystemSetting.setAppBrightness(1);
        console.log('☀️ App brightness set to full (1.0)');
      } catch (e) {
        console.log('⚠️ Could not set app brightness:', e?.message);
      }
    })();

    return () => {
      isMounted = false;
      // Restore original brightness on unmount (safety net in case the explicit
      // calls in the close button / capture success path didn't run for some reason)
      restoreBrightness();
    };
  }, []);

  /* ---------------- DETECT DEVICE ---------------- */
  useEffect(() => {
    const brand = getDeviceBrand();
    setDeviceBrand(brand);
  }, []);

  /* ---------------- CAMERA QUALITY ---------------- */
  function getCameraQualityPercentage(device) {
    if (!device?.formats?.length) return 0;
    let score = 0;

    const resolutions = device.formats
      .filter(f => f?.videoWidth && f?.videoHeight)
      .map(f => f.videoWidth * f.videoHeight);

    const maxPixels = resolutions.length ? Math.max(...resolutions) : 0;
    score += Math.min(35, (maxPixels / 8_000_000) * 35);

    const fpsValues = device.formats.flatMap(f =>
      Array.isArray(f.frameRateRanges)
        ? f.frameRateRanges.map(r => r.maxFrameRate || 0)
        : []
    );
    const maxFps = fpsValues.length ? Math.max(...fpsValues) : 0;
    score += Math.min(25, (maxFps / 60) * 25);

    if (device.hardwareLevel === 'LEVEL_3') score += 15;
    else if (device.hardwareLevel?.toLowerCase() === 'full') score += 12;
    else if (device.hardwareLevel === 'LIMITED') score += 7;

    score += Math.min(10, ((device.maxZoom || 1) / 10) * 10);
    score += Math.min(15, (device.formats.length / 300) * 15);

    return Math.round(Math.min(100, score));
  }

  useEffect(() => {
    setclose(closebutton);
    if (device) {
      const quality = getCameraQualityPercentage(device);
      setCameraScore(quality);
    }
  }, [device]);

  /* ---------------- PERMISSION ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const status = Camera.getCameraPermissionStatus();
        if (status === 'not-determined') {
          const req = await Camera.requestCameraPermission();
          setPermissionStatus(req);
        } else {
          setPermissionStatus(status);
        }
      } catch {
        setPermissionStatus("denied");
      }
    })();
  }, []);

  async function askCameraPermission() {
    const permission =
      Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

    const result = await request(permission);
    if (result === RESULTS.GRANTED) {
      setPermissionStatus("granted");
    } else {
      RNPOpenSettings();
      onCapture("");
    }
  }

  useEffect(() => {
    if (!devices) return;
    if (permissionStatus === "granted" || permissionStatus === "authorized") {
      const match = devices.find(d => d.position === cameraPosition) || devices[0];
      setDevice(match);
    }
    if (permissionStatus === "denied") askCameraPermission();
  }, [permissionStatus, devices, cameraPosition]);

  /* ---------------- FACE DETECTION LOOP ---------------- */
  useEffect(() => {
    if (!device || !cameraRef.current) return;

    const interval = setInterval(async () => {
      if (processingRef.current || capturedRef.current || isCapturing) return;
      processingRef.current = true;

      let snapshotPath;

      try {
        const snap = await cameraRef.current.takeSnapshot({
          quality: 0.5,
          skipMetadata: true,
        });

        snapshotPath = snap.path;
        const uri = "file://" + snap.path;

        const faces = await FaceDetection.detect(uri, { classificationMode: "all" });

        if (!faces.length) {
          setFaceAligned(false);
          setStatusMessage("Align your face inside the oval.");
          return;
        }

        const face = faces[0];
        const aligned = isFaceInsideOval(face, snap.width, snap.height);
        setFaceAligned(aligned);

        if (aligned) {
          if (!capturedRef.current && !isCapturing) {
            capturedRef.current = true;
            setIsCapturing(true);
            clearInterval(interval);
            setTimeout(() => capturePhoto(), 300);
          }
        } else {
          setStatusMessage("Align your face inside the oval.");
        }

      } catch (e) {
        console.log("Face detection error:", e);
      } finally {
        if (snapshotPath) RNFS.unlink(snapshotPath).catch(() => { });
        processingRef.current = false;
      }
    }, 60);

    return () => clearInterval(interval);
  }, [device, isCapturing]);

  /* ---------------- CAPTURE WITH DEVICE-SPECIFIC ROTATION ---------------- */
  async function capturePhoto() {
    const startTime = Date.now();
    let photoPath = null;

    try {
      if (!cameraRef.current) throw new Error("Camera reference not available");

      setStatusMessage("Capturing image...");

      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: "quality",
        skipMetadata: false,
        enableShutterSound: false,
        flash: torchOn ? "on" : "off",
      });

      photoPath = photo.path;
      setStatusMessage("Processing...");

      const base64Image = await RNFS.readFile(photo.path, 'base64');

      setIsCheckingLiveness(true);
      setStatusMessage("Please wait...");

      const timeoutDuration = cameraScore < 50 ? 45000 : 30000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout (${timeoutDuration / 1000}s)`)), timeoutDuration)
      );

      const resultPromise = FaceNetModule.captureAndGetEmbedding(base64Image);
      const result = await Promise.race([resultPromise, timeoutPromise]);

      setIsCheckingLiveness(false);
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

      if (!result.isLive) {
        Vibration.vibrate([0, 200, 100, 200]);

        const errorLabel = (result.livenessLabel || '').toLowerCase();
        let errorMessage = "Please present a real face";
        let suggestions = "• Move to good lighting\n• Look directly at the camera\n• Keep the phone steady";

        if (errorLabel.includes("tilt")) {
          errorMessage = "Keep your head straight";
          suggestions = "• Hold your head straight\n• Keep phone at eye level\n• Do not tilt your head";
        } else if (result.beautyModeDetected) {
          errorMessage = "Beauty mode detected";
          suggestions = "• Disable beauty mode\n• Turn off AI enhancements\n• Remove filters";
        } else if (result.isPrintOrScreen) {
          errorMessage = "Printed image or screen detected";
          suggestions = "• Present a real face\n• Do not use photos or screens";
        } else if (errorLabel.includes("blur")) {
          errorMessage = "Image is blurry";
          suggestions = "• Hold phone steady\n• Improve lighting";
        }

        setLivenessStatus({ success: false, message: errorMessage, score: result.livenessScore });
        setStatusMessage(`${errorMessage}. Retrying...`);

        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);

        Alert.alert(
          "❌ Liveness verification failed",
          `${errorMessage}\n\n📊 Details:\n` +
          `• Score: ${result.livenessScore?.toFixed(4)}\n` +
          `• Camera: ${cameraScore}/100\n` +
          `• Device: ${deviceBrand}\n` +
          `• Label: ${result.livenessLabel}\n\n` +
          `💡 Suggestions:\n${suggestions}\n\n` +
          `Attempts: ${newRetryCount}/3`,
          [
            {
              text: newRetryCount >= 3 ? "Cancel" : "OK",
              onPress: async () => {
                if (newRetryCount >= 3) {
                  setRetryCount(0);
                  await restoreBrightness();
                  onCapture("");
                }
              },
              style: newRetryCount >= 3 ? "cancel" : "default"
            },
            ...(newRetryCount >= 3 ? [{
              text: "Start Over",
              onPress: () => {
                setRetryCount(0);
                resetCapture();
              }
            }] : [])
          ]
        );

        if (newRetryCount < 3) {
          setTimeout(() => resetCapture(), 2000);
        }

        return;
      }

      setRetryCount(0);
      setLivenessStatus({ success: true, message: "Verified ✓", score: result.livenessScore });
      setStatusMessage("Success! ✓");

      const savePath = RNFS.DocumentDirectoryPath + `/myFace_${Date.now()}.jpg`;
      await RNFS.copyFile(photo.path, savePath);

      // Restore brightness explicitly before handing control back to the parent —
      // don't rely solely on unmount cleanup, which can lag behind this call.
      await restoreBrightness();

      onCapture({
        uri: "file://" + savePath,
        livenessData: {
          isLive: result.isLive,
          score: result.livenessScore,
          label: result.livenessLabel,
          confidence: result.livenessConfidence,
          cameraQuality: cameraScore,
          processingTime: processingTime,
          deviceBrand: deviceBrand
        },
        embedding: result.embedding,
        faceData: { width: result.faceWidth, height: result.faceHeight }
      });

    } catch (e) {
      setIsCheckingLiveness(false);
      Vibration.vibrate(500);
      setLivenessStatus({ success: false, message: "Error", score: 0 });

      let errorMsg = "Error - Please try again";
      if (e.message.includes("timeout") || e.message.includes("Timeout")) {
        errorMsg = "Processing slow - Please try again";
      } else if (e.message.toLowerCase().includes("tilt")) {
        errorMsg = "Keep your head straight";
      }

      setStatusMessage(errorMsg);
      setRetryCount(retryCount + 1);
      setTimeout(() => resetCapture(), 1500);

    } finally {
      if (photoPath) RNFS.unlink(photoPath).catch(() => { });
    }
  }

  /* ---------------- RESET ---------------- */
  function resetCapture() {
    capturedRef.current = false;
    setIsCapturing(false);
    setIsCheckingLiveness(false);
    setLivenessStatus(null);
    setStatusMessage("Align your face inside the oval");
  }

  const toggleCameraPosition = () => {
    setCameraPosition(prev => (prev === 'front' ? 'back' : 'front'));
    setTorchOn(false);
    resetCapture();
  };

  const toggleTorch = () => setTorchOn(prev => !prev);

  const handleClose = async () => {
    await restoreBrightness();
    onCapture("");
  };

  /* ---------------- UI ---------------- */
  if (!device || !["granted", "authorized"].includes(permissionStatus)) {
    return (
      <View style={styles.fullScreen2}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={{ marginTop: 20 }}>Camera loading...</Text>
      </View>
    );
  }

  const ovalWidth = ScreenWidth * 0.7;
  const ovalHeight = ScreenHeight * 0.45;
  const ovalX = (ScreenWidth - ovalWidth) / 2;
  const ovalY = (ScreenHeight - ovalHeight) / 2;

  return (
    <View style={styles.fullScreen}>

      {close && (
        <TouchableOpacity style={styles.cutButton} onPress={handleClose}>
          <XIcon height={30} width={30} color={Theme.colors.white} />
        </TouchableOpacity>
      )}

      {/* <View style={styles.topRightContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleCameraPosition}>
          <Text style={styles.iconText}>🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: torchOn ? '#FFD70099' : 'rgba(0,0,0,0.5)' }]}
          onPress={toggleTorch}
          disabled={cameraPosition === 'front'}
        >
          <Text style={styles.iconText}>{torchOn ? '⚡' : '⚡️'}</Text>
        </TouchableOpacity>
      </View> */}
      <View style={styles.topRightContainer}>
        {/* Switch Camera */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleCameraPosition}
        >
          <Icon
            name="camera-flip"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Torch */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: torchOn
                ? '#FFD70099'
                : 'rgba(0,0,0,0.5)',
            },
          ]}
          onPress={toggleTorch}
          disabled={cameraPosition === 'front'}
        >
          <Icon
            name={torchOn ? 'flash' : 'flash-off'}
            size={24}
            color={torchOn ? '#FFD700' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
      <Camera
        ref={cameraRef}
        style={{ height: ScreenHeight, width: ScreenWidth }}
        device={device}
        isActive
        photo
        torch={torchOn ? 'on' : 'off'}
      />

      <Svg height={ScreenHeight} width={ScreenWidth} style={{ position: "absolute" }}>
        <Defs>
          <Mask id="mask">
            <Rect width="100%" height="100%" fill="white" />
            <Ellipse cx={ScreenWidth / 2} cy={ScreenHeight / 2} rx={ovalWidth / 2} ry={ovalHeight / 2} fill="black" />
          </Mask>
        </Defs>
        <Rect width="100%" height="100%" fill="white" opacity="1" mask="url(#mask)" />
      </Svg>

      <Text style={[styles.statusText, {
        top: ovalY - 90,
        color: livenessStatus
          ? (livenessStatus.success ? "green" : "red")
          : isCheckingLiveness ? "orange"
            : isCapturing ? "green"
              : faceAligned ? "rgb(29,91,65)" : "red",
      }]}>
        {statusMessage}
      </Text>

      {livenessStatus && (
        <Text style={[styles.scoreText, { top: ovalY - 60 }]}>
          Score: {livenessStatus.score?.toFixed(4)}
        </Text>
      )}

      <View style={{
        position: "absolute",
        top: ovalY,
        left: ovalX,
        width: ovalWidth,
        height: ovalHeight,
        borderWidth: 5,
        borderColor: livenessStatus
          ? (livenessStatus.success ? "green" : "red")
          : isCheckingLiveness ? "orange"
            : isCapturing ? "green"
              : faceAligned ? "rgb(29,91,65)" : "red",
        borderRadius: ovalWidth / 2,
      }} />

      {isCheckingLiveness && (
        <View style={{
          position: 'absolute',
          top: ovalY + ovalHeight / 2 - 40,
          left: ovalX,
          width: ovalWidth,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 10, textAlign: 'center' }}>
            Please wait...
          </Text>
        </View>
      )}
    </View>
  );
}

/* ---------------- FACE OVAL CHECK ---------------- */
function isFaceInsideOval(bounds, w, h) {
  if (!bounds?.frame) return false;
  const f = bounds.frame;
  const x = f.left / w;
  const y = f.top / h;
  const fw = f.width / w;
  const fh = f.height / h;
  return x >= 0.15 && x + fw <= 0.85 && y >= 0.2 && y + fh <= 0.8;
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: "black", position: "absolute", width: "100%", height: "100%", zIndex: 999 },
  fullScreen2: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" },
  cutButton: { position: "absolute", top: 40, left: 20, padding: 10, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 25 },
  topRightContainer: { position: 'absolute', top: 40, right: 20, zIndex: 10, flexDirection: 'row' },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  iconText: { fontSize: 20 },
  qualityBadge: { position: "absolute", top: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, zIndex: 10 },
  qualityText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  brandText: { color: '#FFF', fontSize: 10, marginTop: 2, textAlign: 'center' },
  statusText: { position: "absolute", width: "100%", textAlign: "center", fontSize: 18, fontWeight: "700", paddingHorizontal: 20 },
  scoreText: { position: "absolute", width: "100%", textAlign: "center", fontSize: 14, fontWeight: "600", color: "white" },
});