import React, { useContext } from "react";
import { View, Text } from "react-native";
import { ThemeContext } from "../Theme/ThemeContext";

export default function Stats() {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <Text style={{ color: theme.text }}> Stats Page</Text>
    </View>
  );
}
