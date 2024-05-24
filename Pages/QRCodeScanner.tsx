import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity } from "react-native";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
type RootStackParamList = {
  QRScanner: { groupId: string };
};
type QRScannerRouteProp = RouteProp<RootStackParamList, "QRScanner">;

interface QRScannerProps {
  route: QRScannerRouteProp;
}
const QRScanner: React.FC<QRScannerProps> = ({ route }) => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();
  const [permission, requestPermission] = useCameraPermissions();
  const { groupId } = route.params;

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={(scanningResult: BarcodeScanningResult) => {
          //@ts-ignore
          navigation.replace("ScanResult", {
            groupId: groupId,
            uid: scanningResult.raw,
          });
          console.log(scanningResult.raw);
        }}
      >
        <View style={styles.buttonContainer}></View>
      </CameraView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
export default QRScanner;
