import React, {
  useLayoutEffect,
  Component,
  useRef,
  useState,
  useEffect,
  useContext,
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
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import {
  getDoc,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  arrayUnion,
} from "firebase/firestore";
import { Dimensions } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { MaxSpacer, MidSpacer, MinSpacer } from "../Utils/Spacers";
import { TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "../Theme/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import i18n from "../Language/i18n";

export default function PersonalExpensEntry() {
  const [totalPrice, setTotalPrice] = useState("");
  const [selection, setSelection] = useState(0);
  const [loading, setLoadingStatus] = useState(false);
  const [resultCode, setResultCode] = useState(false);
  const [note, setNote] = useState("");
  const [categoriesVisibility, changeCategoriesVisibility] = useState(false);
  const [imageUri, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalText, setModalText] = useState("");

  const uploadImageToFirebase = async (imageUri) => {
    console.log("girdi");

    const storage = getStorage();
    const storageRef = ref(
      storage,
      `expenseImages/${FIREBASE_AUTH.currentUser.uid}-${Date.now()}.jpg`
    ); // Unique file name

    // Fetch the image data as a Blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload the Blob to Firebase Storage
    await uploadBytes(storageRef, blob);

    // Get the download URL for the uploaded file
    const downloadUrl = await getDownloadURL(storageRef);

    return downloadUrl;
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [9, 16],
      quality: 0.3,
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
      quality: 0.3,
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
    { title: i18n.utilites },
    { title: i18n.foodgroceries },
    { title: i18n.healthcare },
    { title: i18n.entertainment },
    { title: i18n.shopping },
    { title: i18n.education },
    { title: i18n.transportations },
    { title: i18n.personalcare },
    { title: i18n.miscellaneous },
  ];
  const handleAddExpense = async () => {
    if (parseInt(totalPrice) > 0) {
      try {
        setLoadingStatus(true);

        let uid = FIREBASE_AUTH.currentUser.uid;
        const docRef = doc(FIRESTORE_DB, "personal", uid);

        let imageUrl = null;

        if (imageUri) {
          // Resize the image to control the file size
          // Upload the resized image and get the URL
          imageUrl = await uploadImageToFirebase(imageUri);
        }

        const newExpense = {
          imageUrl: imageUrl,
          type: selection + 1,
          date: new Date().toISOString(),
          timeStamp: Date.now(),
          total: parseInt(totalPrice),
          note: note,
        };

        await updateDoc(docRef, {
          expenses: arrayUnion(newExpense),
        });

        navigation.replace("TabBar");
      } catch (error) {
        console.error("Error creating document: ", error);
        setModalText(i18n.failedtocredoc);
        setModalVisible2(true);
      } finally {
        setLoadingStatus(false);
      }
    } else {
      setModalText(i18n.youmustentspeamo);
      setModalVisible2(true);
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
                <Text style={{ color: theme.text, fontSize: 18 }}>
                  {i18n.close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.priceArea}>
        <Text
          style={{
            color: "rgb(252,252,252)",
            fontSize: Dimensions.get("window").width / 20,
          }}
        >
          {" "}
          {i18n.howmuch}
        </Text>
        <View style={{ flex: 1, flexDirection: "row", alignContent: "center" }}>
          <Text
            style={{
              fontSize: Dimensions.get("window").width / 10,
              color: "white",
              lineHeight: Dimensions.get("window").width / 5,
            }}
          >
            ₺
          </Text>

          <TouchableOpacity onPress={() => Keyboard.dismiss()}>
            <TextInput
              style={{
                color: "white",
                fontSize: Dimensions.get("window").width / 5.5,
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

      <ScrollView
        style={[styles.bottomSheet, { backgroundColor: theme.background }]}
      >
        <MidSpacer></MidSpacer>
        <TextInput
          style={{
            fontSize: Dimensions.get("window").width / 25,
            justifyContent: "center",
            color: theme.text,
            backgroundColor: theme.primary,
            lineHeight: 20,
            height: Dimensions.get("window").height / 15,
            width: Dimensions.get("window").width - 40,
            borderRadius: 10,
            borderColor: "gray",
            borderWidth: 1,
            padding: 15,
          }}
          maxLength={300}
          multiline={false}
          placeholderTextColor={theme.text}
          placeholder={i18n.note}
          value={note}
          onChangeText={setNote}
          keyboardType="default"
        />
        <Text
          style={{
            textAlign: "right",
            marginTop: 2,
            marginBottom: 15,
            color: theme.text,
            fontSize: Dimensions.get("window").width / 37,
          }}
        >
          {note.length}/300
        </Text>

        <SelectDropdown
          defaultValueByIndex={0}
          data={selectionData}
          onSelect={(selectedItem, index) => {
            setSelection(index);
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
                  style={[styles.dropdownButtonTxtStyle, { color: theme.text }]}
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
          showsVerticalScrollIndicator={true}
          dropdownStyle={{
            backgroundColor: "transparent",
            paddingBottom: 40,
            marginBottom: 40,
            borderRadius: 10,
          }}
        />

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity
              onPress={() => {
                setImage(null);
                setResultCode(false);
              }}
              style={[
                styles.removeIcon,
                {
                  backgroundColor: theme.text,
                  borderWidth: 1,
                  borderColor: theme.reverse,
                },
              ]}
            >
              <Ionicons name="close" color={theme.reverse} size={20}></Ionicons>
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
            <View
              style={[
                styles.rectangle,
                { backgroundColor: theme.primary, borderColor: theme.text },
              ]}
            >
              <Icon
                name="attachment"
                style={{
                  fontSize: Dimensions.get("window").width / 20,
                  paddingRight: 10,
                  color: theme.text,
                }}
              ></Icon>

              <Text
                style={[
                  styles.addImageText,
                  {
                    color: theme.text,
                    fontSize: Dimensions.get("window").width / 25,
                  },
                ]}
              >
                {i18n.addimage}
              </Text>
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
        <TouchableOpacity
          onPress={async () => {
            setLoadingStatus(true);
            await handleAddExpense();
            setLoadingStatus(false);
          }}
        >
          <View
            style={{
              height: Dimensions.get("window").height / 15,
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
              <Text
                style={{
                  color: "white",
                  fontSize: Dimensions.get("window").width / 24,
                }}
              >
                {i18n.addexpense}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.shadow }]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            >
              <TouchableOpacity
                style={[styles.modalCard, { backgroundColor: theme.card }]}
                onPress={() => {
                  pickImage();
                }}
              >
                <View
                  style={[styles.modalCard, { backgroundColor: theme.card }]}
                >
                  <Ionicons
                    name="images-outline"
                    color={theme.text}
                    size={35}
                  ></Ionicons>
                  <Text style={[styles.modalOption, { color: theme.text }]}>
                    {i18n.gallery}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
                <TouchableOpacity
                  style={[styles.modalCard, { backgroundColor: theme.card }]}
                  onPress={() => {
                    pickCameraImage();
                  }}
                >
                  <Ionicons
                    name="camera-outline"
                    color={theme.text}
                    size={35}
                  ></Ionicons>
                  <Text style={[styles.modalOption, { color: theme.text }]}>
                    {i18n.camera}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <View
                style={{
                  borderRadius: 5,
                  width: 100,
                  marginVertical: 30,
                  marginHorizontal: 20,
                  height: 40,
                  backgroundColor: theme.text,
                  alignSelf: "flex-end",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.reverse, fontSize: 16 }}>
                  {i18n.cancel}
                </Text>
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
    height: Dimensions.get("window").height / 15,
    borderRadius: 10,
    backgroundColor: "white",
    alignContent: "center",
    alignItems: "center",
    verticalAlign: "middle",
    alignSelf: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: Dimensions.get("window").height / 50,
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
    marginTop: Dimensions.get("window").height / 50,
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
    fontSize: Dimensions.get("window").width / 25,
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
    fontSize: Dimensions.get("window").width / 25,
    fontWeight: "500",
    color: "#151E26",
  },
  dropdownButtonStyle: {
    width: Dimensions.get("window").width - 40,
    height: Dimensions.get("window").height / 15,
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
    height: Dimensions.get("window").height * 0.24,
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
