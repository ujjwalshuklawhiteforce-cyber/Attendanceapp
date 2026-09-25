import React, { useMemo, useRef, useState } from "react";
import { Keyboard, Modal, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import createStyles from "./LeaveScreen.style";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import RNBounceable from "@freakycoder/react-native-bounceable";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import LeaveData from "./mock/LeaveData";
import LeaveCard from "./components/leave-card/LeaveCard";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import LeaveDetailCard from "./components/leave-detail-card/LeaveDetailCard";
import LeaveDetailData from "./mock/LeaveDetailData";
import { ScrollView } from "react-native";
import LeaveApplyData from "./mock/LeaveApplyData";
import LeaveApply from "./components/leave-apply/LeaveApply";
import { CheckBox } from "@rneui/themed";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { CommonButton } from "@screens/common/button/CommonButton";
import * as NavigationService from "react-navigation-helpers";
import { SCREENS } from "@shared-constants";

const routes = [
  { key: "upcoming", title: "Upcoming" },
  { key: "past", title: "Past" },
  { key: "team", title: "Team Leave" },
];

const LeaveScreen: React.FC = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const monthName = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // common
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // tab navigation
  const [index, setIndex] = React.useState(0);

  // modal view
  const [openModal, setOpenModal] = useState(false);
  const [typeModalFor, setTypeModalFor] = useState("");

  // filter
  const [isApproved, setApproved] = useState(false);
  const [isUnapproved, setUnapproved] = useState(false);
  const [isPending, setPending] = useState(false);
  const [isReject, setReject] = useState(false);

  // filter status
  const [isCasualLeave, setCasualLeave] = useState(false);
  const [isSickLeave, setSickLeave] = useState(false);
  const [isPlannedLeave, setPlannedLeave] = useState(false);
  const [isHoliday, setHoliday] = useState(false);

  //  select box
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  // input
  const [focusedInput, setFocusedInput] = useState("");
  const [applyLeave, setApplyLeave] = useState({
    title: "",
    leaveType: "",
    contactNumber: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const leaveFormRef = {
    titleRef: useRef(null),
    leaveRef: useRef(null),
    contactNumRef: useRef(null),
    startDateRef: useRef(null),
    endDateRef: useRef(null),
    reasonRef: useRef(null),
  };

  const data = [
    { label: "Item 1", value: "1" },
    { label: "Item 2", value: "2" },
    { label: "Item 3", value: "3" },
    { label: "Item 4", value: "4" },
    { label: "Item 5", value: "5" },
    { label: "Item 6", value: "6" },
    { label: "Item 7", value: "7" },
    { label: "Item 8", value: "8" },
  ];

  const leaveApplyData = [
    { label: "Item 1", value: "Medical Leave" },
    { label: "Item 2", value: "Emergency Leave" },
    { label: "Item 3", value: "Casual Leave" },
  ];

  const handleFocus = (inputName: string) => {
    setFocusedInput(inputName);
  };

  const handleBlur = () => {
    setFocusedInput("");
  };

  // const showDatePicker = () => {
  //   setDatePickerVisibility(true);
  // };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: any) => {
    if (!date) return "";

    const parsedDate = new Date(date);
    const day = parsedDate.getDate();
    const month = parsedDate.getMonth() + 1; // Months are 0-indexed
    const year = parsedDate.getFullYear();

    const formattedDate = `${monthName[month - 1]} ${day}, ${year}`;

    console.log(formattedDate);

    setApplyLeave((prevState) => ({
      ...prevState,
      startDate: `${formattedDate}`,
    }));

    if (applyLeave.startDate) {
      setApplyLeave((prevState) => ({
        ...prevState,
        startDate: `${formattedDate}`,
      }));
    } else {
      setApplyLeave((prevState) => ({
        ...prevState,
        endDate: `${formattedDate}`,
      }));
    }
    hideDatePicker();
  };

  const [invalidFields, setInvalidFields] = useState("");

  const validateForm = () => {
    if (applyLeave.title.trim() === "") {
      setInvalidFields("titleRef");
    } else if (applyLeave.leaveType.trim() === "") {
      setInvalidFields("leaveRef");
    } else if (applyLeave.contactNumber.trim() === "") {
      setInvalidFields("contactNumRef");
    } else if (applyLeave.startDate.trim() === "") {
      setInvalidFields("startDateRef");
    } else if (applyLeave.endDate.trim() === "") {
      setInvalidFields("endDateRef");
    } else if (applyLeave.reason.trim() === "") {
      setInvalidFields("reasonRef");
    } else {
      setInvalidFields("");
    }

    if (
      applyLeave.contactNumber.trim() !== "" &&
      applyLeave.contactNumber.length < 4
    ) {
      setInvalidFields("contactNumRef");
    }
  };

  // const handleSubmit = () => {
  //   const invalidFields = validateForm();

  //   if (invalidFields.length > 0) {
  //     Alert.alert('Invalid Fields', `Please fill in the following fields: ${invalidFields.join(', ')}`);
  //   } else {
  //     // Proceed with form submission
  //   }
  // };

  const handleItemPress = () => {
    NavigationService.navigate(SCREENS.DETAIL);
  };

  const renderAddButton = () => (
    <RNBounceable
      onPress={() => {
        setTypeModalFor("leaveForm");
        setOpenModal(true);
      }}
    >
      <View style={styles.addIconContainer}>
        <Icon
          name="add"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.addIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderBackButton = () => (
    <RNBounceable
      onPress={() => {
        setOpenModal(false);
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

  const renderCloseButton = () => (
    <RNBounceable
      onPress={() => {
        setOpenModal(false);
      }}
    >
      <View style={styles.addIconContainer}>
        <Icon
          name="close-circle-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.addIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderFilterButton = () => (
    <RNBounceable
      onPress={() => {
        setTypeModalFor("filterForm");
        setOpenModal(true);
      }}
    >
      <View style={[styles.addIconContainer, styles.marginLeft]}>
        <Icon
          name="filter"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.addIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerContainer}>
          <Text color={colors.titleSecond} style={styles.headerTitle}>
            All Leaves
          </Text>
        </View>
        <View style={styles.iconButtonContainer}>
          {renderAddButton()}
          {renderFilterButton()}
        </View>
      </View>
    </>
  );

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabBarHeaderIndicatorStyle}
      style={styles.tabBarHeader}
      labelStyle={{ textTransform: "capitalize", fontWeight: "bold" }}
      activeColor={colors.white}
      inactiveColor={colors.titleSecond}
    />
  );

  const UpcomingRoute = () => (
    <View style={styles.tabContainer}>
      {LeaveDetailData.map(
        (data) =>
          data.type === "upcoming" && (
            <LeaveDetailCard key={data.id} data={data} />
          )
      )}
    </View>
  );

  const PastRoute = () => (
    <View style={styles.tabContainer}>
      {LeaveDetailData.map(
        (data) =>
          data.type === "past" && (
            <LeaveDetailCard key={data.id} data={data} />
            // <LeaveDetailCard key={data.id} data={data} onPress={handleItemPress} />
          )
      )}
    </View>
  );

  const TeamRoute = () => (
    <View style={styles.tabContainer}>
      {LeaveApplyData.map((data) => (
        <LeaveApply key={data.id} data={data} onPress={handleItemPress} />
      ))}
    </View>
  );

  const renderScene = SceneMap({
    upcoming: UpcomingRoute,
    past: PastRoute,
    team: TeamRoute,
  });

  const renderContent = () => (
    <>
      <View style={styles.leaveCardsContainer}>
        {LeaveData.map((data) => (
          <LeaveCard data={data}></LeaveCard>
        ))}
      </View>
      <ScrollView style={styles.tabSwitchContainer}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          renderTabBar={renderTabBar}
          style={styles.tabSwitchTabView}
          lazy
        />
      </ScrollView>
    </>
  );

  const leaveApplyForm = () => (
    <>
      <View style={styles.modalHeader}>
        <View style={styles.modalIconFormContainer}>{renderBackButton()}</View>
        <View style={styles.modalHeaderFormContainer}>
          <Text
            color={colors.titleSecond}
            style={[styles.headerTitle, { textAlign: "center" }]}
          >
            Apply Leave
          </Text>
        </View>
      </View>
      <View style={styles.modalContent}>
        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            value={applyLeave.title}
            style={[
              styles.input,
              focusedInput === "titleRef"
                ? styles.focusInput
                : invalidFields === "titleRef"
                  ? styles.invalidInput
                  : invalidFields === ""
                    ? styles.blurInput
                    : styles.validInput,
            ]}
            ref={leaveFormRef.titleRef}
            autoComplete="off"
            autoCapitalize="none"
            inputMode="text"
            enterKeyHint="next"
            keyboardType="default"
            placeholder="Medical Issue"
            placeholderTextColor={colors.subtitle}
            returnKeyType="next"
            onFocus={() => {
              handleFocus("titleRef");
            }}
            onBlur={() => {
              handleBlur();
              validateForm();
            }}
            onChangeText={(text: any) => {
              setApplyLeave((prevState) => ({
                ...prevState,
                title: text,
              }));
            }}
          />
        </View>
        <View style={styles.inputField}>
          {/* <Text style={styles.inputLabel}>Leave Type</Text> */}
          <Dropdown
            style={[
              styles.dropdown,
              focusedInput === "leaveRef"
                ? styles.focusInput
                : invalidFields === "leaveRef"
                  ? styles.invalidInput
                  : invalidFields === ""
                    ? styles.blurInput
                    : styles.validInput,
            ]}
            value={applyLeave.leaveType}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            ref={leaveFormRef.leaveRef}
            data={leaveApplyData}
            // search
            maxHeight={ScreenHeight * 0.4}
            labelField="value"
            valueField="value"
            placeholder={!isFocus ? "Select item" : "..."}
            searchPlaceholder="Search..."
            onFocus={() => {
              handleFocus("leaveRef");
            }}
            onBlur={() => {
              handleBlur();
              validateForm();
            }}
            onChange={(item: any) => {
              setApplyLeave((prevState) => ({
                ...prevState,
                leaveType: item.value,
              }));
              setIsFocus(false);
              Keyboard.dismiss();
            }}
          />
        </View>
        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>Contact Number</Text>
          <TextInput
            value={applyLeave.contactNumber}
            style={[
              styles.input,
              focusedInput === "contactNumRef"
                ? styles.focusInput
                : invalidFields === "contactNumRef"
                  ? styles.invalidInput
                  : invalidFields === ""
                    ? styles.blurInput
                    : styles.validInput,
            ]}
            maxLength={14}
            ref={leaveFormRef.contactNumRef}
            autoComplete="off"
            autoCapitalize="none"
            inputMode="numeric"
            enterKeyHint="next"
            keyboardType="numeric"
            placeholder="+91 80827 21228"
            placeholderTextColor={colors.subtitle}
            returnKeyType="next"
            onFocus={() => {
              handleFocus("contactNumRef");
            }}
            onBlur={() => {
              handleBlur();
              validateForm();
            }}
            onPressIn={() => {
              setApplyLeave((prevState) => ({
                ...prevState,
                contactNumber: `+91 `,
              }));
            }}
            onChangeText={(text: any) => {
              setApplyLeave((prevState) => ({
                ...prevState,
                contactNumber: text,
              }));
            }}
          />
        </View>
        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>Start Date</Text>
          <TextInput
            value={applyLeave.startDate}
            style={[
              styles.input,
              focusedInput === "startDateRef"
                ? styles.focusInput
                : invalidFields === "startDateRef"
                  ? styles.invalidInput
                  : invalidFields === ""
                    ? styles.blurInput
                    : styles.validInput,
            ]}
            ref={leaveFormRef.startDateRef}
            editable={applyLeave.startDate ? false : true}
            autoComplete="off"
            autoCapitalize="none"
            inputMode="none"
            enterKeyHint="next"
            keyboardType="default"
            placeholder="May 14, 2024"
            placeholderTextColor={colors.subtitle}
            returnKeyType="next"
            onFocus={() => {
              handleFocus("startDateRef");
            }}
            onBlur={() => {
              handleBlur();
              validateForm();
            }}
            onPressIn={(text: any) => {
              Keyboard.dismiss();
              setDatePickerVisibility(true);
              console.log(text);
            }}
          />
        </View>
        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>End Date</Text>
          <TextInput
            value={applyLeave.endDate}
            style={[
              styles.input,
              focusedInput === "endDateRef"
                ? styles.focusInput
                : invalidFields === "endDateRef"
                  ? styles.invalidInput
                  : invalidFields === ""
                    ? styles.blurInput
                    : styles.validInput,
            ]}
            ref={leaveFormRef.endDateRef}
            editable={applyLeave.endDate ? false : true}
            autoComplete="off"
            autoCapitalize="none"
            inputMode="none"
            enterKeyHint="next"
            keyboardType="default"
            placeholder="May 18, 2024"
            placeholderTextColor={colors.subtitle}
            returnKeyType="next"
            onFocus={() => {
              handleFocus("endDateRef");
            }}
            onBlur={() => {
              handleBlur();
              validateForm();
            }}
            onPressIn={(text: any) => {
              Keyboard.dismiss();
              setDatePickerVisibility(true);
              console.log(text);
            }}
          />
        </View>
        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>Reason for Leave</Text>
          <TextInput
            value={applyLeave.reason}
            style={[
              styles.input,
              styles.textArea,
              focusedInput === "reasonRef"
                ? styles.focusInput
                : invalidFields === "reasonRef"
                  ? styles.invalidInput
                  : invalidFields === ""
                    ? styles.blurInput
                    : styles.validInput,
            ]}
            ref={leaveFormRef.reasonRef}
            autoComplete="off"
            autoCapitalize="none"
            inputMode="text"
            enterKeyHint="next"
            keyboardType="default"
            placeholder=" I need to take medical leave"
            placeholderTextColor={colors.subtitle}
            returnKeyType="next"
            multiline={true}
            numberOfLines={8}
            onFocus={() => {
              handleFocus("reasonRef");
            }}
            onBlur={() => {
              handleBlur();
              validateForm();
            }}
            onChangeText={(text: any) => {
              setApplyLeave((prevState) => ({
                ...prevState,
                reason: text,
              }));
            }}
          />
        </View>
        <View style={styles.button}>
          <CommonButton
            style={""}
            textColor={colors.white}
            customStyle={""}
            text="Apply Leave"
            iconName=""
            onPress={() => {}}
          />
        </View>
      </View>
    </>
  );

  const filterForm = () => (
    <>
      <View style={[styles.modalHeader]}>
        <View style={styles.modalHeaderFilterContainer}>
          <Text
            color={colors.titleSecond}
            style={[styles.headerTitle, { textAlign: "center" }]}
          >
            Filter
          </Text>
        </View>
        <View style={styles.modalIconFilterContainer}>
          {renderCloseButton()}
        </View>
      </View>
      {/* <View style={styles.lineHR} /> */}
      <View style={styles.modalContent}>
        <View style={styles.filterStatus}>
          <Text style={styles.filterBoxTitleText} color={colors.titleSecond}>
            Status
          </Text>
          <View style={styles.filterChecbox}>
          <View style={{width: '48%', alignItems:'flex-start', alignContent: 'flex-start'}}>
              <CheckBox
                center
                title="Approved"
                checked={isApproved}
                onPress={() => setApproved(!isApproved)}
                iconType="material-community"
                checkedIcon="checkbox-marked"
                uncheckedIcon="checkbox-blank-outline"
                checkedColor={colors.primary}
                size={ScreenWidth * 0.06}
                textStyle={styles.checkboxText}
                containerStyle={styles.checkboxContainer}
              />
              <CheckBox
                center
                title="Unapproved"
                checked={isUnapproved}
                onPress={() => setUnapproved(!isUnapproved)}
                iconType="material-community"
                checkedIcon="checkbox-marked"
                uncheckedIcon="checkbox-blank-outline"
                checkedColor={colors.primary}
                size={ScreenWidth * 0.06}
                textStyle={styles.checkboxText}
                containerStyle={styles.checkboxContainer}
              />
            </View>
            <View style={{width: '48%', alignItems:'flex-start', alignContent: 'flex-start'}}>
              <CheckBox
                center
                title="Pending"
                checked={isPending}
                onPress={() => setPending(!isPending)}
                iconType="material-community"
                checkedIcon="checkbox-marked"
                uncheckedIcon="checkbox-blank-outline"
                checkedColor={colors.primary}
                size={ScreenWidth * 0.06}
                textStyle={styles.checkboxText}
                containerStyle={styles.checkboxContainer}
              />
              <CheckBox
                center
                title="Reject"
                checked={isReject}
                onPress={() => setReject(!isReject)}
                iconType="material-community"
                checkedIcon="checkbox-marked"
                uncheckedIcon="checkbox-blank-outline"
                checkedColor={colors.primary}
                size={ScreenWidth * 0.06}
                textStyle={styles.checkboxText}
                containerStyle={styles.checkboxContainer}
              />
            </View>
          </View>
        </View>
        <View style={styles.lineHR} />
        <View style={styles.filterLeave}>
          <Text style={styles.filterBoxTitleText} color={colors.titleSecond}>
            Leave Type
          </Text>
          <View style={styles.filterChecbox}>
            <View style={{width: '48%', alignItems:'flex-start', alignContent: 'flex-start'}}>
              <CheckBox
                center
                title="Casual Leave"
                checked={isCasualLeave}
                onPress={() => setCasualLeave(!isCasualLeave)}
                iconType="material-community"
                checkedIcon="checkbox-marked"
                uncheckedIcon="checkbox-blank-outline"
                checkedColor={colors.primary}
                size={ScreenWidth * 0.06}
                textStyle={styles.checkboxText}
                containerStyle={styles.checkboxContainer}
              />
              <CheckBox
                center
                title="Sick Leave"
                checked={isSickLeave}
                onPress={() => setSickLeave(!isSickLeave)}
                iconType="material-community"
                checkedIcon="checkbox-marked"
                uncheckedIcon="checkbox-blank-outline"
                checkedColor={colors.primary}
                size={ScreenWidth * 0.06}
                textStyle={styles.checkboxText}
                containerStyle={styles.checkboxContainer}
              />
            </View>
            <View style={{width: '48%', alignItems:'flex-start', alignContent: 'flex-start'}}>
              <CheckBox
                center
                title="Planned Leave"
                checked={isPlannedLeave}
                onPress={() => setPlannedLeave(!isPlannedLeave)}
                iconType="material-community"
                checkedIcon="checkbox-marked"
                uncheckedIcon="checkbox-blank-outline"
                checkedColor={colors.primary}
                size={ScreenWidth * 0.06}
                textStyle={styles.checkboxText}
                containerStyle={styles.checkboxContainer}
              />
              {/* <CheckBox
                center
                title="Holiday"
                checked={isHoliday}
                onPress={() => setHoliday(!isHoliday)}
                iconType="material-community"
                checkedIcon="checkbox-marked"
                uncheckedIcon="checkbox-blank-outline"
                checkedColor={colors.primary}
                size={ScreenWidth * 0.06}
                textStyle={styles.checkboxText}
                containerStyle={styles.checkboxContainer}
              /> */}
            </View>
          </View>
        </View>
        <View style={styles.lineHR} />
        <View style={styles.filterTeamMember}>
          <Text style={styles.filterBoxTitleText} color={colors.titleSecond}>
            Team Member
          </Text>
          <View style={styles.filterChecbox}>
            <Dropdown
              style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              data={data}
              // search
              maxHeight={ScreenHeight * 0.4}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? "Select item" : "..."}
              searchPlaceholder="Search..."
              value={value}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item: any) => {
                setValue(item?.value);
                setIsFocus(false);
              }}
            />
          </View>
        </View>
        <View style={styles.buttonRow}>
          <View style={styles.button50}>
            <CommonButton
              style={""}
              textColor={colors.black}
              customStyle={{ backgroundColor: colors.maiBbackground }}
              text="Reset"
              iconName=""
              onPress={() => {}}
            />
          </View>
          <View style={styles.button50}>
            <CommonButton
              style={""}
              textColor={colors.white}
              customStyle={{ backgroundColor: colors.primary }}
              text="Apply"
              iconName=""
              onPress={() => {}}
            />
          </View>
        </View>
      </View>
    </>
  );

  const formModal = () => (
    <Modal
      animationType={typeModalFor === "leaveForm" ? "fade" : "slide"}
      transparent={true}
      visible={openModal}
      onRequestClose={() => {}}
    >
      <View
        style={[
          typeModalFor === "leaveForm"
            ? styles.centeredView
            : styles.centeredHalfView,
        ]}
      >
        <View
          style={[
            typeModalFor === "leaveForm"
              ? styles.modalFormView
              : styles.modalFilterView,
          ]}
        >
          {typeModalFor === "leaveForm" ? leaveApplyForm() : filterForm()}
        </View>
      </View>
    </Modal>
  );

  const datePicket = () => (
    <DateTimePickerModal
      isVisible={isDatePickerVisible}
      mode="date"
      onConfirm={handleConfirmDate}
      onCancel={hideDatePicker}
    />
  );
  return (
    <>
      <SafeAreaView style={styles.container}>
        {datePicket()}
        {renderHeader()}
        {renderContent()}
        {formModal()}
      </SafeAreaView>
    </>
  );
};

export default LeaveScreen;
