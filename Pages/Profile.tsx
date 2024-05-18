import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";

function Profile() {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                width: Dimensions.get("window").width * 0.7,
              }}
            >
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={30} color="black" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 24 }}>
              {FIREBASE_AUTH.currentUser.displayName}
            </Text>
            <Text style={{ fontSize: 12, marginBottom: 30 }}>
              {FIREBASE_AUTH.currentUser.uid}
            </Text>
            <QRCode
              value={FIREBASE_AUTH.currentUser.uid}
              size={Dimensions.get("window").width / 2}
              logo={require("../icon.png")}
              logoSize={50}
            />
          </View>
        </View>
      </Modal>
      <View style={styles.container}>
        <View style={styles.profileContainer}>
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
              <Text style={styles.displayName}>
                {FIREBASE_AUTH.currentUser.displayName}
              </Text>
              <Text style={styles.email}>
                {FIREBASE_AUTH.currentUser.email}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
              }}
            >
              <Ionicons name="qr-code-outline" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <View>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default Profile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
    flex: 1,
  },
  profileContainer: {
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
  displayName: {
    fontSize: 22,
  },
  email: {
    fontSize: 12,
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
  closeButton: {
    marginTop: 20,
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
