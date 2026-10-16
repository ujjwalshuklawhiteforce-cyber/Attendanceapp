// import { PermissionsAndroid, Platform, Alert } from 'react-native';
// import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// const isIOS = Platform.OS === 'ios';

// /* =========================
//    CAMERA PERMISSION
// ========================= */
// export const requestCameraPermission = async (): Promise<boolean> => {
//   try {
//     const permission = isIOS
//       ? PERMISSIONS.IOS.CAMERA
//       : PERMISSIONS.ANDROID.CAMERA;
//     const status = await request(permission);
//     console.log("Camera Permission Status:", status);
//     return status === RESULTS.GRANTED;
//   } catch (error) {
//     console.warn("Camera Permission Error:", error);
//     return false;
//   }
// };

// /* =========================
//    LOCATION PERMISSION
// ========================= */
// export const requestLocationPermission = async (): Promise<boolean> => {
//   try {
//     if (isIOS) {
//       const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
//       return status === RESULTS.GRANTED;
//     } else {
//       const fineLocation = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: "Location Permission",
//           message: "We need your location for attendance tracking",
//           buttonPositive: "Allow",
//           buttonNegative: "Deny",
//         }
//       );
//       const coarseLocation = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
//       );
//       return (
//         fineLocation === PermissionsAndroid.RESULTS.GRANTED &&
//         coarseLocation === PermissionsAndroid.RESULTS.GRANTED
//       );
//     }
//   } catch (error) {
//     console.warn("Location Permission Error:", error);
//     return false;
//   }
// };

// /* =========================
//    BACKGROUND LOCATION
// ========================= */
// export const requestBackgroundLocationPermission = async (): Promise<boolean> => {
//   try {
//     if (isIOS) {
//       const status = await request(PERMISSIONS.IOS.LOCATION_ALWAYS_AND_WHEN_IN_USE);
//       return status === RESULTS.GRANTED;
//     } else {
//       const status = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
//         {
//           title: "Background Location",
//           message: "We need background location for attendance tracking",
//           buttonPositive: "Allow",
//           buttonNegative: "Deny",
//         }
//       );
//       return status === PermissionsAndroid.RESULTS.GRANTED;
//     }
//   } catch (error) {
//     console.warn("Background Location Error:", error);
//     return false;
//   }
// };

// /* =========================
//    MICROPHONE PERMISSION
// ========================= */
// export const requestMicrophonePermission = async (): Promise<boolean> => {
//   try {
//     const permission = isIOS
//       ? PERMISSIONS.IOS.MICROPHONE
//       : PERMISSIONS.ANDROID.RECORD_AUDIO;
//     const status = await request(permission);
//     console.log("Microphone Permission Status:", status);
//     return status === RESULTS.GRANTED;
//   } catch (error) {
//     console.warn("Microphone Permission Error:", error);
//     return false;
//   }
// };

// /* =========================
//    CALENDAR PERMISSION
// ========================= */
// export const requestCalendarPermission = async (): Promise<boolean> => {
//   try {
//     if (isIOS) {
//       const status = await request(PERMISSIONS.IOS.CALENDARS);
//       return status === RESULTS.GRANTED;
//     } else {
//       const write = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR
//       );
//       const read = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.READ_CALENDAR
//       );
//       return (
//         write === PermissionsAndroid.RESULTS.GRANTED &&
//         read === PermissionsAndroid.RESULTS.GRANTED
//       );
//     }
//   } catch (error) {
//     console.warn("Calendar Permission Error:", error);
//     return false;
//   }
// };

// /* =========================
//    PHOTO LIBRARY PERMISSION
// ========================= */
// export const requestPhotoLibraryPermission = async (): Promise<boolean> => {
//   try {
//     if (isIOS) {
//       const status = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
//       return status === RESULTS.GRANTED;
//     } else {
//       const status = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
//       );
//       return status === PermissionsAndroid.RESULTS.GRANTED;
//     }
//   } catch (error) {
//     console.warn("Photo Library Permission Error:", error);
//     return false;
//   }
// };

