import React, { useContext, useLayoutEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { ThemeContext } from "../Theme/ThemeContext";
import SwitchSelector from "react-native-switch-selector";
import * as SecureStore from "expo-secure-store";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MidSpacer } from "../Utils/Spacers";

function Profile() {
  const { theme, mode, setMode } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [selection, setSelection] = useState(0);
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  useLayoutEffect(() => {
    if (count === 0) {
      AsyncStorage.getItem("themeMode").then((value) => {
        setSelection(value == "dark" ? 2 : value == "light" ? 1 : 0);
        console.log(value == "dark" ? 2 : value == "light" ? 1 : 0);
      });
      setCount(1);
    }
  }, []);
  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync("email");
      await SecureStore.deleteItemAsync("password");
      await FIREBASE_AUTH.signOut();
      navigation.replace("Login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const setTheme = (value) => {
    if (value == 0) {
      setMode("automatic");
    } else if (value == 1) {
      setMode("light");
    } else {
      setMode("dark");
    }
  };
  const options = [
    {
      label: (
        <Ionicons
          name="phone-portrait-outline"
          size={20}
          color={theme.text}
        ></Ionicons>
      ),
      value: 0,
    },
    {
      label: (
        <Ionicons name="sunny-outline" size={20} color={theme.text}></Ionicons>
      ),
      value: 1,
    },
    {
      label: (
        <Ionicons name="moon-outline" size={20} color={theme.text}></Ionicons>
      ),
      value: 2,
    },
  ];
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background, paddingTop: 50 }}
    >
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View
            style={[styles.modalContainer, { backgroundColor: theme.card }]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                width: Dimensions.get("window").width * 0.7,
              }}
            >
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ marginTop: 20 }}
              >
                <Ionicons name="close" size={30} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 24, color: theme.text }}>
              {FIREBASE_AUTH.currentUser.displayName}
            </Text>
            <Text style={{ fontSize: 12, marginBottom: 30, color: theme.text }}>
              {FIREBASE_AUTH.currentUser.uid}
            </Text>
            <QRCode
              color={theme.text}
              backgroundColor={theme.reverse}
              value={FIREBASE_AUTH.currentUser.uid}
              size={Dimensions.get("window").width / 2}
              logo={require("../icon.png")}
              logoSize={50}
            />
          </View>
        </View>
      </Modal>
      <View style={styles.container}>
        <View
          style={[styles.profileContainer, { backgroundColor: theme.primary }]}
        >
          <LinearGradient
            colors={["rgba(130, 67, 255, 1)", "rgba(221, 50, 52, 1)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileIconContainer}
          >
            <Ionicons name="person-outline" color={"white"} size={40} />
          </LinearGradient>
          <View style={styles.profileInfoContainer}>
            <View style={styles.profileTextContainer}>
              <Text style={{ fontSize: 22, color: theme.text }}>
                {FIREBASE_AUTH.currentUser.displayName}
              </Text>
              <Text style={{ fontSize: 13, color: theme.text }}>
                {FIREBASE_AUTH.currentUser.email}
              </Text>
            </View>
            <TouchableOpacity
              style={{ paddingRight: 20 }}
              onPress={() => {
                setModalVisible(true);
              }}
            >
              <Ionicons name="qr-code-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
        <MidSpacer></MidSpacer>
        <View
          style={{
            width: "100%",
            backgroundColor: theme.primary,
            alignItems: "center",
            paddingLeft: 20,
            borderRadius: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              backgroundColor: theme.primary,
              alignItems: "center",
              borderRadius: 20,
              height: 60,
            }}
          >
            <Text style={{ color: theme.text, fontSize: 18 }}>Theme</Text>
            <View style={{ width: "40%", paddingRight: 10 }}>
              <SwitchSelector
                options={options}
                initial={selection}
                buttonColor={theme.themeSelector}
                backgroundColor={theme.shadow}
                onPress={(value) => {
                  setSelection(value);
                  setTheme(value);
                }}
              />
            </View>
          </View>
          <View
            style={{
              marginLeft: -20,
              height: 0.4,
              backgroundColor: "grey",
              width: "100%",
            }}
          ></View>
          <TouchableOpacity
            style={{
              borderRadius: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              backgroundColor: theme.primary,
              alignItems: "center",
              height: 60,
              paddingRight: 10,
            }}
          >
            <Text style={{ color: theme.text, fontSize: 18 }}>
              Invite your friends
            </Text>
            <Ionicons
              name="chevron-forward-outline"
              color={theme.text}
              size={25}
            ></Ionicons>
          </TouchableOpacity>
          <View
            style={{
              marginLeft: -20,
              height: 0.4,
              backgroundColor: "grey",
              width: "100%",
            }}
          ></View>
          <TouchableOpacity
            style={{
              borderRadius: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              backgroundColor: theme.primary,
              alignItems: "center",
              height: 60,
              paddingRight: 10,
            }}
          >
            <Text style={{ color: theme.text, fontSize: 18 }}>Help</Text>
            <Ionicons
              name="chevron-forward-outline"
              color={theme.text}
              size={25}
            ></Ionicons>
          </TouchableOpacity>
        </View>
        <MidSpacer></MidSpacer>

        <View
          style={{
            width: Dimensions.get("window").width - 40,
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              signOut();
            }}
            style={{
              borderRadius: 20,

              backgroundColor: "rgb(253,60,74)",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 15,
            }}
          >
            <Ionicons
              color={"white"}
              name="log-out-outline"
              size={30}
            ></Ionicons>

            <Text style={{ color: "white", fontSize: 20, paddingLeft: 10 }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Profile;

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    marginBottom: 20,
  },

  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
    flex: 1,
  },
  profileContainer: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingLeft: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileIconContainer: {
    borderRadius: 200,
    width: (Dimensions.get("window").width - 60) / 5,
    height: (Dimensions.get("window").width - 60) / 5,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfoContainer: {
    width: (Dimensions.get("window").width - 60) * 0.8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileTextContainer: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
    justifyContent: "space-evenly",
  },

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: Dimensions.get("window").width * 0.8,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },

  logoutButton: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: "black",
    marginTop: 30,
    alignSelf: "center",
  },
  logoutText: {
    color: "black",
    fontSize: 25,
  },
});
