import React, { useMemo, useState } from "react";
import {
  Keyboard,
  Linking,
  Modal,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import createStyles from "./TeamScreen.style";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import RNBounceable from "@freakycoder/react-native-bounceable";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import CardView from "react-native-cardview";
import TeamMember from "./mock/TeamMember";
import TeamMemberCard from "./components/team-member/TeamMemberCard";
import { SCREENS } from "@shared-constants";
import * as NavigationService from "react-navigation-helpers";
import { CommonButton } from "@screens/common/button/CommonButton";

const TeamScreen: React.FC = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  //input state
  const [focusedInput, setFocusedInput] = useState("");
  const [openMemberModal, setOpenMemberModal] = useState(false);

  const handleFocus = (inputName: string) => {
    setFocusedInput(inputName);
  };

  const handleBlur = () => {
    setFocusedInput("");
    Keyboard.dismiss();
  };

  const onMemberClick = () => {
    setOpenMemberModal(true);
  };

  const handleItemPress = (modalClose: any, navigateTO: any) => {
    if (modalClose === true || modalClose === false)
      setOpenMemberModal(modalClose);
    if (navigateTO) NavigationService.navigate(navigateTO);
  };

  // const renderMoreButton = () => (
  //   <RNBounceable onPress={() => {}}>
  //     {/* <View style={styles.addIconContainer}> */}
  //     <View>
  //       <Icon
  //         name="ellipsis-vertical-outline"
  //         type={IconType.Ionicons}
  //         color={colors.iconBlack}
  //         style={styles.addIcon}
  //       />
  //     </View>
  //   </RNBounceable>
  // );

  const renderCallButton = () => (
    <RNBounceable>
      {/* <View style={styles.addIconContainer}> */}
      <View>
        <Icon
          name="call-outline"
          type={IconType.Ionicons}
          color={colors.success}
          style={styles.iconSize}
        />
      </View>
    </RNBounceable>
  );

  const renderViewDetailButton = () => (
    <RNBounceable>
      {/* <View style={styles.addIconContainer}> */}
      <View>
        <Icon
          name="id-card-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.iconSize}
        />
      </View>
    </RNBounceable>
  );

  const renderViewLocationButton = () => (
    <RNBounceable>
      {/* <View style={styles.addIconContainer}> */}
      <View>
        <Icon
          name="locate-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.iconSize}
        />
      </View>
    </RNBounceable>
  );

  const renderViewAttendanceButton = () => (
    <RNBounceable>
      {/* <View style={styles.addIconContainer}> */}
      <View>
        <Icon
          name="calendar-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.iconSize}
        />
      </View>
    </RNBounceable>
  );

  const renderDeleteButton = () => (
    <RNBounceable>
      {/* <View style={styles.addIconContainer}> */}
      <View>
        <Icon
          name="trash-outline"
          type={IconType.Ionicons}
          color={colors.danger}
          style={styles.iconSize}
        />
      </View>
    </RNBounceable>
  );

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerContainer}>
          <Text color={colors.titleSecond} style={styles.headerTitle}>
            Team Members
          </Text>
        </View>
        {/* <View style={styles.iconButtonContainer}>{renderMoreButton()}</View> */}
      </View>
      {searchInput()}
    </>
  );

  const searchInput = () => (
    <CardView
      cardElevation={4}
      cardMaxElevation={10}
      cornerRadius={11}
      style={[styles.inputField, styles.shadowInput]}
    >
      <TextInput
        value={""}
        style={[
          styles.input,
          focusedInput === "searchMember"
            ? styles.focusInput
            : styles.blurInput,
        ]}
        autoComplete="off"
        autoCapitalize="none"
        inputMode="text"
        enterKeyHint="next"
        keyboardType="default"
        placeholder="Search Member"
        placeholderTextColor={colors.subtitle}
        returnKeyType="next"
        onFocus={() => {
          handleFocus("searchMember");
        }}
        onBlur={() => {
          handleBlur();
        }}
        onChangeText={(text: any) => {
          console.log(text);
        }}
      />
    </CardView>
  );

  const renderContent = () => (
    <>
      <View style={styles.contentContainer}>
        {TeamMember.map((data: any) => (
          <TeamMemberCard data={data} key={data.id} onPress={onMemberClick} />
        ))}
      </View>
    </>
  );

  const memberBox = () => (
    <>
      <RNBounceable
        style={styles.IconContainer}
        onPress={() => {
          handleItemPress(false, SCREENS.TEAMMEMBERDETAIL);
        }}
      >
        {renderViewDetailButton()}
        <Text style={styles.memberBoxText} color={colors.titleSecond}>
          View Member Detail
        </Text>
      </RNBounceable>
      <RNBounceable
        style={styles.IconContainer}
        onPress={() => {
          handleItemPress(false, "");
        }}
      >
        {renderViewAttendanceButton()}
        <Text style={styles.memberBoxText} color={colors.titleSecond}>
          View Member Attendance
        </Text>
      </RNBounceable>
      <RNBounceable
        style={styles.IconContainer}
        onPress={() => {
          handleItemPress(false, "");
        }}
      >
        {renderViewLocationButton()}
        <Text style={styles.memberBoxText} color={colors.titleSecond}>
          View Member Location
        </Text>
      </RNBounceable>
      <RNBounceable
        style={styles.IconContainer}
        onPress={() => {
          Linking.openURL(`tel:${"+918120239387"}`);
        }}
      >
        {renderCallButton()}
        <Text style={styles.memberBoxText} color={colors.success}>
          Call
        </Text>
      </RNBounceable>
      <RNBounceable
        style={styles.IconContainer}
        onPress={() => {
          handleItemPress(true, "");
        }}
      >
        {renderDeleteButton()}
        <Text style={styles.memberBoxText} color={colors.danger}>
          Delete
        </Text>
      </RNBounceable>
    </>
  );

  const modal = () => (
    <Modal
      animationType={"slide"}
      transparent={true}
      visible={openMemberModal}
      onRequestClose={() => {
        setOpenMemberModal(false);
      }}
    >
      <View
        style={[styles.centeredView]}
        // onTouchStart={() => {
        //   setOpenMemberModal(false)
        // }}
      >
        <View style={[styles.modalMemberView]}>{memberBox()}</View>
      </View>
    </Modal>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        {modal()}
        {renderHeader()}
        <ScrollView
          onTouchStart={() => {
            handleBlur();
          }}
        >
          {renderContent()}
        </ScrollView>
        <View style={styles.bottomButton}>
          <CommonButton
            style={""}
            textColor={colors.white}
            customStyle={{ backgroundColor: colors.primary }}
            text="Add Member"
            iconName="person-add-outline"
            onPress={() => {
              handleItemPress(false, SCREENS.ADDTEAMMEMBER);
            }}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default TeamScreen;