// /* =========================
//    REQUEST ALL PERMISSIONS
// ========================= */
// export const requestAllPermissions = async (): Promise<boolean> => {
//   try {
//     console.log("🔐 Requesting all permissions...");

//     const results = await Promise.all([
//       requestCameraPermission(),
//       requestLocationPermission(),
//       requestBackgroundLocationPermission(),
//       requestMicrophonePermission(),
//       requestCalendarPermission(),
//       requestPhotoLibraryPermission(),
//     ]);

//     const allGranted = results.every((result) => result === true);

//     console.log("✅ Permissions Result:", {
//       camera: results[0],
//       location: results[1],
//       backgroundLocation: results[2],
//       microphone: results[3],
//       calendar: results[4],
//       photoLibrary: results[5],
//       allGranted,
//     });

//     return allGranted;
//   } catch (error) {
//     console.error("Error requesting permissions:", error);
//     return false;
//   }
// };

// /* =========================
//    CHECK PERMISSION
// ========================= */
// export const checkPermission = async (
//   permission: any
// ): Promise<any> => {
//   try {
//     return await check(permission);
//   } catch (error) {
//     console.warn("Check Permission Error:", error);
//     return RESULTS.DENIED;
//   }
// };

// /* =========================
//    OPEN APP SETTINGS
// ========================= */
// export const openAppSettings = () => {
//   if (isIOS) {
//     // iOS में settings खुलेगी
//     Alert.alert(
//       "Permission Required",
//       "Please enable permissions in Settings",
//       [
//         {
//           text: "Cancel",
//           onPress: () => {},
//           style: "cancel",
//         },
//         {
//           text: "Open Settings",
//           onPress: () => {
//             // iOS settings URL
//             const url = "app-settings:";
//             // या
//             // openSettings();
//           },
//         },
//       ]
//     );
//   } else {
//     // Android में settings खुलेगी
//     Alert.alert(
//       "Permission Required",
//       "Please enable permissions in App Settings",
//       [
//         {
//           text: "Cancel",
//           onPress: () => {},
//           style: "cancel",
//         },
//         {
//           text: "Open Settings",
//           onPress: () => {
//             // openSettings();
//           },
//         },
//       ]
//     );
//   }
// };
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
  Permission,
  PermissionStatus,
} from 'react-native-permissions';

const isIOS = Platform.OS === 'ios';
const androidApi = Number(Platform.Version);

/* =========================
   CAMERA PERMISSION
========================= */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permission = isIOS
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;
    const status = await request(permission);
    console.log('Camera Permission Status:', status);
    return status === RESULTS.GRANTED;
  } catch (error) {
    console.warn('Camera Permission Error:', error);
    return false;
  }
};

/* =========================
   LOCATION PERMISSION (When In Use / Foreground)
========================= */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (isIOS) {
      const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      console.log('iOS When-In-Use Location Status:', status);
      return status === RESULTS.GRANTED;
    }

    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    // Android 12+ mein user sirf approximate de sakta hai, isliye fine YA coarse chalega
    return (
      result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED ||
      result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (error) {
    console.warn('Location Permission Error:', error);
    return false;
  }
};

/* =========================
   BACKGROUND LOCATION (Always)
========================= */
export const requestBackgroundLocationPermission = async (): Promise<boolean> => {
  try {
    if (isIOS) {
      // iOS: pehle When-In-Use zaroori hai, phir Always upgrade
      const whenInUse = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (whenInUse !== RESULTS.GRANTED) {
        const res = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (res !== RESULTS.GRANTED) return false;
      }

      const always = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
      if (always === RESULTS.GRANTED) return true;

      const status = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      console.log('iOS Always Location Status:', status);
      return status === RESULTS.GRANTED;
    }

    // Android 9 aur neeche mein background permission alag se nahi hoti
    if (androidApi < 29) return true;

    // Android: foreground location pehle granted hona chahiye
    const fineGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    const coarseGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    );
    if (!fineGranted && !coarseGranted) return false;

    const already = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
    );
    if (already) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      {
        title: 'Background Location',
        message: 'We need background location for attendance tracking',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.warn('Background Location Error:', error);
    return false;
  }
};

