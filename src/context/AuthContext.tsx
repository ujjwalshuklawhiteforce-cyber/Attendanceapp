// // // contexts/AuthContext.tsx
// // import React, {
// //   createContext,
// //   useState,
// //   useEffect,
// //   useContext,
// //   ReactNode,
// // } from "react";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useLoader } from "./LoaderContext";
// // import { Alert } from "react-native";

// // interface AuthContextData {
// //   isLoggedIn: boolean;
// //   isadmine:boolean;
// //   isdata:any;
// //   setdata:any;
// //   isdatas:any;
// //   setdatas:any;
// //   userInfo: any;
// //   isOnboarded: any;
// //   login: (newState: any) => void;
// //   logout: () => void;
// //   setOnboard: (ISONBOARDED: any) => void;
// // }

// // const userInitialValue = {
// //   isLoggedIn: false,
// //   isadmine:false,
// //   userInfo: "",
// //   isOnboarded: false,
// //   isdata:"",
// //   setdata:"",
// //   isdatas:"",
// //   setdatas:"",
// //   login: () => {},
// //   logout: () => {},
// //   setOnboard: () => {},
// // };

// // const AuthContext = createContext<AuthContextData>(userInitialValue);

// // export const AuthProvider: React.FC<{ children: ReactNode }> = ({
// //   children,
// // }) => {
// //   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
// //     userInitialValue.isLoggedIn
// //   );
// //   const [isadmine, setisadmine] = useState<boolean>(
// //     userInitialValue.isadmine
// //   );
// //   const[isdata,setdata]=useState<any>(userInitialValue.isdata)
// //   const[isdatas,setdatas]=useState<any>(userInitialValue.isdata)

// //   const [userInfo, setUserInfo] = useState<any>(userInitialValue.userInfo);
// //   const [isOnboarded, setIsOnboarded] = useState<any>(
// //     userInitialValue.isOnboarded
// //   );
// //   const { setIsLoading } = useLoader();

// //   useEffect(() => {
// //     // setIsLoading(true);
// //     const loadUserData = async () => {
// //       const isAdminValue = await AsyncStorage.getItem("isadmine");
// // const isAdmin = JSON.parse(isAdminValue || 'false');
// // // Alert.alert("issff",`${isAdmin}`)
// //  // defaults to false if null
// // setisadmine(isAdmin)
// // console.log('Is Admin:', isAdmin);

// //       const userData = await AsyncStorage.getItem("userData");
// //       const onboarding = await AsyncStorage.getItem("isonboarded");
// //       setUserInfo(userData);
      
// //       if (userData) {
// //         userInitialValue.isLoggedIn = false;
// //         // setIsLoading(true);
// //         setIsLoggedIn(true);
// //       } else {
// //         userInitialValue.isLoggedIn = false;
// //         setIsLoggedIn(false);
// //       }

// //       if (onboarding) {
// //         setIsOnboarded(true);
// //       } else {
// //         setIsOnboarded(false);
// //       }
// //     };

// //     loadUserData();
// //   }, []);

// //   const login = async (userData: any) => {
// //     await AsyncStorage.setItem("userData", JSON.stringify(userData));
// //     setUserInfo(JSON.stringify(userData.data));
// //     if(userData.data.data.can_add_task==true) {
// // setisadmine(true)
// // userInitialValue.isadmine=true;
// // await AsyncStorage.setItem("isadmine", JSON.stringify(true));

// //     }
// //     else{
// //       setisadmine(false)
// // userInitialValue.isadmine=false;
// //     }
    
// //     setIsLoggedIn(true);
// //   };

// //   const logout = async () => {
// //     await AsyncStorage.removeItem("userData");
// //     await AsyncStorage.removeItem("isadmine", );

// //     setIsLoggedIn(false);
// //   };

// //   const setOnboard = async (ISONBOARDED: any) => {
// //     await AsyncStorage.setItem("isonboarded", JSON.stringify(ISONBOARDED));
// //     setIsOnboarded(true);
// //   };

// //   return (
// //     <AuthContext.Provider
// //       value={{ isdatas,setdatas,isdata,setdata,isLoggedIn,isadmine, login, logout, userInfo, isOnboarded, setOnboard }}
// //     >
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // export const useAuth = () => {
// //   const context = useContext(AuthContext);
// //   if (context === undefined) {
// //     throw new Error("useAuth must be used within an AuthProvider");
// //   }
// //   return context;
// // };
// import React, {
//   createContext,
//   useState,
//   useEffect,
//   useContext,
//   ReactNode,
// } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useLoader } from "./LoaderContext";
// import { Alert } from "react-native";

