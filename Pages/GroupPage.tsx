import {
  RouteProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import React, {
  useCallback,
  useContext,
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
  ScrollView,
  Button,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaxSpacer, MinSpacer } from "../Utils/Spacers";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import SelectDropdown from "react-native-select-dropdown";
import { LineChart, Grid } from "react-native-svg-charts";
import * as shape from "d3-shape";
import { Shadow, Gradient } from "../ChartAdds";
import { useIsFocused } from "@react-navigation/native";
import { ThemeContext } from "../Theme/ThemeContext";

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
  const { theme } = useContext(ThemeContext);

  const [total, setTotal] = useState(0);
  const [lastSixMonthArray, setLastSixMonthArray] = useState([]);
  const [lastMonthArray, setLastMonthArray] = useState([]);
  const [lastWeekArray, setLastWeekArray] = useState([]);
  const [namesMap, setNamesMap] = useState([]);
  const [processedExpenses, setProcessedExpenses] = useState([]);
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
    setNamesMap(groupData.data().memberNames ?? {});
    setProcessedExpenses(groupData.data().processedExpenses);
    if (!groupData.data().members.includes(FIREBASE_AUTH.currentUser.uid)) {
      navigation.pop();
    } else {
      fetchAndSaveNames(groupData.data().memberNames, groupData.data().members)
        .then((nameMap) => {
          setNamesMap(nameMap);
        })
        .catch((error) => {
          console.error("Error fetching and saving names:", error);
        });
      setLoadingStatus(false);
    }
  };

  const fetchAndSaveNames = async (nameMapLocal, membersLocal) => {
    try {
      // Check if all UIDs exist in the existing nameMap
      let allNamesExist = true;
      for (const uid of members) {
        if (!nameMapLocal[uid]) {
          allNamesExist = false;
          break;
        }
      }
      console.log("all exist: " + allNamesExist);

      // If any name is missing, fetch all names from Firestore
      if (!allNamesExist) {
        const docRefs = membersLocal.map((uid) =>
          doc(FIRESTORE_DB, "users", uid)
        );
        const docSnaps = await Promise.all(docRefs.map(getDoc));

        docSnaps.forEach((docSnap, index) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Check if name data exists
            if (userData && userData.name) {
              // Update nameMap with fetched name
              nameMapLocal[membersLocal[index]] = userData.name;
            } else {
              console.error(
                `Name data not found for user with UID ${membersLocal[index]}`
              );
            }
          } else {
            console.error(
              `User with UID ${membersLocal[index]} not found in Firestore.`
            );
          }
        });
      }
    } catch (error) {
      // Handle fetch error
      console.error("Error fetching user data:", error);
    }
    const groupRef = doc(FIRESTORE_DB, "groups", groupId);
    await updateDoc(groupRef, { memberNames: nameMapLocal });
    // Return the updated nameMap
    setNamesMap(nameMapLocal);
    return nameMapLocal;
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
    expenseId,
  }) => {
    imageSource = parseInt(imageSource);

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
                  fontSize: Dimensions.get("window").width / 12,
                }}
              ></Ionicons>
            ) : imageSource == 2 ? (
              <Ionicons
                name="fast-food-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 12,
                }}
              ></Ionicons>
            ) : imageSource == 3 ? (
              <Ionicons
                name="medical-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 12,
                }}
              ></Ionicons>
            ) : imageSource == 4 ? (
              <Ionicons
                name="balloon-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 12,
                }}
              ></Ionicons>
            ) : imageSource == 5 ? (
              <Ionicons
                name="bag-handle-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 12,
                }}
              ></Ionicons>
            ) : imageSource == 6 ? (
              <Ionicons
                name="book-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 12,
                }}
              ></Ionicons>
            ) : imageSource == 7 ? (
              <Ionicons
                name="train-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 12,
                }}
              ></Ionicons>
            ) : imageSource == 8 ? (
              <Ionicons
                name="man-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 12,
                }}
              ></Ionicons>
            ) : (
              <Ionicons
                name="cash-outline"
                style={{
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 12,
                }}
              ></Ionicons>
            )}
          </View>
          {processedExpenses.includes(expenseId) ? (
            <View
              style={{
                position: "absolute",
                right: 0,
                top: -10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#188c3f",
                padding: 4,
                borderRadius: 40,
              }}
            >
              <Ionicons
                size={10}
                color={theme.reverse}
                name="checkmark-outline"
              ></Ionicons>
            </View>
          ) : (
            <View></View>
          )}
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
            <Text style={[styles.cardDescription, { color: theme.text }]}>
              {description.slice(0, 40)}...
            </Text>
          ) : (
            <Text style={[styles.cardDescription, { color: theme.text }]}>
              {description}
            </Text>
          )}
          <Text style={[styles.cardName, { color: theme.text }]}>
            {namesMap[createdBy] || "Unknown"}
          </Text>
        </View>
        <View
          style={{
            flex: 7,
            alignItems: "flex-end",
            flexDirection: "column",
            justifyContent: "flex-end",
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
    console.log(expensesArray.length);

    calculateTotal();
    generateRecentList();
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
      <SafeAreaView
        style={{
          alignItems: "center",
          backgroundColor: theme.background,
          paddingTop: Dimensions.get("window").width / 14,
        }}
      >
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
            style={[styles.homeIcon, { backgroundColor: theme.button }]}
            onPress={() => {
              navigation.navigate("TabBar");
            }}
          >
            <Ionicons
              name="home-outline"
              color={theme.buttonText}
              size={26}
            ></Ionicons>
          </TouchableOpacity>
          <View
            style={[styles.nameContainer, { backgroundColor: theme.button }]}
          >
            <View style={{ paddingLeft: 10 }}>
              <Text
                style={{
                  fontSize: Dimensions.get("window").width / 24,
                  color: theme.buttonText,
                }}
              >
                {groupName}
              </Text>
              <Text
                style={{
                  fontWeight: "300",
                  fontSize: Dimensions.get("window").width / 35,
                  color: theme.buttonText,
                }}
              >
                {ownerName}'s group
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.6}
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
                backgroundColor: theme.primary,
              }}
            >
              <Ionicons
                name="people-outline"
                color={theme.text}
                size={30}
              ></Ionicons>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          style={{ flexDirection: "column", height: "90%", paddingTop: 30 }}
        >
          <View
            style={{
              width: Dimensions.get("window").width,
              flexDirection: "column",
              alignItems: "center",
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

            <View style={styles.totalExpensesContainer}>
              <Text
                style={{ fontSize: 18, color: theme.text, paddingVertical: 40 }}
              >
                Total Expenses
              </Text>

              <Text style={{ fontSize: 55, color: theme.text }}>{total}₺</Text>
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
            {expensesArray.length > 0 ? (
              <View style={{ paddingTop: 30 }}>
                <View style={styles.recentTransactionsHeader}>
                  <Text style={{ fontSize: 18, flex: 1, color: theme.text }}>
                    Last Transactions
                  </Text>
                  <TouchableOpacity
                    style={{
                      marginRight: 8,
                      backgroundColor: theme.button,
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                      borderRadius: 40,
                    }}
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate("GroupSummary", {
                        groupId: groupId,
                        memberNames: namesMap,
                      });
                    }}
                  >
                    <Text style={{ color: theme.buttonText }}>Summary</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: theme.button,
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                      borderRadius: 40,
                    }}
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate("AllGroupExpenses", {
                        groupId: groupId,
                        memberNames: namesMap,
                      });
                    }}
                  >
                    <Text style={{ color: theme.buttonText }}>See All</Text>
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
                          title={item.note}
                          description={item.note}
                          onPress={() => {
                            //@ts-ignore
                            navigation.navigate("GroupExpenseDetails", {
                              mapData: item,
                              memberNames: namesMap,
                            });
                          }}
                          price={item.total}
                          date={item.date}
                          createdBy={item.createdBy}
                          expenseId={item.expenseId}
                        />
                      </View>
                    )}
                  />
                </View>
                <View
                  style={{ height: Dimensions.get("window").height / 6 }}
                ></View>
              </View>
            ) : (
              <View></View>
            )}
          </View>
        </ScrollView>
        <TouchableOpacity
          onPress={() => {
            // @ts-ignore
            navigation.navigate("GroupExpensesEntry", {
              groupId: groupId,
              membersMap: namesMap,
              members: members,
            });
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            position: "absolute",
            bottom: 50,
            right: 20,
            height: Dimensions.get("window").height / 18,
            backgroundColor: theme.button,
            borderRadius: 100,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 15,
            }}
          >
            <Text
              style={{
                color: theme.buttonText,
                fontSize: Dimensions.get("window").width / 30,
              }}
            >
              Add Expense
            </Text>
          </View>
        </TouchableOpacity>
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
    elevation: 0.3,
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
    fontSize: 15,
    lineHeight: 15,
  },
  cardDate: {
    fontSize: 12,
  },
  cardName: {
    fontSize: 13,
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
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default GroupPage;
