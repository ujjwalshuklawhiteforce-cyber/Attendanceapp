
import React, { useState, useEffect, useRef } from 'react';
import { View, Button, StyleSheet, Dimensions, Text, ActivityIndicator, Linking, TouchableOpacity, Platform } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import FaceDetection from '@react-native-ml-kit/face-detection';
import Theme from 'FaceEmbading/Theme';
import cropToOval from './CropToOVal';
import ImageResizer from 'react-native-image-resizer';
import { request, check, openSettings as RNPOpenSettings, PERMISSIONS, RESULTS } from "react-native-permissions";
import { XIcon } from 'assets/Svg/svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FaceCaptureModal({ onCapture }) {
  const [faceAligned, setFaceAligned] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('loading');
  const [device, setDevice] = useState(null);
  const cameraRef = useRef(null);

  const devices = useCameraDevices();

  useEffect(() => {
    async function getPermission() {
      try {
        console.log('🔍 Checking camera permission...');
        const status = await Camera.getCameraPermissionStatus();
        console.log('📷 Current permission status:', status);
        
        if (status === 'not-determined') {
          console.log('⏳ Requesting camera permission...');
          const reqStatus = await Camera.requestCameraPermission();
          console.log('✅ Permission request result:', reqStatus);
          setPermissionStatus(reqStatus);
        } else {
          setPermissionStatus(status);
        }
      } catch (error) {
        console.error('❌ Error getting camera permission:', error);
        setPermissionStatus('denied');
      }
    }

    getPermission();
  }, []);

  async function askCameraPermission() {
    try {
      console.log('📱 Platform:', Platform.OS);
      const permission = Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
      console.log('🔐 Requesting permission:', permission);
      
      const result = await request(permission);
      console.log('📊 Permission result:', result);

      if (result === RESULTS.GRANTED) {
        console.log("✅ Camera permission granted");
        setPermissionStatus('granted');
      } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
        console.log("⚠️ Permission denied. Redirecting to settings...");
        RNPOpenSettings().catch(() => console.warn("Cannot open settings"));
        onCapture("");
      } else {
        console.log("❌ Unexpected status:", result);
      }
    } catch (error) {
      console.error('❌ Error requesting camera permission:', error);
    }
  }

  useEffect(() => {
    if (permissionStatus !== 'authorized' && permissionStatus !== 'granted') {
      console.log('⏸️ Permission not granted yet:', permissionStatus);
      return;
    }
    
    if (!devices) {
      console.log('⏸️ No devices available yet');
      return;
    }

    console.log('📹 Available devices:', devices);

    try {
      if (Array.isArray(devices) && devices.length > 0) {
        console.log('📋 Devices array length:', devices.length);
        const frontCam = devices.find(d => d.position === 'front') || devices[0];
        console.log('🎥 Selected front camera:', frontCam?.position, frontCam?.id);
        setDevice(frontCam);
      } else if (devices.front) {
        console.log('🎥 Using devices.front:', devices.front.id);
        setDevice(devices.front);
      } else {
        console.warn('⚠️ No suitable camera found');
      }
    } catch (error) {
      console.error('❌ Error selecting device:', error);
    }
  }, [permissionStatus, devices]);

  useEffect(() => {
    let interval;
    let captured = false;
    let processing = false;

    if (!device || !cameraRef.current) {
      console.log('⏸️ Device or camera ref not ready', { device: !!device, cameraRef: !!cameraRef.current });
      return;
    }

    console.log('🎬 Starting face detection loop');

    interval = setInterval(async () => {
      if (captured || processing || !cameraRef.current) {
        return;
      }

      processing = true;
      let snapshotPath = null;

      try {
        const snapshot = await cameraRef.current.takeSnapshot({
          quality: 0.5,
          skipMetadata: true,
        });

        snapshotPath = snapshot.path;
        const snapshotUri = 'file://' + snapshotPath;
        
        console.log('📸 Snapshot taken:', {
          path: snapshotPath,
          width: snapshot.width,
          height: snapshot.height
        });

        const faces = await FaceDetection.detect(snapshotUri);
        console.log('👤 Faces detected:', faces.length);

        if (faces.length > 0) {
          const face = faces[0];
          console.log('👤 Face details:', {
            frame: face.frame,
            bounds: face.bounds,
            trackingId: face.trackingId
          });

          const isAligned = isFaceInsideOval(face, snapshot.width, snapshot.height);
          console.log('🎯 Face alignment check:', isAligned);

          if (isAligned) {
            captured = true;
            clearInterval(interval);
            setFaceAligned(true);
            console.log('✅ Face aligned! Capturing high-quality photo...');

            const photo = await cameraRef.current.takePhoto({
              qualityPrioritization: 'quality',
              skipMetadata: false,
            });

            console.log('📷 Photo captured:', {
              path: photo.path,
              width: photo.width,
              height: photo.height
            });

            const fileUri = 'file://' + photo.path;

            console.log('🔄 Resizing image...');
            const resized = await ImageResizer.createResizedImage(
              fileUri,
              photo.width,
              photo.height,
              'JPEG',
              100,
              270
            );
            console.log('✅ Image resized:', resized.uri);

            console.log('✂️ Cropping to oval...');
            const croppedUri = await cropToOval(
              resized.uri,
              face,
              device.position === 'front'
            );
            console.log('✅ Image cropped:', croppedUri.uri);

            const uniquePath = RNFS.DocumentDirectoryPath + `/myFace_${Date.now()}.jpg`;
            const srcPath = croppedUri.uri.replace('file://', '');
            
            console.log('💾 Saving file:', { from: srcPath, to: uniquePath });
            await RNFS.copyFile(srcPath, uniquePath);
            console.log('✅ File saved successfully');

            onCapture({ uri: 'file://' + uniquePath });
          } else {
            setFaceAligned(false);
          }
        } else {
          setFaceAligned(false);
          console.log('👤 No faces detected in frame');
        }
      } catch (e) {
        console.error('❌ Face detection error:', e);
        console.error('Error stack:', e.stack);
        setFaceAligned(false);
      } finally {
        if (snapshotPath) {
          try {
            const exists = await RNFS.exists(snapshotPath);
            if (exists) {
              await RNFS.unlink(snapshotPath);
              console.log('🗑️ Snapshot cleaned up');
            }
          } catch (cleanupError) {
            console.error('⚠️ Error cleaning up snapshot:', cleanupError);
          }
        }
        processing = false;
      }
    }, 300);

    return () => {
      console.log('🛑 Stopping face detection loop');
      clearInterval(interval);
    };
  }, [device, cameraRef, onCapture]);

  if ((permissionStatus !== 'authorized' && permissionStatus !== 'granted') || permissionStatus === 'loading' || !device) {
    console.log('🔒 Permission screen shown:', permissionStatus);
    return (
      <View style={styles.fullScreen2}>
        <TouchableOpacity
          style={styles.cutButton}
          onPress={() => {
            console.log('❌ Close button pressed');
            onCapture("");
          }}
        >
          <XIcon height={30} width={30} color={Theme.colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            borderColor: Theme.colors.white,
            borderWidth: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            borderRadius: 6
          }}
          onPress={() => {
            console.log('🔓 Grant access button pressed');
            askCameraPermission();
          }}
        >
          <Text style={styles.text}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log('🎥 Camera view rendered, face aligned:', faceAligned);

  return (
    <View style={styles.fullScreen}>
      <TouchableOpacity
        style={styles.cutButton}
        onPress={() => {
          console.log('❌ Close button pressed');
          onCapture("");
        }}
      >
        <XIcon height={30} width={30} color={Theme.colors.black0} />
      </TouchableOpacity>
      <View
        style={[
          styles.oval,
          { borderColor: faceAligned ? 'green' : 'red' },
        ]}
        pointerEvents="none"
      >
        <Camera
          ref={cameraRef}
          style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}
          device={device}
          isActive={true}
          photo={true}
        />
      </View>
    </View>
  );
}

