import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { FlatList, TouchableHighlight } from "react-native-gesture-handler";
import { MidSpacer } from "../Utils/Spacers";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";

export default function Groups() {
  const [count, setCount] = useState(0);
  const [groups, setGroups] = useState([]);
  const [loading, setLoadingStatus] = useState(true);

  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  const getGroupIds = async () => {
    setGroups([]);
    let uid = FIREBASE_AUTH.currentUser.uid;
    const docRef = doc(FIRESTORE_DB, "personal", uid);
    const userData = await getDoc(docRef);
    setGroups(userData.data().groups);
    setLoadingStatus(false);
  };

  useEffect(() => {
    if (count == 0) {
      getGroupIds();
    }
    setCount(1);
  }, [groups]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="rgb(222, 110, 235)" />
      </View>
    );
  } else {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <MidSpacer></MidSpacer>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 20,
          }}
        >
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

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              navigation.navigate("CreateGroup");
            }}
          >
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
        <View
          style={{
            flex: 20,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          {groups.length > 0 ? (
            <View>
              <Text>{groups[0]}</Text>
              <Text>{groups[1]}</Text>
            </View>
          ) : (
            <Text>You don't have any groups</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }
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
