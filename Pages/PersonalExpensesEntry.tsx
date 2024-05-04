import React, {
  useLayoutEffect,
  Component,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  Image,
  Button,
  StyleSheet,
  Text,
  View,
  TextInput,
  Keyboard,
  Modal,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as permissions from "react-native-permissions";
import { request, PERMISSIONS } from "react-native-permissions";

import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

import {
  getDoc,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  arrayUnion,
} from "firebase/firestore";
import { Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabBar } from "../TabBar/TabBar";
import SelectDropdown from "react-native-select-dropdown";
import { MaxSpacer, MidSpacer, MinSpacer } from "../Utils/Spacers";
import { TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function PersonalExpensEntry() {
  const [totalPrice, setTotalPrice] = useState("");
  const [selection, setSelection] = useState(1);
  const [resultCode, setResultCode] = useState(false);
  const [note, setNote] = useState("");
  const [categoriesVisibility, changeCategoriesVisibility] = useState(false);
  const [imageUri, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [9, 16],
      quality: 1,
    });

    setResultCode(result.assets[0].fileSize > 0);
    setModalVisible(false);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  const pickCameraImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [9, 16],
      quality: 1,
    });

    setResultCode(result.assets[0].fileSize > 0);
    setModalVisible(false);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  useEffect(() => {
    const status = ImagePicker.requestCameraPermissionsAsync();
  });
  const selectionData = [
    { title: "Utilities" },
    { title: "Food & Groceries" },
    { title: "Healthcare" },
    { title: "Entertainment" },
    { title: "Shopping" },
    { title: "Education" },
    { title: "Transportation" },
    { title: "Personal Care" },
    { title: "Miscellaneous" },
  ];
  const handleAddExpense = async () => {
    if (parseInt(totalPrice) > 0) {
      try {
        let uid = FIREBASE_AUTH.currentUser.uid;
        const docRef = doc(FIRESTORE_DB, "personal", uid);

        const userData = await getDoc(docRef);

        let expensesArray = userData.data()!.expenses || [];

        const newExpense = {
          imageUrl: imageUri,
          type: selection + 1,
          date: new Date().toISOString(),
          timeStamp: Date.now(),
          total: parseInt(totalPrice),
          note: note,
        };
        expensesArray.push(newExpense);
        setDoc(docRef, { expenses: expensesArray });
        navigation.replace("TabBar");
      } catch (error) {
        console.error("Error creating document: ", error);
        console.log("Failed to create document. Please try again.");
      }
    } else {
      Alert.alert("You must enter the spending amount");
    }
  };

  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "rgb(253,60,74)",
      }}
    >
      <View style={styles.priceArea}>
        <Text style={{ color: "rgb(252,252,252)", fontSize: 18 }}>
          {" "}
          How much?
        </Text>
        <View style={{ flex: 1, flexDirection: "row", alignContent: "center" }}>
          <Text style={{ fontSize: 40, color: "white", lineHeight: 80 }}>
            ₺
          </Text>

          <TouchableOpacity onPress={() => Keyboard.dismiss()}>
            <TextInput
              style={{
                color: "white",
                fontSize: 80,
                lineHeight: 80,
                height: 90,
              }}
              placeholder="0"
              placeholderTextColor={"white"}
              value={totalPrice}
              onChangeText={setTotalPrice}
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <MidSpacer></MidSpacer>
        <TextInput
          style={{
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
          placeholder="Note"
          value={note}
          onChangeText={setNote}
          keyboardType="default"
        />

        <SelectDropdown
          defaultValueByIndex={0}
          data={selectionData}
          onSelect={(selectedItem, index) => {
            setSelection(index);
          }}
          renderButton={(selectedItem, isOpened) => {
            return (
              <View style={styles.dropdownButtonStyle}>
                <Text style={styles.dropdownButtonTxtStyle}>
                  {selectedItem && selectedItem.title}
                </Text>
                <Icon
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  style={styles.dropdownButtonArrowStyle}
                />
              </View>
            );
          }}
          renderItem={(item, index, isSelected) => {
            return (
              <View
                style={{
                  ...styles.dropdownItemStyle,
                  ...(isSelected && { backgroundColor: "#f2f2f2" }),
                }}
              >
                <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
          dropdownStyle={styles.dropdownMenuStyle}
        />

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity
              onPress={() => {
                setImage(null);
                setResultCode(false);
              }}
              style={styles.removeIcon}
            >
              <Text style={styles.removeText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        {imageUri ? (
          <View></View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
            }}
          >
            <View style={styles.rectangle}>
              <Icon
                name="attachment"
                style={{ fontSize: 30, paddingRight: 20 }}
              ></Icon>

              <Text style={styles.addImageText}>Add attachment</Text>
            </View>
          </TouchableOpacity>
        )}
        {imageUri ? (
          <View>
            <MaxSpacer></MaxSpacer>
            <MidSpacer></MidSpacer>
            <MidSpacer></MidSpacer>
          </View>
        ) : (
          <View></View>
        )}
        <MinSpacer></MinSpacer>
        <TouchableOpacity onPress={() => handleAddExpense()}>
          <View
            style={{
              height: 65,
              marginTop: 50,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: 10,
              alignSelf: "center",
              justifyContent: "center",
              width: Dimensions.get("window").width - 40,
              alignItems: "center",
              backgroundColor: "rgb(253,60,74)",
            }}
          >
            <Text style={{ color: "white", fontSize: 20 }}>Add Expense</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            >
              <TouchableOpacity
                style={styles.modalCard}
                onPress={() => {
                  pickImage();
                }}
              >
                <View style={styles.modalCard}>
                  <Image
                    source={require("../assets/gallery.png")}
                    style={styles.cameraIcon}
                  ></Image>
                  <Text style={styles.modalOption}>Gallery</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.modalCard}>
                <TouchableOpacity
                  style={styles.modalCard}
                  onPress={() => {
                    pickCameraImage();
                  }}
                >
                  <Image
                    source={require("../assets/camera.png")}
                    style={styles.cameraIcon}
                  ></Image>
                  <Text style={styles.modalOption}>Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <View
                style={{
                  borderRadius: 3,
                  width: 100,
                  marginVertical: 30,
                  marginHorizontal: 20,
                  height: 40,
                  backgroundColor: "red",
                  alignSelf: "flex-end",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 16 }}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalCard: {
    height: 90,
    width: Dimensions.get("window").width / 2.6,
    borderRadius: 20,
    paddingTop: 5,
    alignItems: "center",
    alignContent: "center",
    alignSelf: "center",
    backgroundColor: "white",
  },
  rectangle: {
    flexDirection: "row",
    width: Dimensions.get("window").width - 40,
    height: 65,
    borderRadius: 10,
    backgroundColor: "white",
    alignContent: "center",
    alignItems: "center",
    verticalAlign: "middle",
    alignSelf: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 20,
    marginBottom: 20,
  },
  addImageText: {
    fontSize: 18,
  },
  cameraIcon: {
    width: 24,
    height: 24,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    flexDirection: "column",
    backgroundColor: "rgb(240,240,240)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  modalOption: {
    fontSize: 18,
    paddingVertical: 10,
  },
  imageContainer: {
    marginTop: 20,
    position: "relative",
  },
  image: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 20,
    zIndex: -2,
  },
  removeIcon: {
    backgroundColor: "black",
    borderRadius: 12,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "white",
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
  priceArea: {
    paddingHorizontal: 20,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.2,
    top: Dimensions.get("window").height * 0.05,

    justifyContent: "center",
    flexDirection: "column",
  },
  bottomSheet: {
    padding: 20,
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    height: Dimensions.get("window").height * 0.8,
    width: "100%",
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
});
