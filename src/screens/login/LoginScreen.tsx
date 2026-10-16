
import React, { useMemo, useRef, useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import Orientation from 'react-native-orientation-locker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import DeviceInfo from "react-native-device-info";
import { checkForceUpdate } from "../../../versionCheck";
import {
  Alert,
  BackHandler,
  Image,
  ImageBackground,
  Keyboard,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import createStyles from "./LoginScreen.style";
import LottieView from "lottie-react-native";
import {
  requestCameraPermission,
  requestLocationPermission,
} from "@services/event-emitter/permission";
import { useAuth } from "context/AuthContext";
import axios from "axios";
import { useLoader } from "context/LoaderContext";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import Resisterfacecamera from "@shared-components/registercamera/Registerfacecamera";

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const navigation = useNavigation();
  const { setIsLoading } = useLoader()
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  // common
  const [focusedInput, setFocusedInput] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [version, setversion] = useState("")
  // form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  // Camera
  const [isActiveCamera, setIsActiveCamera] = useState(false);
  const [userId, setuserId] = useState("");
  const [loginresult, setloginresult] = useState()
  const [loading, setloading] = useState(false)
  //  ref
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleFocus = (inputName: string) => {
    setFocusedInput(inputName);
  };
  useEffect(() => {
    const update = DeviceInfo.getVersion();
    setversion(update)
  }, [version])

  const handleBlur = () => {
    setFocusedInput("");
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleNext = () => {
    passwordRef?.current.focus();
  };


  const validateForm = () => {
    if (!email && !password) {
      setErrorMessage("Enter your email and password.");
      setErrorModalVisible(true);
      return false;
    }

    if (!email) {
      setErrorMessage("Enter your email.");
      setErrorModalVisible(true);
      return false;
    }

    if (!password) {
      setErrorMessage("Enter your password.");
      setErrorModalVisible(true);
      return false;
    }

    return true;
  };
const handleSubmit = async () => {
  if (!validateForm()) return;

  setloading(true);
  setIsLoading(true);

  try {
    const data = { username: email, password };
    const loginResult = await axios.post(
      "https://whiteforcepayroll.com/admin/api/employee-login",
      data,
      { headers: { "Content-Type": "application/json" } }
    );
    
    console.log("Login Result:", loginResult.data);
    const userId = loginResult?.data?.data?.user_id;
    setuserId(userId);

    if (!userId) {
      setErrorModalVisible(true);
      setErrorMessage("Invalid email or password.");
      return;
    }

    // ✅ FIX: Remove space from URL
    const faceDetailsResult = await axios.post(
      "https://whiteforcepayroll.com/admin/api/get-user-face-details", // ✅ No space
      { user_id: userId, is_embedded: true },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Face Details Response:", faceDetailsResult.data); // ✅ Add log

    if (faceDetailsResult.data?.data?.face_embedded_1) {
      const embedding1 = faceDetailsResult.data?.data?.face_embedded_1;
      const embedding2 = faceDetailsResult.data?.data?.face_embedded_2;
      const embedding3 = faceDetailsResult.data?.data?.face_embedded_3;
      
      console.log("Embeddings fetched successfully"); // ✅ Add log
      
      login(loginResult);
    } else {
      console.log("No face embedding found"); // ✅ Add log
      setModalVisible(true);
    }
  } catch (err) {
    console.error("handleSubmit Error:", err.message); // ✅ Better error log
    console.error("Error Details:", err.response?.data); // ✅ API error details
    
    Alert.alert("Error", err.response?.data?.message || "Something went wrong, try again."); // ✅ Fix typo
  }

  setloading(false);
  setIsLoading(false);
};

  const handlePermission = async () => {
    // Request permissions every time the button is clicked
    const cameraPermission = await requestCameraPermission();
    const locationPermission = await requestLocationPermission();

    if (cameraPermission && locationPermission) {
      setIsActiveCamera(true);
      setModalVisible(false);
      console.log("tarun");
    } else {
      // Show alert to guide user if permissions are denied
      Alert.alert(
        "Permissions Required",
        "Camera and Location permissions are required to register your face. Please enable them in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Try Again",
            onPress: () => handlePermission() // Allow user to try again
          }
        ]
      );
      setIsActiveCamera(false);
    }
  };

  useEffect(() => {
    setIsLoading(false)
    const backAction = () => {
      setIsActiveCamera(false);
      BackHandler.exitApp();
      return true;
    };
    Orientation.lockToPortrait();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const renderContent = () => (

    <View

      onTouchStart={() => {
        dismissKeyboard();
      }}
    >


      <View   >
        <View style={styles.headingContainer}>
          <Image style={{ width: 200, height: 200, marginTop: 80 }} source={require("../../../assets/camera/whiteforcelogo.png")} />
        </View>


      </View>


    </View>


  );

  const renderForm = () => (
    <View style={{
      flex: 1, backgroundColor: "white",
      borderTopLeftRadius: 130, borderBottomEndRadius: 150,

      marginTop: ScreenHeight * 0.04, height: ScreenHeight * 0.60, width: ScreenWidth * 1
    }}>
      <View style={{ width: ScreenWidth * 1, justifyContent: "center" }}>

        <Text color="black" style={{ fontSize: 23, fontWeight: "bold", textAlign: "center", marginTop: ScreenHeight * 0.12 }}>
          Welcome to <Text color="rgb(29,91,65)" style={{ color: "rgb(29,91,65)", fontWeight: "bold" }}>
            HR Attendance
          </Text>
        </Text>
      </View>
      <View style={{
        flex: 1, backgroundColor: "white",
        borderTopLeftRadius: 100, borderBottomRightRadius: 150,
        width: ScreenWidth * 1
      }}>

        <View style={styles.formContainer}>

          <View style={styles.inputField}>
            <Text
              style={[
                styles.legendFocused
              ]}
            >
              Email
            </Text>
            <TextInput
              value={email}
              style={[
                styles.input,
                focusedInput === "email" ? styles.focusInput : styles.blurInput,
              ]}
              ref={emailRef}
              autoComplete="off"
              autoCapitalize="none"
              inputMode="email"
              enterKeyHint="next"
              keyboardType="email-address"
              placeholder="example@white-force.com"
              placeholderTextColor={colors.subtitle}
              returnKeyType="next"
              onSubmitEditing={() => handleNext()}
              onFocus={() => {
                handleFocus("email");
              }}
              onBlur={() => {
                handleBlur();
              }}
              onChangeText={(text: any) => {
                setEmail(text);
              }}
            />
          </View>
          <View style={styles.inputField}>
            <Text style={[
              // styles.inputLabel,
              styles.legendFocused
            ]} color="black">Password</Text>
            <TextInput
              value={password}
              style={[
                styles.input,
                focusedInput === "password" ? styles.focusInput : styles.blurInput,
              ]}
              ref={passwordRef}
              autoComplete="off"
              autoCapitalize="none"
              inputMode="text"
              secureTextEntry={!showPassword}
              placeholder="***************"
              placeholderTextColor={colors.subtitle}
              onSubmitEditing={() => handleSubmit()}

              onFocus={() => {
                handleFocus("password");
              }}
              onBlur={() => {
                handleBlur();
              }}
              onChangeText={(text: any) => {
                setPassword(text);

              }}
            />
            <TouchableOpacity
              style={{ position: "absolute", right: 30, top: 25 }}
              onPress={() => setShowPassword((prev) => !prev)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="rgb(29,91,65)"
              />
            </TouchableOpacity>
          </View>
          <View
            style={styles.forgetPass}
            onTouchStart={() => {
              dismissKeyboard();
            }}
          >
            <TouchableOpacity style={{ display: "flex", flexDirection: "column", alignItems: "center" }} onPress={() => navigation.navigate("ForgetPassword")}>
              <Text color="rgb(29,91,65)" style={styles.forgetPassText}>
                Forget Password
              </Text>
              <Text style={{ width: ScreenWidth * 0.35, backgroundColor: "rgb(29,91,65)", height: 4, margin: 10 }}></Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity onPress={handleSubmit} >
              <View
                style={[
                  styles.button,
                  // { opacity: isFormValid && !loading ? 1 : 0.5 },
                ]}

              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text color="white" style={styles.buttonText}>Login</Text>
                )}
              </View>
            </TouchableOpacity>

            <Text style={{ alignSelf: "center", marginTop: 30, color: "rgb(29,91,65)" }}>  White-Force Attendance - {version}</Text>
          </View>
        </View>
      </View>
    </View>

  );

  const renderCamera = () => (
    <View>
      {isActiveCamera ? (
        <View style={styles.cameraContainer}>
          <Resisterfacecamera
            isActive={isActiveCamera}
            loginResult={loginresult}
            email={email} // Pass email as a prop
            password={password} //
            style={styles}
            setIsActiveCamera={setIsActiveCamera}
            userid={userId}
            setModalVisible={setModalVisible}
          ></Resisterfacecamera>
        </View>
      ) : null}

    </View>
  );

  const renderContainer = () => (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground style={{ backgroundColor: "#1e3830", height: ScreenHeight * 0.5, }} source={require("../../../assets/camera/loginbackground.png")}>

          {renderContent()}
        </ImageBackground>
        <View style={{ marginTop: -ScreenWidth * 0.35 }}>
          {renderForm()}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={{ backgroundColor: "#1e3830", }}>
      {renderCamera()}
      {/* <ImageBackground style={{backgroundColor:"#518c79",  }} source={require("../../../assets/camera/loginbackground.png")}> */}


      <SafeAreaView style={{ marginTop: -50 }} >
        {renderContainer()}
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <ImageBackground style={styles.modalContainerregister1} source={require("../../../assets/camera/facedetailsbackground.png")}>
            <View style={styles.modalContainerregister}>
              <View style={styles.modalContentregister}>
                <View style={styles.modalImageContainerregister}>
                  <Image style={{ width: 150, height: 150 }} source={require("../../../assets/camera/scannerface.png")} />
                  {/* <LottieView
                            loop
                            autoPlay
                            source={require("/assets/gif/face-recognition.json")}
                            style={styles.modalImage}
                          /> */}
                </View>
                <View style={styles.modalHeadingContainerregister}>
                  <Text style={styles.modalHeading} color={"rgb(29,91,65)"} bold>
                    Logged In{" "}
                    <Text color={"white"} bold>
                      Successfully
                    </Text>
                  </Text>
                  <Text style={styles.modalSubHeading} color={colors.subtitle}>
                    Please register your face to continue {"\n"} and put your
                    attendance.
                  </Text>
                </View>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      handlePermission();
                      Keyboard.dismiss();
                      setIsLoading(false)
                      setloading(false)
                    }}
                  >
                    <View style={[styles.modalButtonregister]}>
                      <Text style={styles.buttonText} color={colors.black}>
                        Register Face
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={errorModalVisible}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalImageContainer}>
                <LottieView
                  loop
                  autoPlay
                  source={require("../../../assets/camera/error.json")}
                  style={styles.modalImage}
                />
              </View>
              <View style={styles.modalHeadingContainer}>
                <Text style={styles.modalHeading} color={colors.black} bold>
                  <Text color={colors.danger} bold>
                    Login Failed
                  </Text>
                </Text>
                <Text style={styles.modalSubHeading} color={colors.subtitle}>
                  {errorMessage || "Please check your Email Id or Password!"}
                </Text>
              </View>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setErrorModalVisible(false);
                    setloading(false)
                    setIsLoading(false)
                  }}
                >
                  <View style={[styles.modalButton]}>
                    <Text style={styles.buttonText} color={colors.white}>
                      Okay
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      {/* </ImageBackground> */}
    </View>
  );
};

export default LoginScreen;
