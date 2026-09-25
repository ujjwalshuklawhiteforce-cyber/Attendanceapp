import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Image,
  ImageBackground,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Orientation from "react-native-orientation-locker";
import LottieView from "lottie-react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import {
  requestCameraPermission,
  requestLocationPermission,
} from "@services/event-emitter/permission";

import Resisterfacecamera from "@shared-components/registercamera/Registerfacecamera";
import Text from "@shared-components/text-wrapper/TextWrapper";
import { useAuth } from "context/AuthContext";
const FaceMatchScreen = ({ userId, loginResult, onSuccess }) => {
  const [modalVisible, setModalVisible] = useState(true);
  const [isActiveCamera, setIsActiveCamera] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
    const { userInfo } = useAuth();
      const parseData = JSON.parse(userInfo || "{}");
 const userid = parseData?.data?.data?.user_id
  const user_id = parseData["data"]?.user_id ? parseData["data"]?.user_id : userid;
  useEffect(() => {
    const backAction = () => { setIsActiveCamera(false); BackHandler.exitApp(); return true; };

    Orientation.lockToPortrait();
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  // 🚀 OPEN CAMERA
  const openCamera = async () => {
    if (
      (await requestCameraPermission()) &&
      (await requestLocationPermission())
    ) {
      setModalVisible(false); 
      setIsActiveCamera(true);
    }
  };

  return (
    <View style={{ flex: 1, width: ScreenWidth, height: ScreenHeight, backgroundColor: "#1e3830" }}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* 📷 CAMERA SCREEN */}
        {isActiveCamera && (
          <View style={{
            position: "absolute",
            width: ScreenWidth,
            height: ScreenHeight,
            top: 0,
            left: 0,
            zIndex: 9,
          }}>
            <Resisterfacecamera
              userid={ user_id}
              loginResult={loginResult}
              isActive={isActiveCamera}
              setIsActiveCamera={setIsActiveCamera}
              setModalVisible={setModalVisible}
              onSuccess={onSuccess}
            />
          </View>
        )}

        {/* 🟢 FACE REGISTER MODAL */}
        <Modal animationType="slide" transparent visible={modalVisible}>
          <ImageBackground
            source={require("../../../../assets/camera/facedetailsbackground.png")}
            style={{
              width: ScreenWidth,
              height: ScreenHeight,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{
              width: ScreenWidth,
              height: ScreenHeight * 0.5,
              alignItems: "center",
              justifyContent: "center",
              gap: 30,
            }}>
              <Image
                source={require("../../../../assets/camera/scannerface.png")}
                style={{ width: 150, height: 150 }}
              />

              <Text style={{ fontSize: ScreenWidth * 0.06 }} color="rgb(29,91,65)" bold>
                Face <Text color="white">Registration</Text>
              </Text>

              <Text
                style={{
                  fontSize: ScreenWidth * 0.035,
                  textAlign: "center",
                  color: "#666",
                }}
              >
                Please register your face to continue {"\n"} and put your attendance.
              </Text>

              <TouchableOpacity onPress={openCamera}>
                <View style={{
                  width: ScreenWidth * 0.8,
                  backgroundColor: "white",
                  paddingVertical: ScreenWidth * 0.04,
                  borderRadius: 10,
                  alignItems: "center",
                }}>
                  <Text style={{ fontSize: ScreenWidth * 0.045 }} color="black">
                    Register Face
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </Modal>

        {/* 🔴 ERROR MODAL */}
        <Modal animationType="fade" transparent visible={errorModalVisible}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <View style={{
              backgroundColor: "white",
              width: ScreenWidth,
              height: ScreenHeight * 0.5,
              alignItems: "center",
              justifyContent: "center",
            }}>
              

              <Text style={{ fontSize: ScreenWidth * 0.06 }} color="red" bold>
                Login Failed
              </Text>

              <Text
                style={{
                  marginTop: ScreenWidth * 0.02,
                  fontSize: ScreenWidth * 0.035,
                  textAlign: "center",
                }}
                color="#666"
              >
                Please check your Email Id or Password!
              </Text>

              <TouchableOpacity onPress={() => setErrorModalVisible(false)}>
                <View style={{
                  width: ScreenWidth * 0.8,
                  backgroundColor: "rgb(29,91,65)",
                  paddingVertical: ScreenWidth * 0.04,
                  borderRadius: 10,
                  alignItems: "center",
                  marginTop: 20,
                }}>
                  <Text color="white" style={{ fontSize: ScreenWidth * 0.045 }}>
                    Okay
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
};

export default FaceMatchScreen;
