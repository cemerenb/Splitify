import React, {
  useLayoutEffect,
  Component,
  useRef,
  useState,
  useEffect,
} from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { MinSpacer } from "./Spacers";
import { FIREBASE_AUTH, FIRESTORE_DB } from "./FirebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import SelectDropdown from "react-native-select-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";
import { LineChart, Grid } from "react-native-svg-charts";
import { Shadow, Gradient } from "./ChartAdds";
import * as shape from "d3-shape";
import { Button } from "react-native-paper";
import { Line } from "react-native-svg";
import { Colors } from "react-native/Libraries/NewAppScreen";

export default function Home() {
  const [count, setCount] = useState(0);
  const [recentCount, setRecentCount] = useState(0);

  const [total, setTotal] = useState(0);
  const [selection, setSelection] = useState(1);
  const [stampDiff, setStampDiff] = useState(0);
  const [expensesArray, setArray] = useState([]);
  const [monthlyArray, setMonthlyArray] = useState([]);
  const [recentList, setRecentList] = useState([]);
  const data2 = [80, 10, 95, 48, 24, 67, 51, 12, 33, 0, 24, 20, 50];

  const selectionData = [
    { title: "Last Week" },
    { title: "Last Month" },
    { title: "All Times" },
  ];

  const getTotalExpenses = async () => {
    setTotal(0);
    let uid = FIREBASE_AUTH.currentUser.uid;
    const docRef = doc(FIRESTORE_DB, "personal", uid);
    const userData = await getDoc(docRef);

    setArray(userData.data()!.expenses || []);
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

    setTotal(subTotal); // Set the total after calculating based on the updated stampDiff
  };

  const calculateGraphData = (expensesArray) => {
    let one = 0;
    let two = 0;
    let three = 0;
    let four = 0;
    let five = 0;
    let six = 0;

    const day = parseInt(new Date().toISOString().split("T")[0].split("-")[2]);
    const thisMonthsDays = day * 86400000;
    const first = Date.now() - thisMonthsDays;
    const second = first - 2629743000;
    const third = second - 2629743000;
    const fourth = third - 2629743000;
    const fifth = fourth - 2629743000;
    const sixth = fifth - 2629743000;

    for (let index = 0; index < expensesArray.length; index++) {
      const element = expensesArray[index];
      if (element.timeStamp > first) {
        one = one + element.total;
      }
    }
    for (let index = 0; index < expensesArray.length; index++) {
      const element = expensesArray[index];
      if (second < element.timeStamp && element.timeStamp < first - 1) {
        two = two + element.total;
      }
    }
    for (let index = 0; index < expensesArray.length; index++) {
      const element = expensesArray[index];
      if (third < element.timeStamp && element.timeStamp < second - 1) {
        three = three + element.total;
      }
    }
    for (let index = 0; index < expensesArray.length; index++) {
      const element = expensesArray[index];
      if (fourth < element.timeStamp && element.timeStamp < third - 1) {
        four = four + element.total;
      }
    }
    for (let index = 0; index < expensesArray.length; index++) {
      const element = expensesArray[index];
      if (fifth < element.timeStamp && element.timeStamp < fourth - 1) {
        five = five + element.total;
      }
    }
    for (let index = 0; index < expensesArray.length; index++) {
      const element = expensesArray[index];
      if (sixth < element.timeStamp && element.timeStamp < fifth - 1) {
        six = six + element.total;
      }
    }

    setMonthlyArray([one, two, three, four, five, six]);
  };
  const generateRecentList = (expensesArray) => {
    setRecentList([]);
    console.log("----------------");

    console.log(expensesArray);

    if (expensesArray.length < 2) {
      setRecentCount(1);
    }
    if (expensesArray.length < 3) {
      setRecentCount(2);
    }
    if (expensesArray.length < 4) {
      setRecentCount(3);
    }
    if (expensesArray.length < 5) {
      setRecentCount(4);
    }

    for (let index = 0; index < recentCount; index++) {
      const element = expensesArray[index];
      setRecentList((recentList) => [...recentList, element]);
      console.log(recentList);
    }

    console.log("list lenght:");
    console.log(recentList);
    console.log(recentCount);
  };
  // useEffect to call calculateTotal whenever selection or expensesArray changes
  useEffect(() => {
    calculateTotal();
  }, [selection, expensesArray]);

  useEffect(() => {
    calculateGraphData(expensesArray);
  }, [expensesArray]);

  useEffect(() => {
    generateRecentList(expensesArray);
  }, [expensesArray]);
  useLayoutEffect(() => {
    if (count == 0) {
      getTotalExpenses();

      setCount(1);
    }
  }, []);
  return (
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
              <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
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
        style={{ height: 200, width: Dimensions.get("window").width + 20 }}
        gridMin={20}
        gridMax={40000}
        data={monthlyArray}
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
      <Text style={{ fontSize: 12 }}>Last 6 month</Text>
      <View
        style={{
          height: 20,
          width: Dimensions.get("window").width,
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
        }}
      />

      {expensesArray.length > 0 ? (
        <View>
          <View style={styles.recentTransectionHeader}>
            <Text style={{ fontSize: 18, flex: 1 }}>Recent Transections</Text>
            <Button
              onPress={() => {}}
              style={{ backgroundColor: "rgb(222, 110, 235)" }}
            >
              <Text style={{ fontSize: 16, color: "white" }}>See All</Text>
            </Button>
          </View>
          <View style={styles.recentTransectionBody}>
            <FlatList
              data={recentList}
              renderItem={({ item }) => <Text>{item.type}</Text>}
            />
          </View>
        </View>
      ) : (
        <View></View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  recentTransectionHeader: {
    width: Dimensions.get("window").width,
    paddingTop: 10,
    padding: 25,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  recentTransectionBody: {
    width: Dimensions.get("window").width,
    paddingTop: 10,
    padding: 25,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  dropdownButtonStyle: {
    width: 150,
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
});
