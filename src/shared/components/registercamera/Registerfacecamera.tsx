
import React, { useState } from "react";
import {
  View,
  Modal,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import RNFS from "react-native-fs";
import { NativeModules } from "react-native";
import FaceCaptureModalforfacnet from "@screens/payementslip/AutoCapture";
import { useAuth } from "context/AuthContext";
import LottieView from "lottie-react-native";
import * as NavigationService from "react-navigation-helpers";
import { SCREENS } from "@shared-constants";
import { Alert } from "react-native";

type CameraProps = {
  isActive: boolean;
  style: any;
  setIsActiveCamera: any;
  userid: any;
  setModalVisible: any;
  loginResult: any;
  email: any;
  password: any;
};

const { FaceNetModule } = NativeModules;

export default function Resisterfacecamera({
  isActive,
  style,
  setIsActiveCamera,
  userid,
  loginResult,
  email,
  password,
}: CameraProps) {
  const [captureIndex, setCaptureIndex] = useState(1);
  const [showCamera, setShowCamera] = useState(true);
  const [previewImage, setPreviewImage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFinalModalVisible, setIsFinalModalVisible] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loader State

  const { login, isLoggedIn } = useAuth();

  const uriToBase64 = async (uri: string) => {
    if (!uri) throw new Error("Invalid image URI");
    return await RNFS.readFile(uri.replace("file://", ""), "base64");
  };

  const handleCapture = async (data: any) => {
    if (!data?.uri) return;

    setShowCamera(false);
    setIsLoading(true); // Show loader immediately

    try {
      const img = data.uri;
      setPreviewImage(img);

      const base64 = await uriToBase64(img);
      const dataUri = `data:image/jpeg;base64,${base64}`;

      // Get embedding
      const enroll = await FaceNetModule.captureAndGetEmbedding(dataUri);

      if (!enroll?.embedding) {
        throw new Error("Failed to generate face embedding");
      }

      // Save embedding
      await AsyncStorage.setItem(
        `face_embedding_${captureIndex}`,
        JSON.stringify(enroll.embedding)
      );

      // Face Matching for 2nd and 3rd capture
      if (captureIndex === 2 || captureIndex === 3) {
        const refIndex = captureIndex - 1;
        const refEmbeddingStr = await AsyncStorage.getItem(`face_embedding_${refIndex}`);
        const refEmbeddings = refEmbeddingStr ? [JSON.parse(refEmbeddingStr)] : [];

        const matchResult = await FaceNetModule.matchWithEmbeddings(dataUri, refEmbeddings);

        if (!matchResult?.isMatch) {
          setErrorModal(`Face ${refIndex} and Face ${captureIndex} do not match`);
          setShowCamera(true);
          return;
        }
      }

      // Save image path only after success
      await AsyncStorage.setItem(`face_path_${captureIndex}`, img.replace("file://", ""));

      setIsModalVisible(true);
    } catch (err: any) {
      console.log("Capture Error:", err);
      setErrorModal(err.message?.includes("eyes") ? "Please open your eyes" : "Face not clear. Please try again.");
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const onContinue = async () => {
    setIsModalVisible(false);

    if (captureIndex < 3) {
      setCaptureIndex(captureIndex + 1);
      setShowCamera(true);
      return;
    }

    // Final submission
    setIsLoading(true);
    try {
      const emb1 = await AsyncStorage.getItem("face_embedding_1");
      const emb2 = await AsyncStorage.getItem("face_embedding_2");
      const emb3 = await AsyncStorage.getItem("face_embedding_3");

      const payload = {
        user_id: userid,
        faces: [JSON.parse(emb1!), JSON.parse(emb2!), JSON.parse(emb3!)],
        is_embedded: true,
      };

      await axios.post(
        "https://whiteforcepayroll.com/admin/api/register-user-face-details",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setIsFinalModalVisible(true);

      if (isLoggedIn) {
        NavigationService.replace(SCREENS.HOME);
      } else {
        setTimeout(async () => {
          try {
            const loginResult = await axios.post(
              "https://whiteforcepayroll.com/admin/api/employee-login",
              { username: email, password },
              { headers: { "Content-Type": "application/json" } }
            );
            login(loginResult);
          } catch (err) {
            console.log("Auto login failed:", err);
          }
        }, 500);
      }
    } catch (err) {
      Alert.alert(" Server Error", "Failed to register face. Please try again.");
      console.log("Final submit error:", err);
        console.log("Status:", err?.response?.status);
  console.log("Data:", err?.response?.data);
  console.log("Headers:", err?.response?.headers);
  console.log("Request:", err?.request);
    } finally {
      setIsLoading(false);
    }
  };
// const onContinue = async () => {
//   setIsModalVisible(false);

//   // Step-wise capture flow (unchanged)
//   if (captureIndex < 3) {
//     setCaptureIndex(prev => prev + 1);
//     setShowCamera(true);
//     return;
//   }

//   setIsLoading(true);

//   try {
//     // Load embeddings safely
//     const keys = [
//       "face_embedding_1",
//       "face_embedding_2",
//       "face_embedding_3",
//     ];

//     const faces: number[][] = [];

//     for (const key of keys) {
//       const raw = await AsyncStorage.getItem(key);

//       if (!raw) {
//         throw new Error("Face data missing. Please recapture.");
//       }

//       const parsed = JSON.parse(raw);

//       if (!Array.isArray(parsed) || parsed.length === 0) {
//         throw new Error("Invalid face data. Please recapture.");
//       }

//       if (!parsed.every(v => typeof v === "number")) {
//         throw new Error("Corrupted face data. Please recapture.");
//       }

//       faces.push(parsed);
//     }

//     // Ensure all embeddings have same length
//     const len = faces[0].length;
//     if (!faces.every(f => f.length === len)) {
//       throw new Error("Face mismatch detected. Please recapture.");
//     }

//     const payload = {
//       user_id: Number(userid),
//       faces,
//       is_embedded: true,
//     };

//     console.log("Submitting face payload:", {
//       user_id: payload.user_id,
//       faceLengths: faces.map(f => f.length),
//     });

//     await axios.post(
//       "https://whiteforcepayroll.com/admin/api/register-user-face-details",
//       payload,
//       { headers: { "Content-Type": "application/json" } }
//     );

//     setIsFinalModalVisible(true);

//     // Login flow (unchanged)
//     if (isLoggedIn) {
//       NavigationService.replace(SCREENS.HOME);
//     } else {
//       setTimeout(async () => {
//         try {
//           const loginResult = await axios.post(
//             "https://whiteforcepayroll.com/admin/api/employee-login",
//             { username: email, password },
//             { headers: { "Content-Type": "application/json" } }
//           );
//           login(loginResult);
//         } catch (err) {
//           console.log("Auto login failed:", err);
//         }
//       }, 500);
//     }
//   } catch (err: any) {
//     Alert.alert("Error", err.message || "Failed to register face.");

//     console.log("Final submit error:", err);
//     console.log("Status:", err?.response?.status);
//     console.log("Data:", err?.response?.data);
//     console.log("Headers:", err?.response?.headers);
//     console.log("Request:", err?.request);
//   } finally {
//     setIsLoading(false);
//   }
// };

  return (
    <>
      {/* CAMERA */}
      {showCamera && !errorModal && !isLoading && (
        <FaceCaptureModalforfacnet onCapture={handleCapture} />
      )}

      {/* LOADING MODAL - During embedding/matching/submission */}
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBox}>
            <LottieView
              source={require("../../../assets/images/camera/loader.json")}
              autoPlay
              loop
              style={{ width: 120, height: 120 }}
            />
            <Text style={styles.loadingText}>
              {captureIndex <= 3
                ? `Processing Face ${captureIndex} of 3...`
                : "Saving your face data..."}
            </Text>
            {/* <ActivityIndicator size="large" color="rgb(29,91,65)" style={{ marginTop: 16 }} /> */}
          </View>
        </View>
      </Modal>

      {/* ERROR MODAL */}
      <Modal visible={!!errorModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Face Issue Detected</Text>
            <Text style={styles.subText}>{errorModal}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setErrorModal("");
                setShowCamera(true);
              }}
            >
              <Text style={{ color: "white" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PREVIEW MODAL */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={{ uri: previewImage }}
              style={{ width: 260, height: 320, borderRadius: 10 }}
            />
            <Text style={styles.title}>Face Captured</Text>
            <Text style={styles.subText}>{captureIndex} of 3 photos taken</Text>
            <TouchableOpacity style={styles.button} onPress={onContinue}>
              <Text style={{ color: "white" }}>
                {captureIndex < 3 ? "Continue" : "Finish"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal visible={isFinalModalVisible} transparent animationType="slide">
        <View style={styles.successContainer}>
          <View style={styles.successBox}>
            <LottieView
              loop
              autoPlay
              source={require("../../../assets/images/camera/loader.json")}
              style={{ width: 180, height: 180 }}
            />
            <Text style={styles.successTitle}>Face Registration Complete!</Text>
            <Text style={styles.successSubtitle}>
              All 3 images & embeddings saved successfully.
            </Text>
            <TouchableOpacity
              onPress={() => setIsFinalModalVisible(false)}
              style={styles.successButton}
            >
              <Text style={styles.successButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Updated Styles
const styles = {
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    elevation: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 25,
    width: 300,
    borderRadius: 14,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
  },
  subText: {
    marginTop: 10,
    color: "gray",
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    backgroundColor: "rgb(29,91,65)",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  successContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  successBox: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 10,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 18,
    textAlign: "center",
    lineHeight: 20,
  },
  successButton: {
    backgroundColor: "rgb(29,91,65)",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
};