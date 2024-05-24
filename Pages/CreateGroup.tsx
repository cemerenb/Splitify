import {
  Firestore,
  addDoc,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import { ThemeContext } from "../Theme/ThemeContext";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [selection, setSelection] = useState(0);
  const [loading, setLoadingStatus] = useState(false);
  const [groups, setGroups] = useState([]);
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState("");
  const selectionData = [
    { title: "Home" },
    { title: "Work" },
    { title: "Friends" },
    { title: "Social Club" },
    { title: "School" },
    { title: "Other" },
  ];
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();
  const generateRandomString = (length = 30) => {
    // Possible characters for the random string
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    // Generate a random string of the specified length
    const randomString = Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * charactersLength))
    ).join("");

    return randomString;
  };
  const getGroupIds = async () => {
    setGroups([]);
    let uid = FIREBASE_AUTH.currentUser.uid;
    const docRef = doc(FIRESTORE_DB, "personal", uid);
    const userData = await getDoc(docRef);

    setGroups((groups) => [...groups, userData.data().groups]);
    console.log(groups);
  };
  const createDocument = async (uid) => {
    console.log(selection);

    let id = generateRandomString();
    const personalDocRef = doc(FIRESTORE_DB, "personal", uid);
    try {
      const docRef = doc(FIRESTORE_DB, "groups", id);
      const data = {
        name: groupName,
        creationDate: new Date().toISOString(),
        timeStamp: Date.now(),
        members: [uid],
        admins: [uid],
        ownerUid: uid,
        expenses: [],
        type: selection,
        processedExpenses: [],
        transactions: [],
        memberNames: [],
      };
      await setDoc(docRef, data);

      console.log(groups);
      updateDoc(personalDocRef, { groups: arrayUnion(id) });
      console.log(groups);

      console.log("Document created successfully!");
      return 1;
    } catch (error) {
      console.error("Error creating document: ", error);
      console.log("Failed to create document. Please try again.");
      return 0;
    }
  };
  return (
    <View style={{ flex: 1 }}>
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
              {modalText}
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
      <View style={styles.textArea}>
        <Text style={{ fontSize: 50, color: "white" }}>Create Group</Text>
      </View>

      <View style={[styles.bottomSheet, { backgroundColor: theme.background }]}>
        <View>
          <TextInput
            style={{
              color: theme.text,
              backgroundColor: theme.primary,
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
            placeholder="Group Name"
            placeholderTextColor={theme.text}
            value={groupName}
            onChangeText={setGroupName}
            keyboardType="default"
          />
          <SelectDropdown
            defaultValueByIndex={0}
            data={selectionData}
            onSelect={(selectedItem, index) => {
              setSelection(index);
              console.log(selection);
            }}
            renderButton={(selectedItem, isOpened) => {
              return (
                <View
                  style={[
                    styles.dropdownButtonStyle,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownButtonTxtStyle,
                      { color: theme.text },
                    ]}
                  >
                    {selectedItem && selectedItem.title}
                  </Text>
                  <Icon
                    name={isOpened ? "chevron-up" : "chevron-down"}
                    style={[
                      styles.dropdownButtonArrowStyle,
                      { color: theme.text },
                    ]}
                  />
                </View>
              );
            }}
            renderItem={(item, index, isSelected) => {
              return (
                <View
                  style={{
                    ...styles.dropdownItemStyle,
                    backgroundColor: theme.primary,
                    ...(isSelected && { backgroundColor: theme.card }),
                  }}
                >
                  <Text
                    style={[styles.dropdownItemTxtStyle, { color: theme.text }]}
                  >
                    {item.title}
                  </Text>
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
            dropdownStyle={styles.dropdownMenuStyle}
          />
        </View>
        <TouchableOpacity
          onPress={async () => {
            if (groupName.length > 0) {
              setLoadingStatus(true);
              let response = await createDocument(
                FIREBASE_AUTH.currentUser.uid
              );
              if (response == 1) {
                navigation.replace("TabBar");
              } else {
                setModalText("An error occured");
                setModalVisible(true);
              }
              setLoadingStatus(false);
            } else {
              setModalText("You have to enter the group name");
              setModalVisible(true);
            }
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
              backgroundColor: "rgb(0,168,107)",
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
                <ActivityIndicator size="small" color={"white"} />
              </View>
            ) : (
              <Text style={{ color: "white", fontSize: 20 }}>Create Group</Text>
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
    backgroundColor: "rgb(0,168,107)",
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
