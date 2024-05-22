// @ts-nocheck

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions,
  ScrollView,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import ImageViewer from "react-native-image-zoom-viewer";
import { CacheManager } from "react-native-expo-image-cache";

import { serializer } from "../metro.config";
import { MinSpacer } from "../Utils/Spacers";
import { RootStackNavigatorParamsList } from "../App";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { LinearGradient } from "expo-linear-gradient";

// Define the MapData interface
interface MapData {
  imageUrl?: string;
  date: string;
  timeStamp: string;
  note: string;
  totalData: number;
  createdBy: string;
  expenseId: string;
  participants: Array;
  type: number;
}

// Define the navigation props types
type RootStackParamList = {
  GroupExpenseDetails: { mapData: MapData; memberNames: Array };
};

type GroupExpenseDetailsRouteProp = RouteProp<
  RootStackParamList,
  "GroupExpenseDetails"
>;

interface GroupExpenseDetailsProps {
  route: GroupExpenseDetailsRouteProp;
}

// GroupExpenseDetails component
const GroupExpenseDetails: React.FC<GroupExpenseDetailsProps> = ({ route }) => {
  const [loading, setLoadingStatus] = useState(true);
  const [index, setIndex] = useState(-1);
  const [groupId, setGroupId] = useState("");
  const { image, setImage } = useState("");
  const [imageExist, setImageExist] = useState(false);
  const [cachedImageUrl, setCachedImageUrl] = useState<string | undefined>(
    undefined
  );
  const [showFullScreenImage, setShowFullScreenImage] = useState(true); // State to manage full-screen image visibility
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();
  const mapData = route.params.mapData;
  const nameMap = route.params.memberNames;

  const reformatDate = (date) => {
    const newDate =
      mapData.date.split("T")[0].split("-").reverse()[0] +
      "/" +
      mapData.date.split("T")[0].split("-").reverse()[1] +
      "/" +
      mapData.date.split("T")[0].split("-").reverse()[2] +
      " " +
      mapData.date.split("T")[1].split(":")[0] +
      ":" +
      mapData.date.split("T")[1].split(":")[1];
    return newDate;
  };
  const deleteElement = async (elementToDelete) => {
    try {
      // Get a reference to the document containing the array
      const docRef = doc(FIRESTORE_DB, "groups", mapData.groupId);

      // Get the current user data
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const groupData = docSnap.data();

        // Filter out the elementToDelete from the expenses array
        const updatedExpenses = groupData.expenses.filter(
          (expense) => expense.timeStamp !== elementToDelete.timeStamp
        );

        // Update the document with the modified expenses array
        await updateDoc(docRef, { expenses: updatedExpenses });

        console.log("Element deleted successfully");
        navigation.pop();
      } else {
        console.log("Document does not exist");
      }
    } catch (error) {
      console.error("Error deleting element:", error);
      // Handle error
      Alert.alert("Error", "Failed to delete element");
    }
  };

  useEffect(() => {
    if (mapData.imageUrl) {
      setImageExist(true);
      CacheManager.get(mapData.imageUrl)
        .getPath()
        .then((cachedPath) => {
          if (cachedPath) {
            console.log("Image loaded from cache:", mapData.imageUrl);
            setCachedImageUrl(cachedPath);
          } else {
            console.log("Image downloaded:", mapData.imageUrl);
          }
        });
    } else {
      setImageExist(false);
    }
  }, [mapData.imageUrl]);

  const toggleFullScreenImage = () => {
    setShowFullScreenImage(!showFullScreenImage);
  };
  if (mapData.imageUrl != null) {
    if (showFullScreenImage) {
      return (
        <View style={styles.container}>
          <View style={styles.upperContainer}>
            <>
              <ImageBackground
                source={{ uri: cachedImageUrl }}
                style={styles.image}
              />
              <View
                style={{
                  width: "50%",
                  alignItems: "flex-start",
                  paddingLeft: 20,
                  marginTop: 70,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}
                  activeOpacity={0.7}
                  style={{
                    marginBottom: 60,
                    marginRight: 20,
                    alignItems: "flex-end",
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      paddingHorizontal: 5,
                      borderRadius: 9,
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "row",
                      backgroundColor: "rgba(100,100,100,1)",
                    }}
                  >
                    <Ionicons
                      name="chevron-back"
                      style={{ fontSize: 30, color: "white" }}
                    ></Ionicons>
                    <Text
                      style={{ paddingRight: 10, fontSize: 16, color: "white" }}
                    >
                      Back
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  width: "50%",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  paddingRight: 0,
                  alignItems: "flex-end",
                  marginBottom: -40,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Delete Expense",
                      "Are you sure you want to delete the expense?",
                      [
                        {
                          text: "Cancel",
                          onPress: () => {},
                        },
                        {
                          text: "Delete",
                          onPress: () => {
                            deleteElement(mapData);
                          },
                          style: "destructive",
                        },
                      ],
                      { cancelable: true }
                    );
                  }}
                  activeOpacity={0.7}
                  style={{
                    marginTop: 70,
                    marginRight: 20,
                    alignItems: "flex-end",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 9,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgb(253,60,74)",
                    }}
                  >
                    <Ionicons
                      name="trash-outline"
                      style={{ fontSize: 26, color: "white" }}
                    ></Ionicons>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleFullScreenImage}
                  activeOpacity={0.7}
                  style={{
                    marginBottom: 60,
                    marginRight: 20,
                    alignItems: "flex-end",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 9,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(100,100,100,1)",
                    }}
                  >
                    <Ionicons
                      name="scan-outline"
                      style={{ fontSize: 30, color: "white" }}
                    ></Ionicons>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          </View>
          <View style={styles.bottomContainer}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <ScrollView style={{ width: "70%", paddingRight: 15 }}>
                <Text style={styles.subTitle}>Details</Text>
                <Text style={styles.text}>{mapData.note}</Text>
                <Text style={styles.subTitle}>Created By</Text>
                <Text style={styles.text}>
                  {nameMap[mapData.createdBy] ?? "Unknown"}
                </Text>
                <Text style={styles.subTitle}>Date</Text>
                <Text style={styles.text}>{reformatDate(mapData.date)}</Text>
                <Text style={styles.subTitle}>Type</Text>
                <Text style={styles.text}>
                  {mapData.type == 1
                    ? "Utilities"
                    : mapData.type == 2
                    ? "Food & Groceries"
                    : mapData.type == 3
                    ? "Healthcare"
                    : mapData.type == 4
                    ? "Entertainment"
                    : mapData.type == 5
                    ? "Shopping"
                    : mapData.type == 6
                    ? "Education"
                    : mapData.type == 7
                    ? "Transportation"
                    : mapData.type == 8
                    ? "Personal Care"
                    : "Miscellaneous"}
                </Text>
                <MinSpacer></MinSpacer>
              </ScrollView>
              <View style={{ width: "35%", alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: Dimensions.get("window").width / 14,
                    color: "white",
                  }}
                >
                  {mapData.total} ₺
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <ImageViewer
          imageUrls={[{ url: cachedImageUrl }]}
          enableSwipeDown={true}
          onSwipeDown={toggleFullScreenImage}
          style={{ width: Dimensions.get("window").width }}
        />
      );
    }
  } else {
    return (
      <View>
        <LinearGradient
          colors={["rgba(221, 50, 52, 1)", "rgba(130, 67, 255, 1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 200,
            paddingLeft: 20,
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <View
              style={{
                height: 40,
                width: 80,
                paddingHorizontal: 5,
                borderRadius: 9,
                marginBottom: -20,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                backgroundColor: "rgba(100,100,100,1)",
              }}
            >
              <Ionicons
                name="chevron-back"
                style={{ fontSize: 30, color: "white" }}
              ></Ionicons>
              <Text style={{ paddingRight: 10, fontSize: 16, color: "white" }}>
                Back
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Delete Expense",
                "Are you sure you want to delete the expense?",
                [
                  {
                    text: "Cancel",
                    onPress: () => {},
                  },
                  {
                    text: "Delete",
                    onPress: () => {
                      deleteElement(mapData);
                    },
                    style: "destructive",
                  },
                ],
                { cancelable: true }
              );
            }}
            activeOpacity={0.7}
            style={{
              marginBottom: -20,
              marginRight: 20,
              alignItems: "flex-end",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 9,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgb(253,60,74)",
              }}
            >
              <Ionicons
                name="trash-outline"
                style={{ fontSize: 26, color: "white" }}
              ></Ionicons>
            </View>
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.fullContainer}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <ScrollView style={{ width: "70%", paddingRight: 15 }}>
              <Text style={styles.subTitle}>Details</Text>
              <Text style={styles.text}>{mapData.note}</Text>
              <Text style={styles.subTitle}>Created By</Text>
              <Text style={styles.text}>
                {" "}
                {nameMap[mapData.createdBy] ?? "Unknown"}
              </Text>
              <Text style={styles.subTitle}>Date</Text>
              <Text style={styles.text}>{reformatDate(mapData.date)}</Text>
              <Text style={styles.subTitle}>Type</Text>
              <Text style={styles.text}>
                {mapData.type == 1
                  ? "Utilities"
                  : mapData.type == 2
                  ? "Food & Groceries"
                  : mapData.type == 3
                  ? "Healthcare"
                  : mapData.type == 4
                  ? "Entertainment"
                  : mapData.type == 5
                  ? "Shopping"
                  : mapData.type == 6
                  ? "Education"
                  : mapData.type == 7
                  ? "Transportation"
                  : mapData.type == 8
                  ? "Personal Care"
                  : "Miscellaneous"}
              </Text>
              <MinSpacer></MinSpacer>
            </ScrollView>
            <View style={{ width: "35%", alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: Dimensions.get("window").width / 14,
                  color: "white",
                }}
              >
                {mapData.total} ₺
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
};

// Styles
const styles = StyleSheet.create({
  upperContainer: {
    flexDirection: "row",
    height: (Dimensions.get("window").height / 6) * 3.5,
  },
  fullContainer: {
    position: "relative",
    flexDirection: "column",
    width: "100%",
    paddingHorizontal: 30,
    paddingTop: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#212529",
    marginTop: -30,
    height: Dimensions.get("window").height,
  },
  bottomContainer: {
    position: "relative",
    flexDirection: "column",
    width: "100%",
    paddingHorizontal: 30,
    paddingTop: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#212529",
    height: (Dimensions.get("window").height / 6) * 2.5,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  subTitle: {
    fontSize: 12,
    marginBottom: 5,
    color: "white",
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: "white",
  },
  image: {
    width: Dimensions.get("window").width,
    marginBottom: -120,
    flex: 1,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    marginTop: 150,
    width: Dimensions.get("window").width,
    height: 200, // Set a placeholder height
    marginBottom: -120,
    backgroundColor: "rgba(100,100,100,0.2)", // Placeholder background color
  },
  fullScreenIconContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    padding: 20,
  },
  fullScreenIcon: {
    fontSize: 30,
    color: "white",
  },
});

export default GroupExpenseDetails;
