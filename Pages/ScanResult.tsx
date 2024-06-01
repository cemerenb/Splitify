import { RouteProp, useNavigation } from "@react-navigation/native";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { ThemeContext } from "../Theme/ThemeContext";
import { err } from "react-native-svg";
import { MaxSpacer } from "../Utils/Spacers";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
type RootStackParamList = {
  ScanResult: { groupId: string; uid: string };
};
type ScanResultRouteProp = RouteProp<RootStackParamList, "ScanResult">;

interface ScanResultProps {
  route: ScanResultRouteProp;
}
const ScanResult: React.FC<ScanResultProps> = ({ route }) => {
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { theme } = useContext(ThemeContext);
  const [userFound, setUserFound] = useState(true);
  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState([]);
  const uid = route.params.uid;
  const groupId = route.params.groupId;
  const getDetails = async () => {
    const docRef = doc(FIRESTORE_DB, "groups", groupId);
    const groupData = await getDoc(docRef);
    setGroupName(groupData.data().name);
    try {
      const nameDocRef = doc(FIRESTORE_DB, "users", uid);
      const name = (await getDoc(nameDocRef)).data().name;
      setName(name);
    } catch (error) {
      console.log(error);

      setUserFound(false);
    }
    setLoading(false);
  };
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  const addUser = async () => {
    setLoading2(true);
    try {
      const personalDocRef = doc(FIRESTORE_DB, "personal", uid);
      await updateDoc(personalDocRef, {
        groups: arrayUnion(groupId),
      });
      console.log("group added to user data");
      const groupDocRef = doc(FIRESTORE_DB, "groups", groupId);
      await updateDoc(groupDocRef, {
        members: arrayUnion(uid),
      });
      console.log("user added to members");
      setLoading2(false);
      //@ts-ignore
      navigation.pop();
      //@ts-ignore
      navigation.replace("Members", { groupId: groupId });
    } catch (error) {
      setErrorMessage("An eror occured");
      setModalVisible(true);
      setLoading2(false);
    }
  };
  useEffect(() => {
    console.log("yes");

    getDetails();
  }, []);
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <ActivityIndicator
          size={"large"}
          color={theme.gradientStart}
        ></ActivityIndicator>
      </View>
    );
  } else {
    return (
      <View
        style={{
          backgroundColor: theme.background,
          justifyContent: "center",
          paddingVertical: Dimensions.get("window").width / 14,
        }}
      >
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
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
                {errorMessage}
              </Text>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
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
        <View style={{ paddingBottom: 20, paddingTop: 20 }}>
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
            <TouchableOpacity
              onPress={() => {
                //@ts-ignore
                navigation.replace("QRScanner", { groupId: groupId });
              }}
              style={{
                width: 90,
                height: 35,
                backgroundColor: theme.button,
                borderRadius: 50,
                marginRight: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: theme.buttonText }}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
        {userFound ? (
          <View
            style={{
              height: Dimensions.get("window").height - 100,
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexDirection: "column",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 24,
                  paddingLeft: 30,
                  fontWeight: "300",
                  color: theme.text,
                }}
              >
                Add new user to
              </Text>
              <Text
                style={{ fontSize: 50, paddingLeft: 30, color: theme.text }}
              >
                {groupName}
              </Text>
              <MaxSpacer></MaxSpacer>
              <MaxSpacer></MaxSpacer>
              <Text
                style={{ fontSize: 20, paddingLeft: 30, color: theme.text }}
              >
                User
              </Text>
              <View
                style={{
                  borderRadius: 20,
                  marginLeft: 20,
                  marginRight: 20,
                  paddingRight: 20,
                  paddingLeft: 20,
                  width: Dimensions.get("window").width - 40,
                  backgroundColor: theme.shadow,
                  paddingVertical: 30,
                }}
              >
                <Text style={{ fontSize: 30, color: theme.text }}>{name}</Text>
                <Text style={{ color: theme.text }}>{uid}</Text>
              </View>
            </View>
            <View
              style={{
                paddingBottom: 40,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingHorizontal: 20,
                width: Dimensions.get("window").width,
              }}
            >
              <TouchableOpacity
                onPress={navigation.goBack}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 60,
                  height: 60,
                  backgroundColor: "rgb(253,60,74)",
                  borderRadius: 100,
                  marginRight: 30,
                }}
              >
                <Ionicons
                  size={35}
                  color={"white"}
                  name="close-outline"
                ></Ionicons>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addUser}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 60,
                  height: 60,
                  backgroundColor: "rgb(0,168,107)",
                  borderRadius: 100,
                }}
              >
                {loading2 ? (
                  <ActivityIndicator
                    size={"small"}
                    color={"white"}
                  ></ActivityIndicator>
                ) : (
                  <Ionicons
                    size={35}
                    color={"white"}
                    name="checkmark-outline"
                  ></Ionicons>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <Text>For group: {groupId}</Text>
            <Text>User Not Found</Text>
          </View>
        )}
      </View>
    );
  }
};

export default ScanResult;
