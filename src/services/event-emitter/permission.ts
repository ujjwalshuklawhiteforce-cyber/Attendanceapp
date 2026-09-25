// import { PermissionsAndroid, Platform } from "react-native";
// import { promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";
// import {
//   check,
//   request,
//   RESULTS,
//   PermissionStatus,
//   PERMISSIONS,
// } from "react-native-permissions";

// export const isIOS = Platform.OS === "ios";

// /* =========================
//    CAMERA PERMISSION
// ========================= */
// export const requestCameraPermission = async (): Promise<boolean> => {
//   try {
//     if (isIOS) {
//       const status = await request(PERMISSIONS.IOS.CAMERA);
//       return status === RESULTS.GRANTED;
//     }

//     const granted = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.CAMERA,
//       {
//         title: "Camera Permission Required",
//         message: "Camera access is required for attendance verification.",
//         buttonNegative: "Deny",
//         buttonPositive: "Allow",
//       }
//     );

//     return granted === PermissionsAndroid.RESULTS.GRANTED;
//   } catch (error) {
//     console.warn(error);
//     return false;
//   }
// };

// /* =========================
//    LOCATION PERMISSION
// ========================= */
// export const requestLocationPermission = async (): Promise<boolean> => {
//   try {
//     await promptForEnableLocationIfNeeded();

//     const fine = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
//     );

//     const coarse = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
//     );

//     const background = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
//     );

//     return (
//       fine === PermissionsAndroid.RESULTS.GRANTED &&
//       coarse === PermissionsAndroid.RESULTS.GRANTED &&
//       background === PermissionsAndroid.RESULTS.GRANTED
//     );
//   } catch (error) {
//     console.warn(error);
//     return false;
//   }
// };

// /* =========================
//    CALENDAR PERMISSION
// ========================= */
// export const requestCalendarPermission = async (): Promise<boolean> => {
//   try {
//     const write = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR
//     );

//     const read = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.READ_CALENDAR
//     );

//     return (
//       write === PermissionsAndroid.RESULTS.GRANTED &&
//       read === PermissionsAndroid.RESULTS.GRANTED
//     );
//   } catch (error) {
//     console.warn(error);
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
//     return status === RESULTS.GRANTED;
//   } catch (error) {
//     console.warn(error);
//     return false;
//   }
// };

// /* =========================
//    GENERIC CHECK
// ========================= */
// export const checkPermission = async (
//   permission: any
// ): Promise<PermissionStatus> => {
//   return await check(permission);
// };
import { PermissionsAndroid, Platform, Linking, Alert } from "react-native";
import { promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";
import {
  check,
  request,
  RESULTS,
  PermissionStatus,
  PERMISSIONS,
  openSettings,
} from "react-native-permissions";

export const isIOS = Platform.OS === "ios";

/* =========================
   CAMERA PERMISSION
========================= */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    if (isIOS) {
      const status = await request(PERMISSIONS.IOS.CAMERA);
      
      // If blocked, guide user to settings
      if (status === RESULTS.BLOCKED || status === RESULTS.DENIED) {
        Alert.alert(
          "Camera Permission Required",
          "Please enable camera access in your device settings to register your face.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => openSettings() }
          ]
        );
        return false;
      }
      
      return status === RESULTS.GRANTED;
    }

    // Android
    const currentStatus = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );

    // If already granted, return true
    if (currentStatus) {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: "Camera Permission Required",
        message: "Camera access is required for attendance verification.",
        buttonNegative: "Deny",
        buttonPositive: "Allow",
      }
    );

    // If permanently denied (never_ask_again), guide to settings
    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        "Camera Permission Required",
        "You have permanently denied camera access. Please enable it in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.warn(error);
    return false;
  }
};

/* =========================
   LOCATION PERMISSION
========================= */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    await promptForEnableLocationIfNeeded();

    // Check current permissions first
    const fineCheck = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    const coarseCheck = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    );
    
    // If already granted, skip to background
    let fine = fineCheck ? PermissionsAndroid.RESULTS.GRANTED : null;
    let coarse = coarseCheck ? PermissionsAndroid.RESULTS.GRANTED : null;

    if (!fine) {
      fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission Required",
          message: "Location access is required for attendance verification.",
          buttonNegative: "Deny",
          buttonPositive: "Allow",
        }
      );
    }

    if (!coarse) {
      coarse = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: "Location Permission Required",
          message: "Location access is required for attendance verification.",
          buttonNegative: "Deny",
          buttonPositive: "Allow",
        }
      );
    }

    const background = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      {
        title: "Background Location Permission",
        message: "Background location access helps track your attendance accurately.",
        buttonNegative: "Deny",
        buttonPositive: "Allow",
      }
    );

    const allGranted = 
      fine === PermissionsAndroid.RESULTS.GRANTED &&
      coarse === PermissionsAndroid.RESULTS.GRANTED &&
      background === PermissionsAndroid.RESULTS.GRANTED;

    // If any permission is permanently denied
    if (
      fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
      coarse === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
      background === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    ) {
      Alert.alert(
        "Location Permission Required",
        "You have permanently denied location access. Please enable it in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }

    return allGranted;
  } catch (error) {
    console.warn(error);
    return false;
  }
};

/* =========================
   CALENDAR PERMISSION
========================= */
export const requestCalendarPermission = async (): Promise<boolean> => {
  try {
    const write = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR
    );

    const read = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CALENDAR
    );

    return (
      write === PermissionsAndroid.RESULTS.GRANTED &&
      read === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (error) {
    console.warn(error);
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
    return status === RESULTS.GRANTED;
  } catch (error) {
    console.warn(error);
    return false;
  }
};

/* =========================
   GENERIC CHECK
========================= */
export const checkPermission = async (
  permission: any
): Promise<PermissionStatus> => {
  return await check(permission);
};