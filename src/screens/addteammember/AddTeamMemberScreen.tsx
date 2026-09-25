/**
 * ? Local Imports
 */
import React, { useMemo, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as NavigationService from "react-navigation-helpers";
import createStyles from "./AddTeamMemberScreen.style";
import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import { SCREENS } from "@shared-constants";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
// import { CommonButton } from "@screens/common/button/CommonButton";

interface AddTeamMemberScreenProps {}

const AddTeamMemberScreen: React.FC<AddTeamMemberScreenProps> = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  // input
  const [focusedInput, setFocusedInput] = useState("");
  const [addMemberForm, setAddMemberForm] = useState({
    fullName: "",
  });

  const fullNameRef = useRef(null);

  const handleItemPress = () => {
    NavigationService.navigate(SCREENS.TEAM);
  };

  const handleFocus = (inputName: string) => {
    setFocusedInput(inputName);
  };

  const handleBlur = () => {
    setFocusedInput("");
  };

  const renderBackButton = () => (
    <RNBounceable
      onPress={() => {
        handleItemPress();
      }}
    >
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
      <View>{renderBackButton()}</View>
      <View style={styles.headerContainer}>
        <Text
          color={colors.titleSecond}
          style={[styles.headerTitle, { textAlign: "center" }]}
        >
          Add Member
        </Text>
      </View>
    </View>
  );

  const renderContent = () => (
    <View style={styles.contentContainer}>
      <View>
        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            value={addMemberForm.fullName}
            style={[
              styles.input,
              focusedInput === "fullNameRef"
                ? styles.focusInput
                : styles.blurInput,
            ]}
            ref={fullNameRef}
            autoComplete="off"
            autoCapitalize="none"
            inputMode="text"
            enterKeyHint="next"
            keyboardType="default"
            placeholder="Full Name"
            placeholderTextColor={colors.subtitle}
            returnKeyType="next"
            onFocus={() => {
              handleFocus("fullNameRef");
            }}
            onBlur={() => {
              handleBlur();
            }}
            onChangeText={(text: any) => {
              console.log(text);
            }}
          />
        </View>
      </View>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderContent()}
      </SafeAreaView>
    </>
  );
};

export default AddTeamMemberScreen;
