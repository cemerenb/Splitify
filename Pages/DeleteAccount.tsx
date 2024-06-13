import {
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import { useContext, useEffect } from "react";
import { ActivityIndicator, Dimensions, View, Text } from "react-native";
import React from "react";
import { ThemeContext } from "../Theme/ThemeContext";
import { MidSpacer } from "../Utils/Spacers";
import i18n from "../Language/i18n";

export default function DeleteAccount() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    deleteAccount();
  }, []);
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();
  const leaveGroup = async () => {
    const userUid = FIREBASE_AUTH.currentUser.uid;
    const personalDocRef = doc(FIRESTORE_DB, "personal", userUid);
    const groups = (await getDoc(personalDocRef)).data().groups;
    const nameDocRef = doc(FIRESTORE_DB, "users", userUid);
    await deleteDoc(nameDocRef);
    for (const groupId of groups) {
      const docRef = doc(FIRESTORE_DB, "groups", groupId);
      const data = (await getDoc(docRef)).data();
      const members = data.members;
      const admins = data.admins;
      const updatedMembers = members.filter((e) => e !== userUid);
      const updateAdmins = admins.filter((a) => a !== userUid);
      const randomNumber =
        Math.floor(Math.random() * (updatedMembers.length - 1 - 0 + 1)) + 0;
      const newOwner = {
        ownerUid: updatedMembers[randomNumber],
        members: updatedMembers,
        admins: updateAdmins,
      };
      const newData = {
        members: updatedMembers,
        admins: updateAdmins,
      };
      if (data.ownerUid == userUid) {
        await updateDoc(docRef, newOwner);
        await updateDoc(docRef, {
          admins: arrayUnion(updatedMembers[randomNumber]),
        });
      } else {
        await updateDoc(docRef, newData);
      }
    }
    await deleteDoc(personalDocRef);
    FIREBASE_AUTH.currentUser.delete();
    await SecureStore.deleteItemAsync("email");
    await SecureStore.deleteItemAsync("password");
    await FIREBASE_AUTH.signOut();
    console.log("Account Deleted");

    navigation.replace("Login");
  };
  const deleteAccount = async () => {
    await leaveGroup();
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        height: Dimensions.get("window").height,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 30, color: theme.text }}>
        {i18n.accountdeleting}
      </Text>
      <MidSpacer></MidSpacer>
      <ActivityIndicator
        size={"large"}
        color={theme.gradientStart}
      ></ActivityIndicator>
    </View>
  );
}
