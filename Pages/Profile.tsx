import React, { useContext, useLayoutEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Share,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ThemeContext } from "../Theme/ThemeContext";
import SwitchSelector from "react-native-switch-selector";
import * as SecureStore from "expo-secure-store";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MidSpacer } from "../Utils/Spacers";
import {
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

function Profile() {
  const { theme, mode, setMode } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [count, setCount] = useState(0);
  const [selection, setSelection] = useState(0);
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  useLayoutEffect(() => {
    if (count === 0) {
      AsyncStorage.getItem("themeMode").then((value) => {
        setSelection(value == "dark" ? 2 : value == "light" ? 1 : 0);
        console.log("--------------------------");

        console.log(value == "dark" ? 2 : value == "light" ? 1 : 0);
      });
      setCount(1);
    }
  }, []);
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: "https://cemerenb.github.io/cemerenb/redirect.html",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert("An error occured");
    }
  };

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
          size={Dimensions.get("window").height / 50}
          color={theme.text}
        ></Ionicons>
      ),
      value: 0,
    },
    {
      label: (
        <Ionicons
          name="sunny-outline"
          size={Dimensions.get("window").height / 50}
          color={theme.text}
        ></Ionicons>
      ),
      value: 1,
    },
    {
      label: (
        <Ionicons
          name="moon-outline"
          size={Dimensions.get("window").height / 50}
          color={theme.text}
        ></Ionicons>
      ),
      value: 2,
    },
  ];
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: Dimensions.get("window").width / 14,
      }}
    >
      <View style={{ paddingBottom: 0 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingTop: 10,
            }}
          >
            <Ionicons
              color={theme.text}
              name="chevron-back-outline"
              size={30}
            ></Ionicons>
            <Text style={{ color: theme.text, fontSize: 18 }}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View
            style={[styles.modalContainer, { backgroundColor: theme.shadow }]}
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

            <Text
              style={{
                fontSize: Dimensions.get("window").width / 17,
                color: theme.text,
              }}
            >
              {FIREBASE_AUTH.currentUser.displayName != null
                ? FIREBASE_AUTH.currentUser.displayName
                : "Unknown"}
            </Text>
            <Text
              style={{
                fontSize: Dimensions.get("window").width / 40,
                marginBottom: 30,
                color: theme.text,
              }}
            >
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
              <Text
                style={{
                  fontSize: Dimensions.get("window").width / 18,
                  color: theme.text,
                }}
              >
                {FIREBASE_AUTH.currentUser.displayName}
              </Text>
              <Text
                style={{
                  fontSize: Dimensions.get("window").width / 30,
                  color: theme.text,
                }}
              >
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
              height: Dimensions.get("window").height / 16,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: Dimensions.get("window").width / 25,
              }}
            >
              Theme
            </Text>
            <View
              style={{
                width: "40%",

                paddingRight: 10,
              }}
            >
              <SwitchSelector
                height={Dimensions.get("window").height / 25}
                options={options}
                initial={selection}
                buttonColor={theme.button}
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
            onPress={() => {
              onShare();
            }}
            style={{
              borderRadius: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              backgroundColor: theme.primary,
              alignItems: "center",
              height: Dimensions.get("window").height / 16,
              paddingRight: 10,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: Dimensions.get("window").width / 25,
              }}
            >
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
              height: Dimensions.get("window").height / 16,
              paddingRight: 10,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: Dimensions.get("window").width / 25,
              }}
            >
              Help
            </Text>
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
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setModalVisible2(true);
            }}
            style={{
              borderRadius: 20,

              backgroundColor: theme.reverse,
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              paddingHorizontal: 20,
              height: Dimensions.get("window").height / 16,
            }}
          >
            <Ionicons
              color={theme.text}
              name="close-outline"
              size={30}
            ></Ionicons>

            <Text
              style={{
                color: theme.text,
                fontSize: Dimensions.get("window").width / 25,
                paddingLeft: 10,
              }}
            >
              Delete Account
            </Text>
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
              height: Dimensions.get("window").height / 16,
            }}
          >
            <Ionicons
              color={"white"}
              name="log-out-outline"
              size={30}
            ></Ionicons>

            <Text
              style={{
                color: "white",
                fontSize: Dimensions.get("window").width / 25,
                paddingLeft: 10,
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible2}
          onRequestClose={() => {
            setModalVisible2(!modalVisible2);
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(10,10,10,0.6)",
              flex: 1,
              height: Dimensions.get("window").height,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                backgroundColor: theme.primary,
                width: "80%",
                paddingTop: 50,
                borderRadius: 20,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 18,
                  paddingBottom: 5,
                }}
              >
                Delete Account
              </Text>
              <Text
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 26,
                  paddingBottom: 40,
                }}
              >
                Are you sure you want to delete your account? This is an
                irreversible action.
              </Text>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible2(false);
                    setProcessing(false);
                  }}
                  style={{
                    width: "50%",
                    height: 50,
                    backgroundColor: theme.shadow,
                    borderBottomLeftRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: Dimensions.get("window").width / 26,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setProcessing(false);
                    navigation.replace("DeleteAccount");
                  }}
                  style={{
                    borderBottomRightRadius: 20,
                    width: "50%",
                    height: 50,
                    backgroundColor: "rgb(253,60,74)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {processing ? (
                    <ActivityIndicator
                      size={"small"}
                      color={"white"}
                    ></ActivityIndicator>
                  ) : (
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: Dimensions.get("window").width / 26,
                      }}
                    >
                      Delete Account
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingTop: 20,
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
