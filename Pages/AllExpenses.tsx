import React, { useContext, useLayoutEffect, useState } from "react";
import {
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
  ScrollView,
  TouchableOpacity,
  Button,
  Platform,
  NativeModules,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import { MaxSpacer } from "../Utils/Spacers";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import SwitchSelector from "react-native-switch-selector";
import SelectDropdown from "react-native-select-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../Theme/ThemeContext";
import i18n from "../Language/i18n";
const { StatusBarManager } = NativeModules;

export default function SeeAll() {
  const [selection, setSelection] = useState(0);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [expensesArray, setArray] = useState([]);
  const [loading, setLoadingStatus] = useState(true);
  const [visible, setVisibility] = useState(false);
  const [visible2, setVisibility2] = useState(false);

  const [dateFirst, setDateFirst] = useState(new Date());
  const [dateLast, setDateLast] = useState(new Date());
  const [expanded, setExpanded] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [rangeSelection, setRangeSelection] = useState(0);
  const { theme } = useContext(ThemeContext);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpanded(!expanded);
  };
  const selectionData = [
    { title: i18n.all },
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
      <TouchableOpacity
        onPress={onPress}
        style={[styles.card, { backgroundColor: theme.seeAll }]}
      >
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
              <Ionicons
                name="receipt-outline"
                style={{ color: theme.text, fontSize: 40 }}
              ></Ionicons>
            ) : imageSource == 2 ? (
              <Ionicons
                name="fast-food-outline"
                style={{ color: theme.text, fontSize: 40 }}
              ></Ionicons>
            ) : imageSource == 3 ? (
              <Ionicons
                name="medical-outline"
                style={{ color: theme.text, fontSize: 40 }}
              ></Ionicons>
            ) : imageSource == 4 ? (
              <Ionicons
                name="balloon-outline"
                style={{ color: theme.text, fontSize: 40 }}
              ></Ionicons>
            ) : imageSource == 5 ? (
              <Ionicons
                name="bag-handle-outline"
                style={{ color: theme.text, fontSize: 40 }}
              ></Ionicons>
            ) : imageSource == 6 ? (
              <Ionicons
                name="book-outline"
                style={{ color: theme.text, fontSize: 40 }}
              ></Ionicons>
            ) : imageSource == 7 ? (
              <Ionicons
                name="train-outline"
                style={{ color: theme.text, fontSize: 40 }}
              ></Ionicons>
            ) : imageSource == 8 ? (
              <Ionicons
                name="man-outline"
                style={{ color: theme.text, fontSize: 40 }}
              ></Ionicons>
            ) : (
              <Ionicons
                name="cash-outline"
                style={{ color: theme.text, fontSize: 40 }}
              ></Ionicons>
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
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {imageSource == 1
              ? i18n.utilites
              : imageSource == 2
              ? i18n.foodgroceries
              : imageSource == 3
              ? i18n.healthcare
              : imageSource == 4
              ? i18n.entertainment
              : imageSource == 5
              ? i18n.shopping
              : imageSource == 6
              ? i18n.education
              : imageSource == 7
              ? i18n.transportations
              : imageSource == 8
              ? i18n.personalcare
              : i18n.miscellaneous}
          </Text>
          {description.length > 40 ? (
            <Text style={[styles.cardDescription, { color: theme.text }]}>
              {description.slice(0, 40)}...
            </Text>
          ) : (
            <Text style={[styles.cardDescription, { color: theme.text }]}>
              {description}
            </Text>
          )}
          <Text style={[styles.cardDate, { color: theme.text }]}>
            {day + "/" + month + "/" + year}
          </Text>
        </View>
        <View
          style={{
            alignItems: "flex-end",
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingHorizontal: 20,
          }}
        >
          <Text style={[styles.cardPrice, { color: theme.text }]}>
            {price}₺
          </Text>
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
    { label: i18n.date, value: 0 },
    { label: i18n.range, value: 1 },
    { label: i18n.none, value: 2 },
  ];
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.gradientStart} />
      </View>
    );
  } else {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: Dimensions.get("window").width / 12,
          backgroundColor: theme.background,
        }}
      >
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
              <Ionicons
                name="chevron-back-outline"
                size={30}
                color={theme.text}
              ></Ionicons>
              <Text style={{ fontSize: 18, color: theme.text }}>
                {i18n.back}
              </Text>
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
              <Ionicons
                name="filter-circle-outline"
                size={35}
                color={theme.text}
              ></Ionicons>
            </TouchableOpacity>
          </View>
        </View>
        {expanded ? (
          <View
            style={{
              paddingTop: 30,
              backgroundColor: theme.filter,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                borderWidth: 1,
                borderRadius: 20,
                width: "75%",

                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <SwitchSelector
                options={options}
                initial={0}
                buttonColor={theme.button}
                onPress={(value) => {
                  setRangeSelection(value);
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                width: "100%",
                paddingTop: 20,
              }}
            >
              {rangeSelection == 2 ? (
                <View></View>
              ) : rangeSelection != 2 && Platform.OS == "android" ? (
                <View
                  style={{
                    width: "125%",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#B8B8B9",
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 20,
                    }}
                    onPress={() => {
                      setVisibility(true);
                      console.log(visible);
                    }}
                  >
                    <Text style={{ color: theme.text, fontSize: 16 }}>
                      {dateFirst.toDateString().split(" ")[2]}{" "}
                      {dateFirst.toDateString().split(" ")[1]}{" "}
                      {dateFirst.toDateString().split(" ")[3]}
                    </Text>
                  </TouchableOpacity>
                  {visible && (
                    <RNDateTimePicker
                      textColor={theme.text}
                      mode="date"
                      value={dateFirst}
                      onChange={(event, selectedDate) => {
                        // Ensure that selectedDate is not older than dateLast
                        if (rangeSelection == 0) {
                          setDateFirst(selectedDate || dateFirst);
                          setVisibility(false);
                          console.log("-------------------");
                          console.log("1");

                          console.log(visible);
                        }
                        if (
                          selectedDate.getTime() > dateLast.getTime() &&
                          rangeSelection == 1
                        ) {
                          setDateLast(selectedDate);
                          setDateFirst(selectedDate);
                        }
                        setDateFirst(selectedDate || dateFirst);
                        setVisibility(false);
                        console.log("-------------------");
                        console.log("1");

                        console.log(visible);
                      }}
                    />
                  )}

                  {rangeSelection == 1 && (
                    <Text style={{ paddingLeft: 10, color: theme.text }}>
                      -
                    </Text>
                  )}
                  {rangeSelection == 1 && (
                    <View>
                      <TouchableOpacity
                        onPress={() => {
                          setVisibility2(true);
                          console.log(visible2);
                        }}
                        style={{
                          backgroundColor: "#B8B8B9",
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          borderRadius: 20,
                        }}
                      >
                        <Text style={{ color: theme.text, fontSize: 16 }}>
                          {dateLast.toDateString().split(" ")[2]}{" "}
                          {dateLast.toDateString().split(" ")[1]}{" "}
                          {dateLast.toDateString().split(" ")[3]}
                        </Text>
                      </TouchableOpacity>
                      {visible2 && (
                        <RNDateTimePicker
                          mode="date"
                          value={dateLast}
                          onTouchEnd={() => {
                            setVisibility2(false);
                            console.log(visible2);
                          }}
                          onResponderTerminate={() => {
                            setVisibility2(false);
                            console.log(visible2);
                          }}
                          onPointerCancel={() => {
                            setVisibility2(false);
                            console.log(visible2);
                          }}
                          onTouchCancel={() => {
                            setVisibility2(false);
                            console.log(visible2);
                          }}
                          onChange={(event, selectedDate) => {
                            // Ensure that selectedDate is not older than dateFirst
                            if (selectedDate.getTime() < dateFirst.getTime()) {
                              setDateFirst(selectedDate);
                              setDateLast(selectedDate);
                            }
                            setDateLast(selectedDate || dateLast);
                            setVisibility2(false);
                            console.log("2");

                            console.log("-------------------");

                            console.log(visible2);
                          }}
                        />
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View
                  style={{
                    width: "90%",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                  }}
                >
                  <RNDateTimePicker
                    textColor={theme.text}
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
                  {rangeSelection == 1 && (
                    <Text style={{ paddingLeft: 10, color: theme.text }}>
                      -
                    </Text>
                  )}
                  {rangeSelection == 1 && (
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
              )}
            </View>
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
                      { borderColor: theme.text },
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
                      backgroundColor: theme.background,
                      ...(isSelected && { backgroundColor: theme.button }),
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemTxtStyle,
                        { color: isSelected ? theme.buttonText : theme.text },
                      ]}
                    >
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
                width: "100%",
                justifyContent: "flex-end",
                marginBottom: 10,
                paddingRight: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: theme.shadow,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 5,
                  borderRadius: 20,
                  width: 70,
                  height: 30,
                  marginRight: 10,
                }}
                onPress={() => {
                  setFilterActive(false);
                  setSelection(0);
                  toggleExpand();
                }}
              >
                <Text
                  style={{
                    color: theme.buttonText,
                    fontSize: Dimensions.get("window").width / 30,
                  }}
                >
                  {i18n.clear}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: theme.button,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 5,
                  borderRadius: 20,
                  width: 70,
                }}
                onPress={() => {
                  setFilterActive(true);
                  console.log(dateFirst);
                  console.log(dateLast);
                  console.log(rangeSelection);
                  console.log(selection);

                  toggleExpand();
                }}
              >
                <Text
                  style={{
                    color: theme.buttonText,
                    fontSize: Dimensions.get("window").width / 30,
                  }}
                >
                  {i18n.filter}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View></View>
        )}
        <ScrollView>
          <FlatList
            scrollEnabled={false}
            style={{ width: "100%", paddingHorizontal: 20 }}
            data={expensesArray.filter((item) => {
              const itemDate = new Date(item.date);
              const firstDate = new Date(dateFirst);
              const lastDate = new Date(dateLast);

              if (filterActive && rangeSelection === 0) {
                // Single Date Filtering
                if (selection === 0) {
                  return (
                    itemDate.getDate() === firstDate.getDate() &&
                    itemDate.getMonth() === firstDate.getMonth() &&
                    itemDate.getFullYear() === firstDate.getFullYear()
                  );
                }
                if (selection !== 0) {
                  return (
                    itemDate.getDate() === firstDate.getDate() &&
                    itemDate.getMonth() === firstDate.getMonth() &&
                    itemDate.getFullYear() === firstDate.getFullYear() &&
                    item.type === selection
                  );
                }
              } else if (filterActive && rangeSelection === 1) {
                // Date Range Filtering
                if (selection === 0) {
                  return itemDate >= firstDate && itemDate <= lastDate;
                } else {
                  return (
                    itemDate >= firstDate &&
                    itemDate <= lastDate &&
                    item.type === selection
                  );
                }
              } else if (filterActive && rangeSelection === 2) {
                // Category Filtering
                if (selection === 0) {
                  return true;
                } else {
                  return item.type === selection;
                }
              } else {
                // No Filter Applied
                return true;
              }
            })}
            keyExtractor={(item) => item.timeStamp}
            renderItem={({ item, index }) => (
              <View>
                <View style={{ height: 12 }} />
                <CardView
                  imageSource={item.type}
                  title={item.note}
                  description={item.note}
                  onPress={() => {
                    navigation.navigate("ExpenseDetails", item);
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
      </View>
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
    justifyContent: "center",
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
