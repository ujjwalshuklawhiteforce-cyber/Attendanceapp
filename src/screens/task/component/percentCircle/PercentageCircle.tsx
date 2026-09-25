import React, { useMemo } from "react";
import { View } from "react-native";
import createStyles from "./PercentageCircle.style";
import { useTheme } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import Text from "@shared-components/text-wrapper/TextWrapper";

interface PercentageItem {
  percentage?: any;
  radius?: any;
  strokeWidth?: any;
  color?: any;
  filledColor: any;
  unfilledColor: any;
}
const PercentageCircle: React.FC<PercentageItem> = ({
  percentage,
  radius,
  strokeWidth,
  filledColor,
  unfilledColor,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const size = radius * 2;
  const halfSize = size / 2;
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={halfSize}
          cy={halfSize}
          r={radius - strokeWidth / 2}
          stroke={unfilledColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Foreground Circle */}
        <Circle
          cx={halfSize}
          cy={halfSize}
          r={radius - strokeWidth / 2}
          stroke={filledColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.text} color={colors.white}>{`${percentage}%`}</Text>
      </View>
    </View>
  );
};

export default PercentageCircle;
