import React, { useContext, useState } from "react";
import {
  Dimensions,
  Keyboard,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Modal,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import {
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigation, useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import { ThemeContext } from "../Theme/ThemeContext";

export default function JoinPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoadingStatus] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalText, setModalText] = useState("");
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();
  const checkInviteCode = async (code) => {
    setLoadingStatus(true);
    try {
      const docRef = doc(FIRESTORE_DB, "invites", code); // Get group doc
      const codeData = await getDoc(docRef);
      console.log(codeData.data().timeStamp);
      console.log(new Date().getTime());
      const groupDocRef = doc(FIRESTORE_DB, "groups", codeData.data().groupId);
      const found = (await getDoc(groupDocRef)).exists();
      console.log(found);

      console.log("code data fetched");
      if (found) {
        if (codeData.data().used == true) {
          setModalText("This invitation code has been used before");
          setModalVisible2(true);
          setLoadingStatus(false);
        } else {
          if (codeData.data().timeStamp < new Date().getTime()) {
            setModalText("Invitation code has expired");
            setModalVisible2(true);
            setLoadingStatus(false);
          } else {
            try {
              const personalDocRef = doc(
                FIRESTORE_DB,
                "personal",
                FIREBASE_AUTH.currentUser.uid
              );
              await updateDoc(personalDocRef, {
                groups: arrayUnion(codeData.data().groupId),
              });
              console.log("group added to user data");
              const groupDocRef = doc(
                FIRESTORE_DB,
                "groups",
                codeData.data().groupId
              );
              await updateDoc(groupDocRef, {
                members: arrayUnion(FIREBASE_AUTH.currentUser.uid),
              });
              console.log("user added to members data");
              const data = {
                used: true,
              };
              await updateDoc(docRef, data);
              console.log("code made used");
              await deleteDoc(docRef);
              setLoadingStatus(false);
              navigation.goBack();
            } catch {
              setModalText("An error occured while joining group");
              setModalVisible2(true);
              setLoadingStatus(false);
            }
          }
        }
      } else {
        setModalText("This group no longer exists");
        setModalVisible2(true);
        setLoadingStatus(false);
      }
    } catch {
      setModalText("Invitation code is incorrect or invalid");
      setModalVisible2(true);
      setLoadingStatus(false);
    }
  };
  return (
    <View style={{ flex: 1 }}>
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
              style={{ color: theme.text, fontSize: 16, paddingBottom: 40 }}
            >
              {modalText}
            </Text>
            <View style={{ width: "100%", flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible2(false);
                }}
                style={{
                  width: "100%",
                  height: 50,
                  backgroundColor: theme.shadow,
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: theme.text, fontSize: 18 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.textArea}>
        <Text style={{ fontSize: 50, color: "white" }}>Join a Group</Text>
      </View>

      <View style={[styles.bottomSheet, { backgroundColor: theme.background }]}>
        <View>
          <TextInput
            style={{
              marginVertical: 40,
              fontSize: 18,
              textAlignVertical: "center",
              lineHeight: 25,
              height: 65,
              width: Dimensions.get("window").width - 40,
              borderRadius: 10,
              backgroundColor: theme.primary,
              color: theme.text,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 20,
              padding: 10,
            }}
            maxLength={25}
            placeholder="Invite Code"
            placeholderTextColor={theme.text}
            value={inviteCode}
            onChangeText={setInviteCode}
            keyboardType="default"
            autoCapitalize="characters"
          />
        </View>
        <TouchableOpacity
          onPress={async () => {
            checkInviteCode(inviteCode);
          }}
        >
          <View
            style={{
              marginVertical: 50,
              height: 65,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: 10,
              alignSelf: "center",
              justifyContent: "center",
              width: Dimensions.get("window").width - 40,
              alignItems: "center",
              backgroundColor: "#FF964F",
            }}
          >
            {loading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  backgroundColor: "transparent",
                }}
              >
                <ActivityIndicator size="small" color={theme.buttonText} />
              </View>
            ) : (
              <Text style={{ color: "white", fontSize: 20 }}>Join Group</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  textArea: {
    flex: 2,
    paddingBottom: 80,
    paddingHorizontal: 20,
    justifyContent: "center",
    backgroundColor: "#FF964F",
  },
  bottomSheet: {
    justifyContent: "space-between",
    padding: 20,
    marginTop: -50,
    flex: 6,
    bottom: 0,
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    width: "100%",
    color: "rgb(0,168,107)",
    backgroundColor: "white",
  },
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addData: {
    justifyContent: "center",
    borderRadius: 30,
    height: 100,
    width: Dimensions.get("window").width - 20,
    color: "red",
    backgroundColor: "red",
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: "#151E26",
  },
  dropdownButtonArrowStyle: {
    fontSize: 28,
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: "#E9ECEF",
    borderRadius: 10,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: "#151E26",
  },
  dropdownButtonStyle: {
    width: Dimensions.get("window").width - 40,
    height: 65,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "grey",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
});
