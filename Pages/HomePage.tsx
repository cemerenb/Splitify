import React, {
  useLayoutEffect,
  Component,
  useRef,
  useState,
  useEffect,
  useContext,
} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  ActivityIndicator,
  Image,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Appearance,
  useColorScheme,
  Button,
  Platform,
} from "react-native";

import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { getDoc, doc, setDoc } from "firebase/firestore";
import SelectDropdown from "react-native-select-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LineChart, Grid } from "react-native-svg-charts";
import { Shadow, Gradient } from "../ChartAdds";
import * as shape from "d3-shape";
import { MaxSpacer, MidSpacer } from "../Utils/Spacers";
import { useNavigation, useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import { ThemeContext } from "../Theme/ThemeContext";
import i18n from "../Language/i18n";

export default function Home() {
  const [count, setCount] = useState(0);
  const [recentCount, setRecentCount] = useState(0);
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState(0);
  const [selection, setSelection] = useState(1);
  const [stampDiff, setStampDiff] = useState(0);
  const [expensesArray, setArray] = useState([]);
  const [lastSixMonthArray, setLastSixMonthArray] = useState([]);
  const [lastMonthArray, setLastMonthArray] = useState([]);
  const [lastWeekArray, setLastWeekArray] = useState([]);
  const [loading, setLoadingStatus] = useState(true);
  const [recentList, setRecentList] = useState([]);
  const data2 = [80, 10, 95, 48, 24, 67, 51, 12, 33, 0, 24, 20, 50];
  const { theme } = useContext(ThemeContext);

  const items = {
    date: null,
    imageUrl: "",
    timeStamp: null,
    note: "",
    total: 0,
  };
  const selectionData = [
    { title: i18n.lastweek },
    { title: i18n.lastmonth },
    { title: i18n.last6months },
  ];

  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();
  const getTotalExpenses = async () => {
    setTotal(0);
    let uid = FIREBASE_AUTH.currentUser.uid;
    const docRef = doc(FIRESTORE_DB, "personal", uid);
    const userData = await getDoc(docRef);

    setArray(userData.data()?.expenses ?? []);
    setLoadingStatus(false);
    console.log(expensesArray);
  };

  const calculateTotal = () => {
    let subTotal = 0;
    let newStampDiff = 0; // Initialize a variable to hold the new value for stampDiff

    if (selection === 0) {
      newStampDiff = 604800000; // One week in milliseconds
    } else if (selection === 1) {
      newStampDiff = 2629743000; // One month in milliseconds
    } else if (selection === 2) {
      newStampDiff = 31556926000; // One year in milliseconds
    }

    setStampDiff(newStampDiff); // Update stampDiff state with the new value

    for (let index = 0; index < expensesArray.length; index++) {
      const element = expensesArray[index];
      if (Date.now() - element.timeStamp < newStampDiff) {
        subTotal = subTotal + element.total;
      }
    }
    const sortedData = expensesArray.sort((a, b) => a.timeStamp - b.timeStamp);
    setArray(expensesArray.reverse());

    setTotal(subTotal); // Set the total after calculating based on the updated stampDiff
  };

  const calculateLastSevenDaysData = (expensesArray) => {
    const now = Date.now();
    const parts = Array.from({ length: 7 }, (_, i) => i);

    const partTotals = parts.map((part) => {
      const partStart = now - (part + 1) * 86400000;
      const partEnd = now - part * 86400000;

      return expensesArray.reduce((total, expense) => {
        if (expense.timeStamp >= partStart && expense.timeStamp < partEnd) {
          return total + expense.total;
        }
        return total;
      }, 0);
    });

    setLastWeekArray(partTotals.reverse());
  };

  const calculateLastMonthData = (expensesArray) => {
    const now = Date.now();
    const daysInPart = 5; // Number of days in each part
    const parts = Array.from({ length: 6 }, (_, i) => i);

    const partTotals = parts.map((part) => {
      const partStart = now - (part + 1) * daysInPart * 86400000;
      const partEnd = now - part * daysInPart * 86400000;

      return expensesArray.reduce((total, expense) => {
        if (expense.timeStamp >= partStart && expense.timeStamp < partEnd) {
          return total + expense.total;
        }
        return total;
      }, 0);
    });

    setLastMonthArray(partTotals.reverse());
  };

  const calculateSixMonthData = (expensesArray) => {
    const now = Date.now();
    const months = Array.from({ length: 6 }, (_, i) => i);

    const monthlyTotals = months.map((month) => {
      const monthStart = now - (month + 1) * 2629743000;
      const monthEnd = now - month * 2629743000;

      return expensesArray.reduce((total, expense) => {
        if (expense.timeStamp >= monthStart && expense.timeStamp < monthEnd) {
          return total + expense.total;
        }
        return total;
      }, 0);
    });

    setLastSixMonthArray(monthlyTotals.reverse());
  };

  const generateRecentList = async () => {
    setRecentList([]);

    let lenght = expensesArray.length < 5 ? expensesArray.length : 4;

    for (let index = 0; index < lenght; index++) {
      const element = expensesArray[index];
      setRecentList((recentList) => [...recentList, element]);
    }
  };

  useEffect(() => {
    calculateTotal();
  }, [selection, expensesArray]);

  useEffect(() => {
    calculateSixMonthData(expensesArray);
  }, [expensesArray]);
  useEffect(() => {
    calculateLastMonthData(expensesArray);
  }, [expensesArray]);
  useEffect(() => {
    calculateLastSevenDaysData(expensesArray);
  }, [expensesArray]);

  useEffect(() => {
    generateRecentList();
  }, [expensesArray]);

  useLayoutEffect(() => {
    if (count == 0) {
      getTotalExpenses();

      setCount(1);
    }
  }, []);

  const CardView = ({ imageSource, description, onPress, price, date }) => {
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
            flex: 3,
            paddingLeft: 10,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View>
            {imageSource == 1 ? (
              <Ionicons
                name="receipt-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").height / 22,
                }}
              ></Ionicons>
            ) : imageSource == 2 ? (
              <Ionicons
                name="fast-food-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").height / 22,
                }}
              ></Ionicons>
            ) : imageSource == 3 ? (
              <Ionicons
                name="medical-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").height / 22,
                }}
              ></Ionicons>
            ) : imageSource == 4 ? (
              <Ionicons
                name="balloon-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").height / 22,
                }}
              ></Ionicons>
            ) : imageSource == 5 ? (
              <Ionicons
                name="bag-handle-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").height / 22,
                }}
              ></Ionicons>
            ) : imageSource == 6 ? (
              <Ionicons
                name="book-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").height / 22,
                }}
              ></Ionicons>
            ) : imageSource == 7 ? (
              <Ionicons
                name="train-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").height / 22,
                }}
              ></Ionicons>
            ) : imageSource == 8 ? (
              <Ionicons
                name="man-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").height / 22,
                }}
              ></Ionicons>
            ) : (
              <Ionicons
                name="cash-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").height / 22,
                }}
              ></Ionicons>
            )}
          </View>
        </View>
        <View
          style={{
            flex: 13,
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingLeft: 20,
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
              {description.toString().slice(0, 40)}...
            </Text>
          ) : (
            <Text style={[styles.cardDescription, { color: theme.text }]}>
              {description.toString()}
            </Text>
          )}
          <Text style={[styles.cardDate, { color: theme.text }]}>
            {day + "/" + month + "/" + year}
          </Text>
        </View>
        <View
          style={{
            flex: 7,
            alignItems: "flex-end",
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingRight: 20,
          }}
        >
          <Text
            style={[
              styles.cardPrice,
              {
                color: theme.text,
                fontSize: Dimensions.get("window").width / 20,
              },
            ]}
          >
            {price}₺
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  const handleCardPress = () => {};
  const [maxWidth, setMaxWidth] = useState(Dimensions.get("window").width);
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
    if (expensesArray.length > 0) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            flex: 1,
            backgroundColor: theme.background,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center",
              paddingTop: Dimensions.get("window").width / 13,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
              }}
            >
              <View style={{ width: 70 }}></View>
              <SelectDropdown
                defaultValueByIndex={1}
                data={selectionData}
                onSelect={(selectedItem, index) => {
                  setSelection(index);

                  calculateTotal();
                }}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View style={styles.dropdownButtonStyle}>
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
                        style={[
                          styles.dropdownItemTxtStyle,
                          { color: theme.text },
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
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Profile");
                }}
                style={{
                  height: 50,
                  width: 50,
                  backgroundColor: theme.button,
                  borderRadius: 100,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 20,
                }}
              >
                <Ionicons
                  size={25}
                  color={theme.buttonText}
                  name="person-outline"
                ></Ionicons>
              </TouchableOpacity>
            </View>

            <View style={styles.totalExpensesContainer}>
              <Text style={{ fontSize: 18, color: theme.text }}>
                {i18n.totalexpenses}
              </Text>
              <Text style={{ fontSize: 55, color: theme.text }}>
                {total.toLocaleString()}₺
              </Text>
            </View>

            <LineChart
              style={{
                height: 200,
                width: Dimensions.get("window").width + 20,
              }}
              gridMin={20}
              gridMax={400}
              data={
                selection == 0
                  ? lastWeekArray
                  : selection == 1
                  ? lastMonthArray
                  : lastSixMonthArray
              }
              curve={shape.curveBasis}
              svg={{
                strokeWidth: 7,
                stroke: "url(#gradient)",
              }}
              contentInset={{ top: 20, bottom: 20 }}
            >
              <Shadow />
              <Gradient />
            </LineChart>

            <View>
              <View style={styles.recentTransactionsHeader}>
                <Text style={{ fontSize: 18, flex: 1, color: theme.text }}>
                  {i18n.lastexpenses}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.button,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: 40,
                  }}
                  onPress={() => {
                    navigation.navigate("AllExpenses");
                  }}
                >
                  <Text style={{ color: theme.buttonText }}>{i18n.seeall}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentTransactionsBody}>
                <FlatList
                  scrollEnabled={false}
                  style={{ width: "100%" }}
                  data={recentList}
                  renderItem={({ item, index }) => (
                    <View>
                      <View style={{ height: 12 }}></View>
                      <CardView
                        imageSource={item.type}
                        description={item.note}
                        onPress={() => {
                          console.log(item.note);

                          navigation.navigate("ExpenseDetails", item);
                        }}
                        price={item.total}
                        date={item.date}
                      />
                    </View>
                  )}
                />
              </View>
            </View>
          </View>
          <View style={{ height: 100 }}></View>
        </ScrollView>
      );
    } else {
      return (
        <ScrollView style={{ backgroundColor: theme.background }}>
          <SafeAreaView>
            <MidSpacer></MidSpacer>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 50,
                paddingLeft: 20,
                alignItems: "center",
              }}
            >
              <View style={{ width: "80%", flexDirection: "row" }}>
                <Text
                  style={{
                    fontSize: Dimensions.get("window").width / 20,
                    fontWeight: "500",
                    color: theme.text,
                  }}
                >
                  {i18n.welcome}
                </Text>
                <Text
                  style={{
                    fontSize: Dimensions.get("window").width / 20,
                    fontWeight: "300",
                    color: theme.text,
                  }}
                >
                  {" "}
                  {FIREBASE_AUTH.currentUser.displayName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Profile");
                }}
                style={{
                  height: 50,
                  width: 50,
                  backgroundColor: theme.button,
                  borderRadius: 100,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 20,
                }}
              >
                <Ionicons
                  size={25}
                  color={theme.buttonText}
                  name="person-outline"
                ></Ionicons>
              </TouchableOpacity>
            </View>
            <MaxSpacer></MaxSpacer>
            <View>
              <ImageBackground
                blurRadius={6}
                source={require("../assets/bg-chart.png")}
                style={{
                  height: 200,
                  width: Dimensions.get("window").width,
                }}
              ></ImageBackground>

              <Text
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 20,
                  height: 200,
                  flex: 1,
                  alignContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                {i18n.yourspehiscle}
              </Text>
            </View>
          </SafeAreaView>
        </ScrollView>
      );
    }
  }
}
const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 5,
    shadowColor: "000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 0.01,
    elevation: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  cardTitle: {
    width: Dimensions.get("window").width * 0.5,
    fontSize: Dimensions.get("window").width / 23,
    fontWeight: "500",
    marginBottom: 1,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: "300",
    marginBottom: 1,
  },
  cardDescription: {
    marginVertical: 2,
    fontSize: Dimensions.get("window").width / 35,
    lineHeight: Dimensions.get("window").width / 30,
  },
  cardDate: {
    fontSize: 10,
  },
  recentTransactionsHeader: {
    width: Dimensions.get("window").width,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  recentTransactionsBody: {
    width: Dimensions.get("window").width,
    paddingTop: 0,
    padding: 20,
    paddingBottom: 30,
    marginBottom: 30,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  recentTransactionsImage: {
    height: 40,
    width: 40,
  },

  dropdownButtonStyle: {
    width: 180,
    height: 40,
    backgroundColor: "transparent",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "grey",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
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
    borderRadius: 20,
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

  slider: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    borderRadius: 20,
    flex: 1,
  },
  dotContainer: {
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
  },
  totalExpensesContainer: {
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "space-between",
  },
  addNewExpensContainer: {
    width: "90%",
    borderRadius: 20,
    height: 150,
    backgroundColor: "green",
    flex: 2,
  },
  container2: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
