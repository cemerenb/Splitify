import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import {
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";

export default function JoinPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoadingStatus] = useState(false);
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();
  const checkInviteCode = async (code) => {
    setLoadingStatus(true);
    try {
      const docRef = doc(FIRESTORE_DB, "invites", code); // Get group doc
      const codeData = await getDoc(docRef);
      console.log(codeData.data().timeStamp);
      console.log(new Date().getTime());

      console.log("code data fetched");

      if (codeData.data().used == true) {
        Alert.alert("This invitation code has been used before");
        setLoadingStatus(false);
      } else {
        if (codeData.data().timeStamp < new Date().getTime()) {
          Alert.alert("Invitation code has expired");
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
            Alert.alert("An error occured while joining group");
            setLoadingStatus(false);
          }
        }
      }
    } catch {
      Alert.alert("Invitation code is incorrect or invalid");
      setLoadingStatus(false);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.textArea}>
        <Text style={{ fontSize: 50, color: "white" }}>Join a Group</Text>
      </View>

      <View style={styles.bottomSheet}>
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
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 20,
              padding: 10,
            }}
            maxLength={25}
            placeholder="Invite Code"
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
              <View style={{ flex: 1, justifyContent: "center" }}>
                <ActivityIndicator size="small" color="white" />
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
