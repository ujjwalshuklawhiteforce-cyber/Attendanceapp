import React, { useEffect, useMemo, useState, useRef } from "react";
import { ActivityIndicator, Keyboard, TextInput, View } from "react-native";
import createStyles from "./AddTaskScreen.style";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import { SafeAreaView } from "react-native-safe-area-context";
import RNBounceable from "@freakycoder/react-native-bounceable";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { SCREENS } from "@shared-constants";
import * as NavigationService from "react-navigation-helpers";
import { CommonButton } from "@screens/common/button/CommonButton";
import { Dropdown } from "react-native-element-dropdown";
import { ScreenHeight } from "@freakycoder/react-native-helpers";
import { postApi } from "@services/api.service";

interface AddTaskScreenProps {}

const TaskScreen: React.FC<AddTaskScreenProps> = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleItemPress = () => {
    NavigationService.navigate(SCREENS.TASK);
  };

  // State for form input fields
  const [isFocus, setIsFocus] = useState(false);
  const [teamMembersList, setTeamMemberList] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  const [applyLeave, setApplyLeave] = useState({
    task_name: "",
    is_image_required: "0", // Default value
    is_feedback_required: "0", // Default value
    is_visiting_card_required: "0", // Default value
    created_by: "2", // Default created_by
    client_id: "5", // Default client_id
  });

  const leaveFormRef = useRef<any>(null);

  const feedbackRequiredData = [
    { label: "No", value: "0" },
    { label: "Yes", value: "1" },
  ];

  const visitingCardRequiredData = [
    { label: "No", value: "0" },
    { label: "Yes", value: "1" },
  ];

  const imageRequiredData = [
    { label: "No", value: "0" },
    { label: "Yes", value: "1" },
  ];

  // Fetch team members data
  const fetchUserList = async () => {
    setLoading(true);
    try {
      const data = {
        manager_id: 2,
        client_id: 5,
      };

      const taskResponse: any = await postApi("/manager-team", data);
      console.log(taskResponse)
      if (taskResponse?.status === true) {

        const members = taskResponse?.data; 
        console.log(members)
        const membersList = members.map((member: any) => ({
          name: member.name,
          id: member.user_id,
        }));
        setTeamMemberList(membersList);
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  const handleFocus = (inputName: string) => {
    setIsFocus(inputName);
  };

  const handleBlur = () => {
    setIsFocus("");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderBackButton = () => (
    <RNBounceable onPress={handleItemPress}>
      <View style={styles.addIconContainer}>
        <Icon
          name="chevron-back-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.addIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.iconButtonContainer}>{renderBackButton()}</View>
      <View style={styles.headerContainer}>
        <Text color={colors.titleSecond} style={styles.headerTitle}>
          Create Task
        </Text>
      </View>
    </View>
  );

  const taskCreateForm = () => (
    <View style={styles.marginTop}>
      <View style={styles.inputField}>
        <Text style={styles.inputLabel}>Task Name</Text>
        <TextInput
          value={applyLeave.task_name}
          style={styles.input}
          ref={leaveFormRef}
          placeholder="UI/UX Design"
          placeholderTextColor={colors.subtitle}
          onFocus={() => handleFocus("task_name")}
          onBlur={handleBlur}
          onChangeText={(text) => setApplyLeave({ ...applyLeave, task_name: text })}
        />
      </View>

      {/* Image Required Dropdown */}
      <View style={styles.parentField}>
        <Text style={styles.selectInputLabel}>Image Required?</Text>
        <Dropdown
          style={styles.dropdown}
          value={applyLeave.is_image_required}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={imageRequiredData}
          labelField="label"
          valueField="value"
          placeholder="Select"
          onFocus={() => handleFocus("image_required")}
          onBlur={handleBlur}
          onChange={(item) =>
            setApplyLeave({ ...applyLeave, is_image_required: item.value })
          }
        />
      </View>

      {/* Feedback Required Dropdown */}
      <View style={styles.parentField}>
        <Text style={styles.selectInputLabel}>Feedback Required?</Text>
        <Dropdown
          style={styles.dropdown}
          value={applyLeave.is_feedback_required}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={feedbackRequiredData}
          labelField="label"
          valueField="value"
          placeholder="Select"
          onFocus={() => handleFocus("feedback_required")}
          onBlur={handleBlur}
          onChange={(item) =>
            setApplyLeave({ ...applyLeave, is_feedback_required: item.value })
          }
        />
      </View>

      {/* Visiting Card Required Dropdown */}
      <View style={styles.parentField}>
        <Text style={styles.selectInputLabel}>Visiting Card Required?</Text>
        <Dropdown
          style={styles.dropdown}
          value={applyLeave.is_visiting_card_required}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={visitingCardRequiredData}
          labelField="label"
          valueField="value"
          placeholder="Select"
          onFocus={() => handleFocus("visiting_card_required")}
          onBlur={handleBlur}
          onChange={(item) =>
            setApplyLeave({ ...applyLeave, is_visiting_card_required: item.value })
          }
        />
      </View>

      {/* Button */}
      <View style={styles.button}>
        <CommonButton
          text="Create Task"
          textColor={colors.white}
          onPress={() => {}}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {taskCreateForm()}
    </SafeAreaView>
  );
};

export default TaskScreen;
