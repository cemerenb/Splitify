import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs/lib/typescript/src/types";
import { FontAwesome as Icon } from "@expo/vector-icons";
import { TabBg } from "../Svg/TabBarSvg";

type Props = BottomTabBarButtonProps & {
  bgColor?: string;
};

export const TabBarAdvancedButton: React.FC<Props> = ({
  bgColor,
  ...props
}) => (
  <View style={styles.container} pointerEvents="box-none">
    <TabBg color={bgColor} style={styles.background} />
    <TouchableOpacity style={styles.button} onPress={props.onPress}>
      <Icon name="plus" style={styles.buttonIcon} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: 75,
    alignItems: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    color: "green",
  },
  button: {
    top: -30.5,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    borderRadius: 100,
    backgroundColor: "#E94F37",
  },
  buttonIcon: {
    fontSize: 30,
    fontWeight: "normal",
    color: "white",
  },
});
