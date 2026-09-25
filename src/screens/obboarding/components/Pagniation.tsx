import { OnboardingData } from "data/data";
import React, { useMemo } from "react";
import { View } from "react-native";
import { SharedValue } from "react-native-reanimated";
import createStyles from "../OnboardingScreen.style";
import { useTheme } from "@react-navigation/native";
import { Dot } from "./Dot";

type PaginationProps = {
  data: OnboardingData[];
  x: SharedValue<number>;
};

export const Pagniation = ({ data, x }: PaginationProps) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderContent = (data: any, x: any) => (
    <View style={styles.paginationDotContainer}>
      {data.map((_, index) => {
        return <Dot key={index} index={index} x={x} />;
      })}
    </View>
  );
  return <View>{renderContent(data, x)}</View>;
};
