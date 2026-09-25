// import React from "react";
// import { LogBox, StatusBar, View, useColorScheme } from "react-native";
// import "react-native-gesture-handler";
// import SplashScreen from "react-native-splash-screen";

// /**
//  * ? Local Imports
//  */
// import Navigation from "./src/navigation";
// import {
//   ScreenHeight,
//   ScreenWidth,
//   isAndroid,
// } from "@freakycoder/react-native-helpers";
// import { AuthProvider } from "context/AuthContext";
// import { LoaderProvider, useLoader } from "context/LoaderContext";
// import LottieView from "lottie-react-native";

// LogBox.ignoreAllLogs();

// const App = () => {
//   const scheme = useColorScheme();
//   const isDarkMode = scheme === "dark";
//   const { isLoading } = useLoader();
//   React.useEffect(() => {
//     StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content");
//     if (isAndroid) {
//       StatusBar.setBackgroundColor("rgba(0,0,0,0)");
//       StatusBar.setTranslucent(true);
//     }

//     // setTimeout(() => {
//     //   SplashScreen.hide();
//     // }, 750);
//   }, [scheme, isDarkMode]);

//   return (
//     <>
//       <AuthProvider>
//         <Navigation />
//         <LoaderProvider>
//           {isLoading === true ? (
//             <View>
//               <LottieView
//                 loop
//                 autoPlay
//                 source={require("/assets/gif/loader-advance.json")}
//                 style={{
//                   width: ScreenWidth,
//                   height: ScreenHeight,
//                   zIndex: 99,
//                 }}
//               />
//             </View>
//           ) : (
//             <></>
//           )}
//         </LoaderProvider>
//       </AuthProvider>
//     </>
//   );
// };

// export default App;
import React, { useEffect } from "react";
import Orientation from "react-native-orientation-locker";
import {
  Alert,
  LogBox,
  StatusBar,
  View,
  useColorScheme,
} from "react-native";
import "react-native-gesture-handler";
import SplashScreen from "react-native-splash-screen";
import Navigation from "./src/navigation";
import {
  ScreenHeight,
  ScreenWidth,
  isAndroid,
} from "@freakycoder/react-native-helpers";
import { AuthProvider } from "context/AuthContext";
import { LoaderProvider, useLoader } from "context/LoaderContext";
import LottieView from "lottie-react-native";
import { Image } from "react-native";
import { useState } from "react";
import ForceUpdateScreen from "./ForceUpdateScreen";
import { checkForceUpdate } from "./versionCheck";
import Toast from "react-native-toast-message";
LogBox.ignoreAllLogs();

const App = () => {
  const [forceUpdate, setForceUpdate] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    SplashScreen.hide();

    (async () => {
      const mustUpdate = await checkForceUpdate();
      setForceUpdate(mustUpdate);
      setChecked(true);
    })();
  }, []);

  // Optional splash/loading
  if (!checked) return null;

  if (forceUpdate) {
    return <ForceUpdateScreen />; // 🔒 BLOCK APP
  }

  return (
    <AuthProvider>
      <LoaderProvider>
        <AppWithLoader />
      </LoaderProvider>
    </AuthProvider>
  );
};

const AppWithLoader = () => {
  const scheme = useColorScheme();
  const isDarkMode = scheme === "dark";
  const { isLoading, setIsLoading } = useLoader();

  useEffect(() => {
    Orientation.lockToPortrait();
    if (isAndroid) {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
    }
    StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content");
    setTimeout(() => {
      setIsLoading(false);
    }, 750);
  }, [scheme, isDarkMode]);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDarkMode ? "light-content" : "dark-content"}
      />
      <Navigation />
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: ScreenWidth,
            height: ScreenHeight,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 0,
            zIndex: 99,
            backgroundColor: "white",
          }}
        >
          <Image
            style={{ height: 120, width: 120, borderRadius: 50, position: "absolute", top: ScreenHeight * 0.3 }}
            height={20}
            width={20}
            source={require("./assets/camera/ic_launchers.png")}
          />
          <LottieView
            loop
            autoPlay
            source={require("./src/assets/images/camera/Animation - 1746700246889.json")}
            style={{
              width: ScreenWidth,
              height: ScreenHeight * 0.27,
            }}
          />
        </View>
      )}
    </>
  );
};

export default App;
