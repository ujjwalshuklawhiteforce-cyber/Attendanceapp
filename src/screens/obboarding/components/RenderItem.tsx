import { OnboardingData } from "data/data";
import React, { useMemo } from "react";
import { Image, SafeAreaView, View } from "react-native";
import createStyles from "../OnboardingScreen.style";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";

type Props = {
  item: OnboardingData;
  index: any;
};

export const RenderItem = ({ item, index }: Props) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderContent = (item: any, index: any) => (
    <View style={styles.container}>
      <View style={styles.imageSize}>
        <Image
          resizeMode="contain"
          source={item.image}
          style={styles.imageSize}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.heading} color={colors.black}>
          {item.heading}
        </Text>
        <Text style={styles.subHeading} color={colors.subHeading}>
          {item.subHeading}
        </Text>
        {/* <CustomButton /> */}
      </View>
    </View>
  );

  return <SafeAreaView>{renderContent(item, index)}</SafeAreaView>;
};
