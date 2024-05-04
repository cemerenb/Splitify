import React from "react";
import { StyleSheet, View } from "react-native";

export function MinSpacer() {
  return <View style={styles.minSpace}></View>;
}
export function MidSpacer() {
  return <View style={styles.minSpace}></View>;
}
export function MaxSpacer() {
  return <View style={styles.minSpace}></View>;
}

const styles = StyleSheet.create({
  minSpace: {
    height: 25,
  },
  midSpace: {
    height: 50,
  },
  maxSpace: {
    height: 100,
  },
});
