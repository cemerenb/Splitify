import React, {
  useLayoutEffect,
  Component,
  useRef,
  useState,
  useEffect,
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
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import SelectDropdown from "react-native-select-dropdown";
import * as SecureStore from "expo-secure-store";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LineChart, Grid } from "react-native-svg-charts";
import { Shadow, Gradient } from "../ChartAdds";
import * as shape from "d3-shape";
import { Button } from "react-native-paper";
import { TabBar } from "../TabBar/TabBar";
import { MaxSpacer, MidSpacer } from "../Utils/Spacers";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";

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
  const items = {
    date: null,
    imageUrl: "",
    timeStamp: null,
    note: "",
    total: 0,
  };
  const selectionData = [
    { title: "Last Week" },
    { title: "Last Month" },
    { title: "Last 6 Months" },
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
            flex: 1,
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
            flex: 3,
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
          <Text style={styles.cardDescription}>{description}</Text>
          <Text style={styles.cardDate}>{day + "/" + month + "/" + year}</Text>
        </View>
        <View
          style={{
            flex: 2,
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
  const handleCardPress = () => {};
  const [maxWidth, setMaxWidth] = useState(Dimensions.get("window").width);
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="rgb(222, 110, 235)" />
      </View>
    );
  } else {
    if (expensesArray.length > 0) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center",
              paddingTop: 100,
            }}
          >
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

            <View style={styles.totalExpensesContainer}>
              <Text style={{ fontSize: 18 }}>Total Expenses</Text>
              <Text style={{ fontSize: 55 }}>{total}₺</Text>
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
              curve={shape.curveBundle.beta(1)}
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
                <Text style={{ fontSize: 18, flex: 1 }}>Last Transactions</Text>
                <Button
                  onPress={() => {}}
                  style={{ backgroundColor: "rgb(222, 110, 235)" }}
                >
                  <Text style={{ fontSize: 16, color: "white" }}>See All</Text>
                </Button>
              </View>
              <View style={styles.recentTransactionsBody}>
                <FlatList
                  scrollEnabled={false}
                  style={{ width: "100%" }}
                  data={recentList}
                  renderItem={({ item }) => (
                    <View>
                      <View style={{ height: 12 }}></View>
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
              </View>
            </View>
          </View>
          <View style={{ height: 100 }}></View>
        </ScrollView>
      );
    } else {
      return (
        <ScrollView>
          <SafeAreaView>
            <MidSpacer></MidSpacer>
            <View style={{ flexDirection: "row", paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 25, fontWeight: "500" }}>Welcome</Text>
              <Text style={{ fontSize: 25, fontWeight: "300" }}>
                {" "}
                {FIREBASE_AUTH.currentUser.displayName}
              </Text>
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
                  fontSize: 25,
                  height: 200,
                  flex: 1,
                  alignContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                Your spending history is clear
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
    fontSize: 14,
    lineHeight: 24,
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
