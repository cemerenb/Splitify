import React, { useEffect, useState } from "react";
import {
  Image,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import { Icon } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaxSpacer } from "../Utils/Spacers";

// Define the type for group data
type Group = {
  groupId: string;
  groupName: string;
  leaderId: string;
  memberCount: number;
  name: string;
  type: number;
};

const Groups = () => {
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState<Group[]>([]);
  const [names, setNames] = useState([]);
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  const fetchGroupData = async () => {
    const userId = FIREBASE_AUTH.currentUser.uid; // Get current user ID
    const userDocRef = doc(FIRESTORE_DB, "personal", userId); // Get personal doc
    const userData = await getDoc(userDocRef); // Fetch personal data

    const groupIds = userData.data().groups; // Get the list of group IDs

    // Fetch data for each group
    const groups = await Promise.all(
      groupIds.map(async (groupId) => {
        const groupDocRef = doc(FIRESTORE_DB, "groups", groupId); // Get group doc
        const groupData = await getDoc(groupDocRef); // Fetch group data
        const docRef = doc(FIRESTORE_DB, "users", groupData.data().ownerUid);
        return {
          groupId: groupId, // Unique key for the list
          groupName: groupData.data().name, // Group name
          leaderId: groupData.data().ownerUid, // Group leader ID
          name: (await getDoc(docRef)).data().name,
          memberCount: groupData.data().members.length,
          type: groupData.data().type,
        };
      })
    );

    setGroupData(groups); // Update state with the fetched data
    setLoading(false); // Stop loading
  };

  useEffect(() => {
    fetchGroupData(); // Fetch group data when the component mounts
  }, []); // Empty dependency array ensures this runs only once

  const getImageSource = (imageSource) => {
    switch (imageSource) {
      case 0:
        return require("../assets/house.jpg");
      case 1:
        return require("../assets/work.jpg");
      case 2:
        return require("../assets/friends.jpg");
      case 3:
        return require("../assets/social.jpg");
      case 4:
        return require("../assets/school.jpg");
      case 5:
      default:
        return require("../assets/other.jpg");
    }
  };
  const CardView = ({
    imageSource,
    groupName,
    ownerName,
    onPress,
    memberCount,
    groupId,
  }) => {
    return (
      <View style={{ borderRadius: 20 }}>
        <TouchableOpacity onPress={onPress} style={styles.card}>
          <LinearGradient
            colors={["rgba(130, 67, 255, 1)", "rgba(221, 50, 52, 1)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              opacity: 1,
              width: Dimensions.get("window").width - 40,
              height: 200,
              borderRadius: 20,
            }}
          >
            <View style={{ flex: 1, flexDirection: "column" }}>
              <Image
                style={{
                  borderRadius: 20,
                  height: 130,
                  width: Dimensions.get("window").width - 40,
                }}
                source={getImageSource(imageSource)}
              ></Image>
              <View
                style={{
                  flex: 1,
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  height: 100,
                }}
              >
                <View
                  style={{ padding: 20, flexDirection: "column", height: 80 }}
                >
                  <Text style={styles.cardTitle}>{groupName}</Text>
                  <Text style={styles.cardSubTitle}>{ownerName}'s group</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: 80,
                  }}
                >
                  <Ionicons name="people-outline" size={24} color={"white"} />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 20,
                      paddingHorizontal: 10,
                    }}
                  >
                    {memberCount}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="rgb(222, 110, 235)" />
      </View>
    );
  } else {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity onPress={() => {}}>
            <View style={styles.groupContainer}>
              <Ionicons name={"people-outline"} size={40} color="white" />
              <Text
                style={{ fontSize: 18, paddingHorizontal: 4, color: "white" }}
              >
                Join Group
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("CreateGroup")}>
            <View style={styles.groupContainer}>
              <Ionicons name={"add"} size={40} color="white" />
              <Text
                style={{ fontSize: 18, paddingHorizontal: 4, color: "white" }}
              >
                Create Group
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <MaxSpacer></MaxSpacer>
        <FlatList
          style={{ paddingHorizontal: 20 }}
          data={groupData} // List data
          keyExtractor={(item) => item.groupId} // Use groupId as unique key
          renderItem={({ item }) => (
            <CardView
              imageSource={item.type}
              groupName={item.groupName}
              ownerName={item.name}
              onPress={() => {}}
              memberCount={item.memberCount}
              groupId={item.groupId}
            />
          )}
        />
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  groupsList: {
    width: Dimensions.get("window").width,
    paddingTop: 10,
    padding: 20,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: "white",
  },
  cardSubTitle: {
    fontSize: 10,
    color: "white",
  },
  recentTransactionsImage: {
    borderRadius: 120,
    width: Dimensions.get("window").width - 40,
    height: 200,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    marginVertical: 8,
    shadowOpacity: 0.12,
    shadowRadius: 0.04,
    elevation: 5,
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
  },
  listItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
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

export default Groups; // Export the component
