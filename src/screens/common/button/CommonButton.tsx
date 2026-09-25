import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import createStyles from "./CommonButton.style";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import Icon, { IconType } from "react-native-dynamic-vector-icons";

type Props = {
  text: string;
  customStyle: any;
  textColor: any;
  iconName: string;
  style: any
  onPress: () => void;
};

export const CommonButton = ({
  text,
  customStyle,
  textColor,
  iconName,
  style,
  onPress,
}: Props) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderContent = () => (
    <TouchableOpacity onPress={onPress} style={style}>
      <View style={[styles.button, customStyle]}>
        <View style={styles.ButtonTextContainer}>
          {iconName && (
            <Icon
              name={iconName}
              type={IconType.Ionicons}
              color={colors.iconBlack}
              style={styles.ButtonTextIcon}
            />
          )}
          <Text style={styles.textSize} color={textColor}>
            {text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return <View>{renderContent()}</View>;
};