// interface AuthContextData {
//   isLoggedIn: boolean;
//   isadmine: boolean;
//   isdata: any;
//   setdata: any;
//   isdatas: any;
//   setdatas: any;
//   userInfo: any;
//   isOnboarded: boolean;
//   isLoading: boolean; // Added this
//   login: (newState: any) => void;
//   logout: () => void;
//   setOnboard: (ISONBOARDED: any) => void;
// }

// const userInitialValue = {
//   isLoggedIn: false,
//   isadmine: false,
//   userInfo: "",
//   isOnboarded: false,
//   isLoading: true, // Added this
//   isdata: "",
//   setdata: () => {},
//   isdatas: "",
//   setdatas: () => {},
//   login: () => {},
//   logout: () => {},
//   setOnboard: () => {},
// };

// const AuthContext = createContext<AuthContextData>(userInitialValue);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
//   const [isadmine, setisadmine] = useState<boolean>(false);
//   const [isdata, setdata] = useState<any>("");
//   const [isdatas, setdatas] = useState<any>("");
//   const [userInfo, setUserInfo] = useState<any>("");
//   const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(true); // Critical: Track loading state
  
//   const { setIsLoading: setGlobalLoading } = useLoader();

//   useEffect(() => {
//     loadUserData();
//   }, []);

//   const loadUserData = async () => {
//     try {
//       setIsLoading(true); // Start loading

//       // Load all data in parallel for faster loading
//       const [isAdminValue, userData, onboarding] = await Promise.all([
//         AsyncStorage.getItem("isadmine"),
//         AsyncStorage.getItem("userData"),
//         AsyncStorage.getItem("isonboarded"),
//       ]);

//       console.log("Loading auth data:", { isAdminValue, userData, onboarding });
// Alert.alert('User Data:', isAdminValue || 'No user data found');
//       // Parse admin status
//       const isAdmin = JSON.parse(isAdminValue || 'false');
//       setisadmine(isAdmin);
//       Alert.alert('Is Admin:', isAdmin);
//       // Set user info and login status
//       if (userData) {
//         setUserInfo(userData);
//         setIsLoggedIn(true);
//       } else {
//         setUserInfo("");
//         setIsLoggedIn(false);
//       }

//       // Set onboarding status
//       if (onboarding) {
//         const onboardingStatus = JSON.parse(onboarding);
//         setIsOnboarded(onboardingStatus === true);
//         console.log('Onboarding status:', onboardingStatus);
//       } else {
//         setIsOnboarded(false);
//       }

//     } catch (error) {
//       console.error("Error loading user data:", error);
//       // On error, set to logged out state
//       setIsLoggedIn(false);
//       setIsOnboarded(false);
//       setisadmine(false);
//       setUserInfo("");
//     } finally {
//       // CRITICAL: Always set loading to false
//       setIsLoading(false);
//       console.log("Auth loading complete");
//     }
//   };

//   const login = async (userData: any) => {
//     try {
//       console.log(" 😁😁😁😁😁😁😁😁😁😁😁Logging in with user data:", userData);
//       await AsyncStorage.setItem("userData", JSON.stringify(userData));
//       setUserInfo(JSON.stringify(userData.data));
      
//       // Check if user is admin
//       if (userData.data?.data?.can_add_task=== true) {
//         console.log(" 😂😂😂😂😂😂😂😂User is admin" ,userData.data?.data?.can_add_task);             
//         setisadmine(true);
//         await AsyncStorage.setItem("isadmin", JSON.stringify(true));
//         console.log("Admin status saved to storage");
//       } else {
//         setisadmine(false);
//       }
      
//       setIsLoggedIn(true);
      
