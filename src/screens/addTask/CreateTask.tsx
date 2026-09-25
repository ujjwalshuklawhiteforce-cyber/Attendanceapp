import React, { useMemo, useRef, useState, useEffect } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { ActivityIndicator } from "react-native";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Text from "@shared-components/text-wrapper/TextWrapper";
import createStyles from "./Create.style";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MultiSelect } from "react-native-element-dropdown";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { postApi } from "@services/api.service";
import { useAuth } from "context/AuthContext";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Props = {
  navigation: NativeStackNavigationProp<any>;
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
const TaskCreator = ({ navigation }: Props) => {
  const { login } = useAuth();

  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  // ── modal state ──────────────────────────────
  const [modaopen, setmodalopen] = useState(false);

  // ── form fields ──────────────────────────────
  const [taskName, setTaskName] = useState("");
  const [isImageRequired, setIsImageRequired] = useState("0");
  const [isFeedbackRequired, setIsFeedbackRequired] = useState("0");
  const [isVisitingCardRequired, setIsVisitingCardRequired] = useState("0");
  const [startdate, setstartdate] = useState("");
  const [enddate, setendate] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [teamlist, setteamlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── date picker visibility ───────────────────
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDatePickerVisible1, setDatePickerVisibility1] = useState(false);

  // ── dropdown options ─────────────────────────
  const options = [
    { label: "No", value: "0" },
    { label: "Yes", value: "1" },
  ];

  // ─────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────
  useEffect(() => {
    assignTask();

    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem("myDataKey");
        if (value !== null) {
          const parsedValue = JSON.parse(value);
          if (Array.isArray(parsedValue)) {
            const dropdownItems = parsedValue.map((user) => ({
              label: user.name,
              value: user.user_id,
            }));
            setteamlist(dropdownItems);
          } else {
            console.warn("Parsed value is not an array:", parsedValue);
          }
        } else {
          console.warn("No data found under 'myDataKey'");
        }
      } catch (e) {
        console.error("Failed to retrieve or parse data", e);
      }
    };

    getData();
  }, []);

  // ─────────────────────────────────────────────
  // API CALLS
  // ─────────────────────────────────────────────
  const assignTask = async () => {
    const url = "https://whiteforcepayroll.com/admin/api/assigned-task-list";
    const payload = { user_id: "12213" };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Task assigned successfully:", data);
      } else {
        console.error("Error assigning task:", data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const createTask = async () => {
    if (!taskName) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    const url = "https://whiteforcepayroll.com/admin/api/task-create";

    const payload = {
      task_name: taskName,
      is_image_required: Number(isImageRequired),
      is_feedback_required: Number(isFeedbackRequired),
      is_visiting_card_required: Number(isVisitingCardRequired),
      created_by: 12170,
      client_id: 84,
      start_date: startdate,
      end_date: enddate,
      assigned_to: 12213,
    };

    setLoading(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);
      console.log("data", data);

      if (response.ok) {
        setmodalopen(true);
      } else {
        Alert.alert("Error", data.message || "Failed to create task");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong!");
      console.error("Error:", error);
    }
  };

  // ─────────────────────────────────────────────
  // DATE HANDLERS
  // ─────────────────────────────────────────────
  const handleDateConfirm = (date: Date) => {
    setstartdate(date.toISOString().split("T")[0]);
    setDatePickerVisibility1(false);
  };

  const handleDateConfirms = (date: Date) => {
    setendate(date.toISOString().split("T")[0]);
    setDatePickerVisibility(false);
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: "#1e3830" }}>
      <ImageBackground
        style={{ flex: 1, backgroundColor: "#518c79" }}
        source={require("../../../assets/camera/loginbackground.png")}
      >
        <SafeAreaView style={{ flex: 1, marginTop: -50 }}>

          {/* ─────────────────────────────────────
              BACKGROUND HEADER (absolute, behind)
          ───────────────────────────────────── */}
          <ImageBackground
            style={{
              backgroundColor: "#1e3830",
              paddingTop: 80,
              paddingBottom: 30,
              position: "absolute",
              top: -50,
              width: ScreenWidth,
              height: ScreenHeight * 0.5,
              left: 0,
              right: 0,
              zIndex: 0,
            }}
            source={require("../../../assets/camera/loginbackground.png")}
          >
            {/* Logo centered in header */}
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Image
                style={{ width: 110, height: 110 }}
                source={require("../../../assets/camera/whiteforcelogo.png")}
              />
            </View>
          </ImageBackground>

          {/* ─────────────────────────────────────
              ✅ BACK ARROW — floated ABOVE ScrollView
              zIndex: 9999 + rendered AFTER ScrollView
              so it receives touches first
          ───────────────────────────────────── */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: "absolute",
              top: 90,
              left: 10,
              zIndex: 9999,
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              paddingHorizontal: 4,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name="chevron-back-outline"
              type={IconType.Ionicons}
              color={"white"}
              size={24}
            />
          
          </TouchableOpacity>

          {/* ─────────────────────────────────────
              SCROLLABLE FORM
          ───────────────────────────────────── */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "black",
                marginTop: ScreenWidth * 0.6,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                minHeight: ScreenHeight,
                width: ScreenWidth,
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderTopLeftRadius: 30,
                  borderBottomRightRadius: 30,
                  borderTopRightRadius: 30,
                  width: ScreenWidth,
                }}
              >
                <View style={styles.formContainer}>

                  {/* Task Name */}
                  <View style={styles.inputField}>
                    <View style={{ display: "flex", marginLeft: -20, height: 40, flexDirection: "row", alignItems: "center" }}>
                      <Image style={{ width: 60, height: 60 }} source={require("../../assets/images/camera/taskname.png")} />
                      <Text style={{ color: "#0B2B19", fontWeight: "600", marginBottom: 10, fontSize: 16 }} color="#0B2B19">
                        Task Name
                      </Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Task Name"
                      value={taskName}
                      onChangeText={setTaskName}
                      placeholderTextColor="#000"
                    />
                  </View>

                  {/* Allotted To */}
                  <View style={styles.inputField}>
                    <View style={{ display: "flex", marginLeft: -23, height: 50, flexDirection: "row", alignItems: "center" }}>
                      <Image style={{ width: 60, height: 60 }} source={require("../../assets/images/camera/taskprofile.png")} />
                      <Text style={{ color: "#0B2B19", fontWeight: "500", marginBottom: 10, fontSize: 16 }} color="#0B2B19">
                        Alloted to
                      </Text>
                    </View>
                    <MultiSelect
                      style={styles.input}
                      data={teamlist}
                      placeholderStyle={{ color: "#000", fontSize: 15 }}
                      labelField="label"
                      valueField="value"
                      placeholder="Select team members"
                      value={selectedUsers}
                      itemTextStyle={{ color: "#000", fontSize: 13 }}
                      selectedTextStyle={{ color: "#000", fontSize: 13, padding: 2 }}
                      onChange={(item) => {
                        setSelectedUsers(item);
                        console.log("Selected users:", item);
                      }}
                      selectedStyle={{ borderRadius: 15, marginBottom: 10 }}
                      maxSelect={5}
                    />
                  </View>

                  {/* Start & End Date */}
                  <View style={{ display: "flex", flexDirection: "row", gap: 75 }}>
                    <View>
                      <View style={{ display: "flex", marginLeft: -8, height: 50, flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Image style={{ width: 40, height: 40 }} source={require("../../assets/images/camera/taskdate.png")} />
                        <Text style={{ color: "#0B2B19", fontWeight: "500", marginBottom: 10, fontSize: 16 }} color="#0B2B19">
                          Start Date
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.inputs} onPress={() => setDatePickerVisibility1(true)}>
                        <Text color="black" style={{ fontSize: 13, color: "black", marginLeft: 2 }}>
                          {startdate ? startdate : "YY-MM-DD"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View>
                      <View style={{ display: "flex", marginLeft: -15, gap: 10, height: 50, flexDirection: "row", alignItems: "center" }}>
                        <Image style={{ width: 40, height: 40 }} source={require("../../assets/images/camera/taskdate.png")} />
                        <Text style={{ color: "#0B2B19", fontWeight: "500", marginBottom: 10, fontSize: 16 }} color="#0B2B19">
                          End date
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.inputs} onPress={() => setDatePickerVisibility(true)}>
                        <Text color="black" style={{ fontSize: 13, color: "black" }}>
                          {enddate ? enddate : "YY-MM-DD"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Visiting Card Required */}
                  <View style={styles.inputField}>
                    <View style={{ display: "flex", marginLeft: -20, height: 50, flexDirection: "row", alignItems: "center" }}>
                      <Image style={{ width: 60, height: 60 }} source={require("../../assets/images/camera/taskvisiting.png")} />
                      <Text style={{ color: "#0B2B19", fontWeight: "500", marginBottom: 16, fontSize: 16 }} color="#0B2B19">
                        Visiting Card Required
                      </Text>
                    </View>
                    <Dropdown
                      data={options}
                      labelField="label"
                      itemTextStyle={{ color: "#000" }}
                      selectedTextStyle={{ color: "#000", fontSize: 13 }}
                      valueField="value"
                      value={isVisitingCardRequired}
                      onChange={(item) => setIsVisitingCardRequired(item.value)}
                      style={styles.input}
                      placeholder="Select"
                      placeholderStyle={styles.placeholder}
                    />
                  </View>

                  {/* Image & Feedback */}
                  <View style={{ display: "flex", flexDirection: "row", gap: 70 }}>
                    <View>
                      <View style={{ display: "flex", marginLeft: -20, height: 50, flexDirection: "row", alignItems: "center" }}>
                        <Image style={{ width: 60, height: 60 }} source={require("../../assets/images/camera/taskcam.png")} />
                        <Text style={{ color: "#0B2B19", fontWeight: "500", marginBottom: 16, fontSize: 16 }} color="#0B2B19">
                          Image
                        </Text>
                      </View>
                      <Dropdown
                        data={options}
                        labelField="label"
                        valueField="value"
                        itemTextStyle={{ color: "#000" }}
                        selectedTextStyle={{ color: "#000", fontSize: 15 }}
                        value={isImageRequired}
                        onChange={(item) => setIsImageRequired(item.value)}
                        style={styles.inputs}
                        placeholder="Select"
                        placeholderStyle={styles.placeholder}
                      />
                    </View>

                    <View>
                      <View style={{ display: "flex", marginLeft: -21, height: 50, flexDirection: "row", alignItems: "center" }}>
                        <Image style={{ width: 60, height: 60 }} source={require("../../assets/images/camera/taskfeedback.png")} />
                        <Text style={{ color: "#0B2B19", fontWeight: "500", marginBottom: 16, fontSize: 16 }} color="#0B2B19">
                          Feedback
                        </Text>
                      </View>
                      <Dropdown
                        data={options}
                        labelField="label"
                        itemTextStyle={{ color: "#000" }}
                        selectedTextStyle={{ color: "#000", fontSize: 15 }}
                        valueField="value"
                        value={isFeedbackRequired}
                        onChange={(item) => setIsFeedbackRequired(item.value)}
                        style={styles.inputs}
                        placeholder="Select"
                        placeholderStyle={styles.placeholder}
                      />
                    </View>
                  </View>

                  {/* Submit Button */}
                  <View style={{ marginTop: 20 }}>
                    <TouchableOpacity onPress={createTask}>
                      <View style={styles.button}>
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text style={styles.buttonText} color="white">
                            Create Task
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>

                </View>
              </View>
            </View>
          </ScrollView>

          {/* ─────────────────────────────────────
              DATE PICKERS
          ───────────────────────────────────── */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible1}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setDatePickerVisibility1(false)}
            date={new Date(Date.now())}
          />
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirms}
            onCancel={() => setDatePickerVisibility(false)}
            date={new Date(Date.now())}
          />

          {/* ─────────────────────────────────────
              SUCCESS MODAL
          ───────────────────────────────────── */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modaopen}
            onRequestClose={() => setmodalopen(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(12, 11, 10, 0.5)",
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  height: ScreenWidth * 0.4,
                  borderRadius: 10,
                  alignItems: "center",
                  width: ScreenWidth * 0.7,
                }}
              >
                <View>
                  <Image
                    style={{
                      width: ScreenWidth * 0.17,
                      height: ScreenWidth * 0.17,
                      borderRadius: 50,
                      position: "absolute",
                      top: -34,
                      left: -35,
                    }}
                    source={require("../../../assets/camera/ic_launchers.png")}
                  />
                </View>

                <TouchableOpacity
                  style={{ position: "absolute", top: 20, right: 15 }}
                  onPress={() => setmodalopen(false)}
                >
                  <Image
                    style={{ width: 15, height: 15 }}
                    source={require("../../../assets/camera/close.png")}
                  />
                </TouchableOpacity>

                <View
                  style={{
                    justifyContent: "center",
                    flexDirection: "column",
                    alignItems: "center",
                    height: ScreenHeight * 0.2,
                    width: ScreenWidth * 0.7,
                  }}
                >
                  <Text
                    color="black"
                    style={{ color: "black", marginTop: 10, fontSize: 14 }}
                  >
                    Task Assigned successfully..
                  </Text>
                </View>
              </View>
            </View>
          </Modal>

        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default TaskCreator;