/* =========================
   MICROPHONE PERMISSION
========================= */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const permission = isIOS
      ? PERMISSIONS.IOS.MICROPHONE
      : PERMISSIONS.ANDROID.RECORD_AUDIO;
    const status = await request(permission);
    console.log('Microphone Permission Status:', status);
    return status === RESULTS.GRANTED;
  } catch (error) {
    console.warn('Microphone Permission Error:', error);
    return false;
  }
};

/* =========================
   CALENDAR PERMISSION
========================= */
export const requestCalendarPermission = async (): Promise<boolean> => {
  try {
    if (isIOS) {
      const status = await request(PERMISSIONS.IOS.CALENDARS);
      return status === RESULTS.GRANTED;
    }

    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR,
      PermissionsAndroid.PERMISSIONS.READ_CALENDAR,
    ]);
    return (
      result[PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      result[PermissionsAndroid.PERMISSIONS.READ_CALENDAR] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (error) {
    console.warn('Calendar Permission Error:', error);
    return false;
  }
};

/* =========================
   PHOTO LIBRARY PERMISSION
========================= */
export const requestPhotoLibraryPermission = async (): Promise<boolean> => {
  try {
    if (isIOS) {
      const status = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      // iOS 14+ mein user "Limited" access de sakta hai, wo bhi valid hai
      return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
    }

    // Android 13+ (API 33) mein READ_EXTERNAL_STORAGE kaam nahi karta
    const permission =
      androidApi >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const status = await PermissionsAndroid.request(permission);
    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.warn('Photo Library Permission Error:', error);
    return false;
  }
};

/* =========================
   NOTIFICATION PERMISSION (Android 13+)
========================= */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (isIOS) {
      // iOS notifications ke liye apna notification library use karo
      return true;
    }
    if (androidApi < 33) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.warn('Notification Permission Error:', error);
    return false;
  }
};

/* =========================
   REQUEST ALL PERMISSIONS (SEQUENTIAL)
   iOS ek time pe ek hi system dialog dikhata hai,
   isliye Promise.all use nahi karna.
========================= */
export const requestAllPermissions = async (): Promise<boolean> => {
  try {
    console.log('🔐 Requesting all permissions...');

    const camera = await requestCameraPermission();
    const location = await requestLocationPermission();
    // background hamesha foreground location ke BAAD
    const backgroundLocation = location
      ? await requestBackgroundLocationPermission()
      : false;
    const microphone = await requestMicrophonePermission();
    const calendar = await requestCalendarPermission();
    const photoLibrary = await requestPhotoLibraryPermission();
    const notification = await requestNotificationPermission();

    const results = {
      camera,
      location,
      backgroundLocation,
      microphone,
      calendar,
      photoLibrary,
      notification,
    };

    const allGranted = Object.values(results).every(Boolean);
    console.log('✅ Permissions Result:', { ...results, allGranted });

    return allGranted;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

/* =========================
   CHECK PERMISSION
========================= */
export const checkPermission = async (
  permission: Permission
): Promise<PermissionStatus> => {
  try {
    return await check(permission);
  } catch (error) {
    console.warn('Check Permission Error:', error);
    return RESULTS.DENIED;
  }
};

/* =========================
   CHECK BACKGROUND LOCATION (status only, dialog nahi dikhata)
========================= */
export const hasBackgroundLocationPermission = async (): Promise<boolean> => {
  try {
    if (isIOS) {
      const status = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
      return status === RESULTS.GRANTED;
    }
    if (androidApi < 29) {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
    }
    return await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
    );
  } catch (error) {
    console.warn('Check Background Location Error:', error);
    return false;
  }
};

/* =========================
   OPEN APP SETTINGS
========================= */
export const openAppSettings = (
  message: string = isIOS
    ? 'Please enable permissions in Settings'
    : 'Please enable permissions in App Settings'
) => {
  Alert.alert('Permission Required', message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Open Settings',
      onPress: () => {
        openSettings().catch((e) => console.warn('Open Settings Error:', e));
      },
    },
  ]);
};