//       // Check if onboarding is already completed
//       const onboarding = await AsyncStorage.getItem("isonboarded");
//       if (onboarding) {
//         const onboardingStatus = JSON.parse(onboarding);
//         setIsOnboarded(onboardingStatus === true);
//       }
//     } catch (error) {
//       console.error("Error during login:", error);
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await AsyncStorage.multiRemove([
//         "userData",
//         "isadmine",
//         "isonboarded"
//       ]);
      
//       setIsLoggedIn(false);
//       setisadmine(false);
//       setIsOnboarded(false);
//       setUserInfo("");
//     } catch (error) {
//       console.error("Error during logout:", error);
//       throw error;
//     }
//   };

//   const setOnboard = async (ISONBOARDED: any) => {
//     try {
//       await AsyncStorage.setItem("isonboarded", JSON.stringify(ISONBOARDED));
//       setIsOnboarded(true);
//       console.log("Onboarding completed");
//     } catch (error) {
//       console.error("Error setting onboarding:", error);
//       throw error;
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         isdatas,
//         setdatas,
//         isdata,
//         setdata,
//         isLoggedIn,
//         isadmine,
//         isLoading, // Expose loading state
//         login,
//         logout,
//         userInfo,
//         isOnboarded,
//         setOnboard,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }; 
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLoader } from "./LoaderContext";
interface AuthContextData {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isdata: any;
  setdata: any;
  isdatas: any;
  setdatas: any;
  userInfo: any;
  isOnboarded: boolean;
  isLoading: boolean;
  login: (newState: any) => void;
  logout: () => void;
  setOnboard: (ISONBOARDED: any) => void;
}

const userInitialValue = {
  isLoggedIn: false,
  isAdmin: false,
  userInfo: "",
  isOnboarded: false,
  isLoading: true,
  isdata: "",
  setdata: () => {},
  isdatas: "",
  setdatas: () => {},
  login: () => {},
  logout: () => {},
  setOnboard: () => {},
};

const AuthContext = createContext<AuthContextData>(userInitialValue);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isdata, setdata] = useState<any>("");
  const [isdatas, setdatas] = useState<any>("");
  const [userInfo, setUserInfo] = useState<any>("");
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { setIsLoading: setGlobalLoading } = useLoader();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);

      // Load all data in parallel for faster loading
      const [isAdminValue, userData, onboarding] = await Promise.all([
        AsyncStorage.getItem("isAdmin"),
        AsyncStorage.getItem("userData"),
        AsyncStorage.getItem("isonboarded"),
      ]);

      console.log("Loading auth data:", { isAdminValue, userData, onboarding });
      
      // Parse admin status
      const isAdminParsed = JSON.parse(isAdminValue || 'false');
      setIsAdmin(isAdminParsed);
      console.log('Is Admin:', isAdminParsed);

      // Set user info and login status
      if (userData) {
        setUserInfo(userData);
        setIsLoggedIn(true);
      } else {
        setUserInfo("");
        setIsLoggedIn(false);
      }

      // Set onboarding status
      if (onboarding) {
        const onboardingStatus = JSON.parse(onboarding);
        setIsOnboarded(onboardingStatus === true);
        console.log('Onboarding status:', onboardingStatus);
      } else {
        setIsOnboarded(false);
      }

    } catch (error) {
      console.error("Error loading user data:", error);
      // On error, set to logged out state
      setIsLoggedIn(false);
      setIsOnboarded(false);
      setIsAdmin(false);
      setUserInfo("");
    } finally {
      // CRITICAL: Always set loading to false
      setIsLoading(false);
      console.log("Auth loading complete");
    }
  };

  const login = async (userData: any) => {
    try {
      console.log("😁 Logging in with user data:", userData);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      // Store full userData so userInfo structure matches on reload
      // (AsyncStorage stores full userData; setUserInfo must match the same shape)
      setUserInfo(JSON.stringify(userData));
      
      // Check if user is admin
      if (userData.data?.data?.can_add_task === true) {
        console.log("😂 User is admin", userData.data?.data?.can_add_task);             
        setIsAdmin(true);
        await AsyncStorage.setItem("isAdmin", JSON.stringify(true));
        console.log("Admin status saved to storage");
      } else {
        setIsAdmin(false);
        await AsyncStorage.setItem("isAdmin", JSON.stringify(false));
      }
      
      setIsLoggedIn(true);
      
      // Check if onboarding is already completed
      const onboarding = await AsyncStorage.getItem("isonboarded");
      if (onboarding) {
        const onboardingStatus = JSON.parse(onboarding);
        setIsOnboarded(onboardingStatus === true);
      }
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "userData",
        "isAdmin",
        "isonboarded"
      ]);
      
      setIsLoggedIn(false);
      setIsAdmin(false);
      setIsOnboarded(false);
      setUserInfo("");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const setOnboard = async (ISONBOARDED: any) => {
    try {
      await AsyncStorage.setItem("isonboarded", JSON.stringify(ISONBOARDED));
      setIsOnboarded(true);
      console.log("Onboarding completed");
    } catch (error) {
      console.error("Error setting onboarding:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isdatas,
        setdatas,
        isdata,
        setdata,
        isLoggedIn,
        isAdmin,
        isLoading,
        login,
        logout,
        userInfo,
        isOnboarded,
        setOnboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};