function mapFaceToScreen(frame, photoWidth, photoHeight) {
  const x = frame.left / photoWidth;
  const y = frame.top / photoHeight;
  const width = frame.width / photoWidth;
  const height = frame.height / photoHeight;
  
  console.log('🗺️ Face mapped to screen:', { x, y, width, height });
  return { x, y, width, height };
}

function isFaceInsideOval(bounds, photoWidth, photoHeight) {
  if (!bounds) {
    console.log('⚠️ No bounds provided');
    return false;
  }
  
  const { frame } = bounds;
  if (!frame) {
    console.log('⚠️ No frame in bounds');
    return false;
  }

  const face = mapFaceToScreen(frame, photoWidth, photoHeight);

  const faceCenterX = face.x + face.width / 2;
  const faceCenterY = face.y + face.height / 2;

  const oval = { x: 0.15, y: 0.2, width: 0.7, height: 0.6 };
  const margin = 0.2;
  
  const insideCenter =
    faceCenterX >= oval.x - margin &&
    faceCenterX <= oval.x + oval.width + margin &&
    faceCenterY >= oval.y - margin &&
    faceCenterY <= oval.y + oval.height + margin;

  console.log('🎯 Face position check:', {
    faceCenterX,
    faceCenterY,
    oval,
    margin,
    insideCenter
  });

  return insideCenter;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    bottom: 0,
    zIndex: 999,
  },
  fullScreen2: {
    flex: 1,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    bottom: 0,
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oval: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.2,
    left: SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_HEIGHT * 0.6,
    borderWidth: 5,
    borderRadius: SCREEN_WIDTH * 0.35,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    overflow: 'hidden',
  },
  button: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  text: {
    color: 'white',
    fontWeight: '600',
  },
  cutButton: {
    top: 20,
    left: 20,
    padding: 10,
    borderRadius: 40,
    maxWidth: 53,
    position: "absolute",
    zIndex: 2,
  }
});