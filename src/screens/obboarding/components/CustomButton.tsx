import React, { useMemo } from "react";
import { FlatList, TouchableOpacity, View, Text as RNText } from "react-native";
import createStyles from "../OnboardingScreen.style";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import { AnimatedRef, SharedValue, useAnimatedReaction } from "react-native-reanimated";
import { OnboardingData } from "data/data";
import {
  requestCalendarPermission,
  requestCameraPermission,
  requestLocationPermission,
} from "@services/event-emitter/permission";
import { SCREENS } from "@shared-constants";
import * as NavigationService from "react-navigation-helpers";
import { useAuth } from "context/AuthContext";
import { runOnJS } from "react-native-reanimated";

type Props = {
  dataLength: number;
  flatListIndex: SharedValue<number>;
  flatListRef: AnimatedRef<FlatList<OnboardingData>>;
  data: OnboardingData[]; // Add this to receive the onboarding data
};

export const CustomButton = ({
  dataLength,
  flatListIndex,
  flatListRef,
  data,
}: Props) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { setOnboard } = useAuth();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Update current index when flatListIndex changes
  useAnimatedReaction(
    () => flatListIndex.value,
    (currentValue) => {
      runOnJS(setCurrentIndex)(currentValue);
    }
  );

  // Get button text based on current index
  const buttonText = data[currentIndex]?.buttonText || "Next";

  const handlePermission = async () => {
    try {
      // const [cameraPermission, locationPermission, calendarPermission] = await Promise.all([
      //   requestCameraPermission(),
      //   requestLocationPermission(),
      //   requestCalendarPermission(),
      // ]);

      // Set onboarding as completed
      await setOnboard(true);

      // if (cameraPermission && locationPermission && calendarPermission) {
      // //   console.log("All permissions granted");
      // } else {
      // //   console.log("Some permissions denied");
      // }
      
      // Navigate to login
      NavigationService.push(SCREENS.LOGIN);
    } catch (error) {
      console.error("Error handling permissions:", error);
      await setOnboard(true);
      NavigationService.push(SCREENS.LOGIN);
    }
  };

  const handlePress = async () => {
    if (flatListIndex?.value < dataLength - 1) {
      flatListRef.current?.scrollToIndex({
        index: flatListIndex.value + 1,
      });
    } else {
      await handlePermission();
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.button}>
          <Text h4 color={colors.white} style={{ fontSize: 16, fontWeight: 'bold' }}>
            {buttonText}
          </Text>
          
          {/* Fallback if custom Text doesn't work */}
          {/* <RNText style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            {buttonText}
          </RNText> */}
        </View>
      </TouchableOpacity>
    </View>
  );
};