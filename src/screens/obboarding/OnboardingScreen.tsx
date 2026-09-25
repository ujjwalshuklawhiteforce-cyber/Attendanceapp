import React, { useMemo, useState } from "react";
import { View, ViewToken, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import createStyles from "./OnboardingScreen.style";
import { useTheme } from "@react-navigation/native";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import onboardingData, { OnboardingData } from "data/data";
import { RenderItem } from "@screens/obboarding/components/RenderItem";
import { Pagniation } from "./components/Pagniation";
import { CustomButton } from "./components/CustomButton";
import Text from "@shared-components/text-wrapper/TextWrapper";

const OnboardingScreen: React.FC = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const flatListRef = useAnimatedRef<FlatList<OnboardingData>>();
  const flatListIndex = useSharedValue(0);
  const x = useSharedValue(0);
  
  // Language state - default to English
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi">("en");
  
  // Get data based on selected language
  const data = onboardingData[selectedLanguage];

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => { 
    if (viewableItems[0]?.index != null) {
      flatListIndex.value = viewableItems[0].index;
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  const toggleLanguage = () => {
    setSelectedLanguage(prev => prev === "en" ? "hi" : "en");
    // Reset to first slide when changing language
    flatListIndex.value = 0;
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });
  };

  return (
    <View style={styles.container}>
      {/* Language Toggle Button - Top Right */}
      <View style={langStyles.languageButtonContainer}>
        <TouchableOpacity 
          style={[langStyles.languageButton, { backgroundColor: "white" }]}
          onPress={toggleLanguage}
          activeOpacity={0.8}
        >
          <Text style={langStyles.languageButtonText}>
            {selectedLanguage === "en" ? "हिंदी" : "English"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.panigationContainer}>
        <Pagniation data={data} x={x} />
      </View>
      
      <Animated.FlatList
        ref={flatListRef}
        onScroll={onScroll}
        data={data}
        renderItem={({ item, index }) => {
          return <RenderItem item={item} index={index} />;
        }}
        keyExtractor={(item) => item.id.toString()}
        scrollEventThrottle={16}
        horizontal={true}
        bounces={false}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={{
          minimumViewTime: 300,
          viewAreaCoveragePercentThreshold: 10,
        }}
      />
      <View style={styles.buttonContainer}>
        <CustomButton
          flatListRef={flatListRef}
          flatListIndex={flatListIndex}
          dataLength={data.length}
          data={data} // Pass the data array here
        />
      </View>
    </View>
  );
};

const langStyles = StyleSheet.create({
  languageButtonContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  languageButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default OnboardingScreen;