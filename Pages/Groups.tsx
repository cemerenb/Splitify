import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { TouchableHighlight } from "react-native-gesture-handler";
import { MidSpacer } from "../Utils/Spacers";

export default function Groups() {
  const [count, setCount] = useState(0);
  const [groups, setGroups] = useState([]);
  const [loading, setLoadingStatus] = useState(true);

  const getGroupIds = async () => {
    setGroups([]);
    let uid = FIREBASE_AUTH.currentUser.uid;
    const docRef = doc(FIRESTORE_DB, "personal", uid);
    const userData = await getDoc(docRef);

    setGroups((groups) => [...groups, userData.data().groups]);
    setLoadingStatus(false);
    console.log(groups);
  };
  useLayoutEffect(() => {
    if (count == 0) {
      getGroupIds();

      setCount(1);
    }
  }, []);
  return (
    <SafeAreaView>
      <MidSpacer></MidSpacer>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity activeOpacity={0.7}>
            <View style={styles.groupContainer}>
              <Ionicons
                name={"people-outline"}
                style={{ fontSize: 40, color: "white" }}
              ></Ionicons>
              <Text
                style={{ fontSize: 18, paddingHorizontal: 4, color: "white" }}
              >
                Join Group
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7}>
            <View style={styles.groupContainer}>
              <Ionicons
                name={"add"}
                style={{ fontSize: 40, color: "white" }}
              ></Ionicons>
              <Text
                style={{ fontSize: 18, paddingHorizontal: 4, color: "white" }}
              >
                Create Group
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text>{groups}</Text>
        <Text> Groups Page</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  groupContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    height: 70,
    width: (Dimensions.get("window").width - 60) / 2,
    borderRadius: 10,
    backgroundColor: "grey",
  },
});
