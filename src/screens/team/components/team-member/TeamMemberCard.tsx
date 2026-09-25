import React, { useMemo } from "react";
import { Image, StyleProp, View, ViewStyle } from "react-native";
import createStyles from "./TeamMemberCard.style";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import { ITeamMember } from "@services/models";
import RNBounceable from "@freakycoder/react-native-bounceable";
import Icon, { IconType } from "react-native-dynamic-vector-icons";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ITeamMemerCard {
  style?: CustomStyleProp;
  key: any;
  data: ITeamMember;
  onPress: () => void;
}

const profileURI =
  // eslint-disable-next-line max-len
  "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2574&q=80";

const TeamMemberCard: React.FC<ITeamMemerCard> = ({
  style,
  key,
  data,
  onPress,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderNotifiButton = () => (
    <RNBounceable
      onPress={onPress}
    >
      <View>
        <Icon
          name="ellipsis-vertical-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );

  return (
    <>
      <View style={styles.memberCard} key={key}>
        <View style={styles.memberImg}>
          <Image
            resizeMode="cover"
            source={{ uri: profileURI }}
            style={styles.profilePicImageStyle}
          />
        </View>
        <View style={styles.memberContent}>
          <Text style={styles.memberName} color={colors.titleSecond}>
            {data.name}
          </Text>
          <Text style={styles.memberEmail} color={colors.subtitle2}>
            {data.email_address}
          </Text>
        </View>
        <View style={styles.memberIcon}>{renderNotifiButton()}</View>
      </View>
      <View style={styles.lineHR} />
    </>
  );
};

export default TeamMemberCard;
