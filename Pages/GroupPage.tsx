import {
  RouteProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-paper";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaxSpacer, MinSpacer } from "../Utils/Spacers";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import SelectDropdown from "react-native-select-dropdown";
import { LineChart, Grid } from "react-native-svg-charts";
import * as shape from "d3-shape";
import { Shadow, Gradient } from "../ChartAdds";
import { useIsFocused } from "@react-navigation/native";

type RootStackParamList = {
  GroupPage: { groupId: string };
};
type GroupPageRouteProp = RouteProp<RootStackParamList, "GroupPage">;

interface GroupPageProps {
  route: GroupPageRouteProp;
}

const GroupPage: React.FC<GroupPageProps> = ({ route }) => {
  const [recentList, setRecentList] = useState([]);
  const [count, setCount] = useState(0);
  const [expensesArray, setExpensesArray] = useState([]);
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [admins, setAdmins] = useState([]);
  const [groupType, setGroupType] = useState(0);
  const [timeStamp, setTimeStamp] = useState(0);
  const [creationDate, setCreationDate] = useState("");
  const [ownerUid, setOwnerUid] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoadingStatus] = useState(true);
  const [selection, setSelection] = useState(1);
  const [stampDiff, setStampDiff] = useState(0);

  const [total, setTotal] = useState(0);
  const [lastSixMonthArray, setLastSixMonthArray] = useState([]);
  const [lastMonthArray, setLastMonthArray] = useState([]);
  const [lastWeekArray, setLastWeekArray] = useState([]);
  const [namesMap, setNamesMap] = useState([]);
  const isFocused = useIsFocused();
  const getGroupDetails = async () => {
    setTotal(0);
    const docRef = doc(FIRESTORE_DB, "groups", groupId);
    const groupData = await getDoc(docRef);
    const nameDocRef = doc(FIRESTORE_DB, "users", groupData.data().ownerUid);

    setExpensesArray(groupData.data()?.expenses ?? []);
    setMembers(groupData.data().members ?? []);
    setGroupName(groupData.data().name ?? "");
    setAdmins(groupData.data().admins ?? []);
    setGroupType(groupData.data().type ?? 0);
    setTimeStamp(groupData.data().timeStamp ?? 0);
    setOwnerUid(groupData.data().ownerUid ?? "");
    setOwnerName((await getDoc(nameDocRef)).data().name);
    if (!groupData.data().members.includes(FIREBASE_AUTH.currentUser.uid)) {
      navigation.pop();
    } else {
      await fetchNames();
      setLoadingStatus(false);
      console.log(expensesArray);
    }
  };

  const fetchNames = async () => {
    const newNamesMap = []; // Temporary array to hold the new names map

    for (let index = 0; index < members.length; index++) {
      const uid = members[index];
      const nameDocRef = doc(FIRESTORE_DB, "users", uid);
      const name = (await getDoc(nameDocRef)).data().name;
      newNamesMap.push({ uid, name }); // Push the object with uid and name to the temporary array
    }

    setNamesMap(newNamesMap); // Update the state with the new names map
  };

  const selectionData = [
    { title: "Last Week" },
    { title: "Last Month" },
    { title: "Last 6 Months" },
  ];
  const CardView = ({
    imageSource,
    title,
    description,
    onPress,
    price,
    date,
    createdBy,
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
          <Text style={styles.cardName}>
            {namesMap.find((user) => user.uid === createdBy)?.name || "Unknown"}
          </Text>

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
    setExpensesArray(expensesArray.reverse());

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
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

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
    calculateSixMonthData(expensesArray);
    calculateLastMonthData(expensesArray);
    calculateLastSevenDaysData(expensesArray);
  }, [selection, expensesArray]);

  useEffect(() => {
    if (isFocused) {
      getGroupDetails();

      calculateSixMonthData(expensesArray);
      calculateLastMonthData(expensesArray);
      calculateLastSevenDaysData(expensesArray);
      console.log("cem");
    }
  }, [isFocused]);

  const { groupId } = route.params;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="rgb(222, 110, 235)" />
      </View>
    );
  } else {
    return (
      <SafeAreaView style={{ alignItems: "center" }}>
        <MaxSpacer></MaxSpacer>

        <View
          style={{
            paddingHorizontal: 20,
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={styles.homeIcon}
            onPress={() => {
              navigation.navigate("TabBar");
            }}
          >
            <Ionicons name="home-outline" size={26}></Ionicons>
          </TouchableOpacity>
          <View style={styles.nameContainer}>
            <View style={{ paddingLeft: 10 }}>
              <Text style={{ fontSize: 30 - groupName.length / 2 }}>
                {groupName}
              </Text>
              <Text style={{ fontWeight: "300", fontSize: 12 }}>
                {ownerName}'s group
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                // @ts-ignore
                navigation.navigate("Members", { groupId: groupId });
              }}
              style={{
                marginRight: 10,
                padding: 10,
                borderRadius: 18,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgb(222, 110, 235)",
              }}
            >
              <Ionicons
                name="people-outline"
                color={"white"}
                size={30}
              ></Ionicons>
            </TouchableOpacity>
          </View>
        </View>

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
          style={{
            height: 150,
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
            <Text style={{ fontSize: 18, flex: 1 }}>Last Transactions</Text>
            <Button
              onPress={() => {
                navigation.navigate("AllExpenses");
              }}
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
              renderItem={({ item, index }) => (
                <View>
                  <View style={{ height: 12 }}></View>
                  <CardView
                    imageSource={item.type}
                    title={item.note}
                    description={item.note}
                    onPress={() => {}}
                    price={item.total}
                    date={item.date}
                    createdBy={item.createdBy}
                  />
                </View>
              )}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
};

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
    marginVertical: 4,
    fontSize: 14,
    lineHeight: 15,
  },
  cardDate: {
    fontSize: 10,
  },
  cardName: {
    fontSize: 14,
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
  nameContainer: {
    marginBottom: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    height: 80,
    backgroundColor: "rgba(20,20,20,0.1)",
    width: (Dimensions.get("window").width - 40) * 0.8,
  },
  homeIcon: {
    height: 80,
    marginBottom: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "rgba(20,20,20,0.1)",
    width: (Dimensions.get("window").width - 40) * 0.15,
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
  totalExpensesContainer: {
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default GroupPage;
