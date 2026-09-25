/**
 * ? Local Imports
 */
import React, { useMemo } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as NavigationService from "react-navigation-helpers";
import createStyles from "./TeamMemberDetailScreen.style";
import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import { SCREENS } from "@shared-constants";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
// import { CommonButton } from "@screens/common/button/CommonButton";

interface teamMemberDetailScreenProps {}

const teamMemberDetailScreen: React.FC<teamMemberDetailScreenProps> = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleItemPress = () => {
    NavigationService.navigate(SCREENS.TEAM);
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
          Tarun K. Gupta
        </Text>
      </View>
    </View>
  );

  const renderContent = () => (
    <View style={styles.contentContainer}>
      <View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Position
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            Senior Consultant
          </Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Mobile Number
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            (+91) 8120239387
          </Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Email Address
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            tg.abc@gmail.com
          </Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Address
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            2539/40 Near Jain Mandir, Shiv Nagar, Jabalpur (M.P), 482001
          </Text>
        </View>
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle} color={colors.blackOverlay}>
            Supportive Documents
          </Text>
          <Text style={styles.itemValue} color={colors.black}>
            Aadhar Card (Uploaded), Pan Card(Not Uploaded)
          </Text>
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

export default teamMemberDetailScreen;
