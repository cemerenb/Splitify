import React, { useLayoutEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Switch,
  LayoutAnimation,
  ViewStyle,
} from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import { MaxSpacer } from "../Utils/Spacers";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import SwitchSelector from "react-native-switch-selector";
import { Button } from "react-native-paper";
import SelectDropdown from "react-native-select-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

export default function SeeAll() {
  const [selection, setSelection] = useState(0);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [expensesArray, setArray] = useState([]);
  const [loading, setLoadingStatus] = useState(true);
  const [visible, setVisibility] = useState(false);
  const [dateFirst, setDateFirst] = useState(new Date());
  const [dateLast, setDateLast] = useState(new Date());
  const [expanded, setExpanded] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [rangeSelection, setRangeSelection] = useState(false);
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  const selectionData = [
    { title: "All" },
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
  const animationStyle = expanded
    ? ({ maxHeight: 200 } as ViewStyle)
    : ({ maxHeight: 0 } as ViewStyle);

  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  const CardView = ({
    imageSource,
    title,
    description,
    onPress,
    price,
    date,
  }) => {
    imageSource = parseInt(imageSource);
    const day = date.split("T")[0].split("-")[2];
    const month = date.split("T")[0].split("-")[1];
    const year = date.split("T")[0].split("-")[0];
    return (
      <TouchableOpacity onPress={onPress} style={styles.card}>
        <View
          style={{
            flex: 2,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View>
            {imageSource == 1 ? (
              <Image
                style={styles.recentTransactionsImage}
                source={require("../assets/bill.png")}
              />
            ) : imageSource == 2 ? (
              <Image
                style={styles.recentTransactionsImage}
                source={require("../assets/food.png")}
              />
            ) : imageSource == 3 ? (
              <Image
                style={styles.recentTransactionsImage}
                source={require("../assets/healthcare.png")}
              />
            ) : imageSource == 4 ? (
              <Image
                style={styles.recentTransactionsImage}
                source={require("../assets/entertainment.png")}
              />
            ) : imageSource == 5 ? (
              <Image
                style={styles.recentTransactionsImage}
                source={require("../assets/shop.png")}
              />
            ) : imageSource == 6 ? (
              <Image
                style={styles.recentTransactionsImage}
                source={require("../assets/book.png")}
              />
            ) : imageSource == 7 ? (
              <Image
                style={styles.recentTransactionsImage}
                source={require("../assets/transportation.png")}
              />
            ) : imageSource == 8 ? (
              <Image
                style={styles.recentTransactionsImage}
                source={require("../assets/personalcare.png")}
              />
            ) : (
              <Image
                style={styles.recentTransactionsImage}
                source={require("../assets/miscellaneous.png")}
              />
            )}
          </View>
        </View>
        <View
          style={{
            flex: 5,
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingHorizontal: 20,
          }}
        >
          <Text style={styles.cardTitle}>
            {imageSource == 1
              ? "Utilities"
              : imageSource == 2
              ? "Food & Groceries"
              : imageSource == 3
              ? "Healthcare"
              : imageSource == 4
              ? "Entertainment"
              : imageSource == 5
              ? "Shopping"
              : imageSource == 6
              ? "Education"
              : imageSource == 7
              ? "Transportation"
              : imageSource == 8
              ? "Personal Care"
              : "Miscellaneous"}
          </Text>
          {description.length > 40 ? (
            <Text style={styles.cardDescription}>
              {description.slice(0, 40)}...
            </Text>
          ) : (
            <Text style={styles.cardDescription}>{description}</Text>
          )}
          <Text style={styles.cardDate}>{day + "/" + month + "/" + year}</Text>
        </View>
        <View
          style={{
            alignItems: "flex-end",
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingHorizontal: 20,
          }}
        >
          <Text style={styles.cardPrice}>{price}₺</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getTotalExpenses = async () => {
    setTotal(0);
    let uid = FIREBASE_AUTH.currentUser.uid;
    const docRef = doc(FIRESTORE_DB, "personal", uid);
    const userData = await getDoc(docRef);

    setArray(userData.data()?.expenses ?? []);
    setDateFirst(
      new Date(
        userData.data()?.expenses[userData.data().expenses.length - 1].timeStamp
      )
    );
    setDateLast(new Date());

    setLoadingStatus(false);
  };

  useLayoutEffect(() => {
    if (count === 0) {
      getTotalExpenses();
      setCount(1);
    }
  }, []);

  const options = [
    { label: "Date", value: false },
    { label: "Range", value: true },
  ];
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="rgb(222, 110, 235)" />
      </View>
    );
  } else {
    return (
      <SafeAreaView>
        <View style={{ paddingBottom: 0 }}>
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
              <Ionicons name="chevron-back-outline" size={30}></Ionicons>
              <Text style={{ fontSize: 18 }}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                toggleExpand();
              }}
              style={{
                alignItems: "center",
                paddingHorizontal: 10,
                paddingTop: 10,
              }}
            >
              <Ionicons name="filter-circle-outline" size={35}></Ionicons>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingBottom: 20 }}>
          <View style={[styles.datePickersContainer, animationStyle]}>
            <LinearGradient
              colors={["#f1f1f1", "rgba(50, 50, 50, 0.05)"]}
              start={{ x: 0, y: 0.15 }}
              end={{ x: 0, y: 1.9 }}
              style={{
                borderBottomLeftRadius: 30,
                borderBottomRightRadius: 30,
                width: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  paddingTop: 20,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <RNDateTimePicker
                    mode="date"
                    value={dateFirst}
                    onChange={(event, selectedDate) => {
                      // Ensure that selectedDate is not older than dateLast
                      if (selectedDate.getTime() > dateLast.getTime()) {
                        setDateLast(selectedDate);
                      }
                      setDateFirst(selectedDate || dateFirst);
                    }}
                  />
                  {rangeSelection && <Text style={{ paddingLeft: 10 }}>-</Text>}
                  {rangeSelection && (
                    <RNDateTimePicker
                      mode="date"
                      value={dateLast}
                      onChange={(event, selectedDate) => {
                        // Ensure that selectedDate is not older than dateFirst
                        if (selectedDate.getTime() < dateFirst.getTime()) {
                          setDateFirst(selectedDate);
                        }
                        setDateLast(selectedDate || dateLast);
                      }}
                    />
                  )}
                </View>
                <View
                  style={{
                    width: "29%",
                    paddingRight: 10,
                    paddingLeft: 10,
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <SwitchSelector
                    options={options}
                    initial={0}
                    buttonColor={"rgb(222, 110, 235)"}
                    onPress={(value) => {
                      setRangeSelection(value);
                    }}
                  />
                </View>
              </View>
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
                      <Text style={styles.dropdownItemTxtStyle}>
                        {item.title}
                      </Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Button
                  onPress={() => {
                    setFilterActive(false);
                    toggleExpand();
                  }}
                >
                  Clear
                </Button>
                <Button
                  onPress={() => {
                    setFilterActive(true);
                    toggleExpand();
                  }}
                >
                  Filter
                </Button>
              </View>
            </LinearGradient>
          </View>
        </View>
        <ScrollView>
          <FlatList
            scrollEnabled={false}
            style={{ width: "100%", paddingHorizontal: 20 }}
            data={expensesArray.filter((item) => {
              // Check if filterActive is true and apply date filtering logic
              if (filterActive) {
                if (rangeSelection) {
                  // If range selection is true, filter by date range
                  const itemDate = new Date(item.date);
                  return (
                    itemDate.getTime() >= dateFirst.getTime() &&
                    itemDate.getTime() <= dateLast.getTime()
                  );
                } else {
                  // If range selection is false, filter by selected date
                  const itemDate = new Date(item.date);
                  const firstDate = new Date(dateFirst);
                  return (
                    itemDate.getDate() === firstDate.getDate() &&
                    itemDate.getMonth() === firstDate.getMonth() &&
                    itemDate.getFullYear() === firstDate.getFullYear()
                  );
                }
              } else {
                // If filterActive is false, apply filtering based on category selection
                return selection === 0 || item.type === selection;
              }
            })}
            renderItem={({ item, index }) => (
              <View>
                <View style={{ height: 12 }} />
                <CardView
                  imageSource={item.type}
                  title={item.note}
                  description={item.note}
                  onPress={() => {
                    navigation.navigate("ExpenseEntry", item);
                  }}
                  price={item.total}
                  date={item.date}
                />
              </View>
            )}
          />

          <MaxSpacer />
          <MaxSpacer />
          <MaxSpacer />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
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
    height: 45,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "grey",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 15,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 0.04,
    elevation: 5,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    width: Dimensions.get("window").width * 0.5,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 1,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: "300",
    marginBottom: 1,
  },
  cardDescription: {
    marginVertical: 4,
    fontSize: 14,
    lineHeight: 15,
  },
  cardDate: {
    fontSize: 10,
  },
  recentTransactionsImage: {
    height: 40,
    width: 40,
  },
  datePickersContainer: {
    width: "100%",
    overflow: "hidden",
    flexDirection: "column",
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
});
