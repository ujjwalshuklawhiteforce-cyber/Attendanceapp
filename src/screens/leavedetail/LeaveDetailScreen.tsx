/**
 * ? Local Imports
 */
import React, { useMemo } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as NavigationService from "react-navigation-helpers";
import createStyles from "./LeaveDetailScreen.style";
import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import { SCREENS } from "@shared-constants";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { CommonButton } from "@screens/common/button/CommonButton";

interface LeaveDetailScreenProps {}

const LeaveDetailScreen: React.FC<LeaveDetailScreenProps> = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleItemPress = () => {
    NavigationService.navigate(SCREENS.LEAVE);
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
          Leave Details
        </Text>
      </View>
    </View>
  );

  const renderContent = () => (
    <View style={styles.contentContainer}>
      <View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Title
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            Sick
          </Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Leave Type
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            Medical Leave
          </Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Date
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            April 15, 2023 - April 18, 2023
          </Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Reason
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            I need to take medical leave
          </Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Applied on
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            February 20, 2023
          </Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Contact No
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            (+91) 8120239387
          </Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Status
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            Pending
          </Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Approved By
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            Mili Chavan
          </Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <View style={styles.button50}>
          <CommonButton
            style={""}
            textColor={colors.white}
            customStyle={{ backgroundColor: colors.danger }}
            text="Reject"
            iconName="close-circle-outline"
            onPress={() => {}}
          />
        </View>
        <View style={styles.button50}>
          <CommonButton
            style={""}
            textColor={colors.white}
            customStyle={{ backgroundColor: colors.success }}
            text="Accept"
            iconName="checkmark-circle-outline"
            onPress={() => {}}
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

export default LeaveDetailScreen;
