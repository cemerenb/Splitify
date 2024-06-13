//@ts-nocheck
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../Theme/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import i18n from "../Language/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  GroupSummary: { groupId: string; memberNames: Array };
};
type GroupSummaryRouteProp = RouteProp<RootStackParamList, "GroupSummary">;

interface GroupSummaryProps {
  route: GroupSummaryRouteProp;
}

const GroupSummary: React.FC<GroupSummaryProps> = ({ route }) => {
  const groupId = route.params.groupId;
  const memberNames = route.params.memberNames;
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [turkish, setTurkish] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);

  const getExpenses = async () => {
    const docRef = doc(FIRESTORE_DB, "groups", groupId);
    const groupData = await getDoc(docRef);

    const expensesList = groupData.data().expenses;
    setExpenses(expensesList);
  };

  useEffect(() => {
    // Harcamaları çekme

    AsyncStorage.getItem("lg").then((value) => {
      if (value.split("_")[0] == "tr") {
        setTurkish(true);
      } else [setTurkish(false)];
    });

    getExpenses();
  }, [groupId]);

  const filterExpenses = async () => {
    if (startDate && endDate) {
      const [startDay, startMonth, startYear] = startDate.split("/");
      const [endDay, endMonth, endYear] = endDate.split("/");
      const startTimestamp = new Date(
        `${startYear}-${startMonth}-${startDay} 00:00`
      ).getTime();
      const endTimestamp = new Date(
        `${endYear}-${endMonth}-${endDay} 23:59`
      ).getTime();

      const filtered = expenses.filter((expense) => {
        const expenseTimestamp = new Date(expense.timeStamp).getTime();
        return (
          expenseTimestamp >= startTimestamp && expenseTimestamp <= endTimestamp
        );
      });

      setFilteredExpenses(filtered);
      calculateTransactions(filtered);
    }
  };

  const calculateTransactions = (filtered) => {
    if (filtered.length === 0) {
      setTransactions([]);
      return;
    }

    const balance = {};

    filtered.forEach((expense) => {
      const { total, createdBy, participants } = expense;

      // Her bir katılımcının borç payını hesaplayın
      const share = total / participants.length;

      participants.forEach((userID) => {
        if (userID !== createdBy) {
          if (!balance[createdBy]) {
            balance[createdBy] = 0;
          }
          if (!balance[userID]) {
            balance[userID] = 0;
          }

          balance[createdBy] += share;
          balance[userID] -= share;
        }
      });
    });

    const transactionsList = [];
    const debtors = Object.keys(balance).filter(
      (userID) => balance[userID] < 0
    );
    const creditors = Object.keys(balance).filter(
      (userID) => balance[userID] > 0
    );

    debtors.forEach((debtor) => {
      creditors.forEach((creditor) => {
        if (balance[debtor] === 0 || balance[creditor] === 0) return;
        const payment = Math.min(-balance[debtor], balance[creditor]);
        transactionsList.push({
          from: debtor,
          to: creditor,
          amount: payment,
        });
        balance[debtor] += payment;
        balance[creditor] -= payment;
      });
    });

    setTransactions(transactionsList);
  };

  const markAsProcessed = async () => {
    const docRef = doc(FIRESTORE_DB, "groups", groupId);
    const groupData = await getDoc(docRef);
    const processedExpenses = groupData.data().processedExpenses || [];

    const newProcessedExpenses = filteredExpenses.map(
      (expense) => expense.expenseId
    );
    console.log(newProcessedExpenses);

    if (newProcessedExpenses.length > 0) {
      await updateDoc(docRef, {
        processedExpenses: arrayUnion(...newProcessedExpenses), // Spread the array here
      });
    } else {
      setLoading(false);
      console.log("No new unprocessed expenses to add.");
    }
  };
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
  const formatDate = (dateString) => {
    const cleaned = dateString.replace(/[^0-9]/g, "");
    const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);

    if (match) {
      return `${match[1]}${match[2] ? "/" : ""}${match[2]}${
        match[3] ? "/" : ""
      }${match[3]}`;
    }
    console.log(dateString.lenght);

    return dateString;
  };
  const rearrangeTransactions = (transactions, currentUserId) => {
    // Filter transactions involving the current user
    const userTransactions = transactions.filter(
      (transaction) =>
        transaction.from === currentUserId || transaction.to === currentUserId
    );

    // Filter transactions not involving the current user
    const otherTransactions = transactions.filter(
      (transaction) =>
        transaction.from !== currentUserId && transaction.to !== currentUserId
    );
    for (let index = 0; index < transactions.length; index++) {
      const element = transactions[index];
      console.log(element.from == FIREBASE_AUTH.currentUser.uid);
    }

    // Combine both arrays, with user transactions first
    return [...userTransactions, ...otherTransactions];
  };

  // Example usage

  const currentUserId = "DEyxwj3Xrq0dhBztY0hFtsJxxQ7M5j";
  const rearrangedTransactions = rearrangeTransactions(
    transactions,
    currentUserId
  );

  console.log(rearrangedTransactions);

  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  return (
    <View
      style={{
        backgroundColor: theme.background,
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: Dimensions.get("window").width / 14,
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
              {i18n.anerrortrans}
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
      <View style={{ paddingTop: 0 }}>
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
              paddingTop: 10,
            }}
          >
            <Ionicons
              name="chevron-back-outline"
              size={30}
              color={theme.text}
            ></Ionicons>
            <Text style={{ fontSize: 18, color: theme.text }}>{i18n.back}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            {transactions.length > 0 ? (
              <View style={{ paddingTop: 10 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.button,
                    width: 90,
                    height: 30,
                    borderRadius: 30,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={async () => {
                    setTransactions([]);
                  }}
                >
                  <Text style={{ color: theme.buttonText }}>{i18n.reset}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View></View>
            )}
            <View style={{ paddingTop: 10, paddingLeft: 10 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.button,
                  width: 90,
                  height: 30,
                  borderRadius: 30,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={async () => {
                  navigation.navigate("OldTransections", {
                    groupId: groupId,
                    memberNames: memberNames,
                  });
                }}
              >
                <Text style={{ color: theme.buttonText }}>{i18n.history}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      {transactions.length > 0 ? (
        <View
          style={{
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <ScrollView scrollEnabled={transactions.length > 20 ? true : false}>
            <View
              style={{
                flexDirection: "row",
                paddingTop: 40,
                justifyContent: "flex-end",
              }}
            ></View>
            {rearrangeTransactions(
              transactions,
              FIREBASE_AUTH.currentUser.uid
            ).map((transaction, index) => (
              <View style={{}}>
                {turkish ? (
                  <Text
                    style={{
                      color: theme.text,
                      fontSize:
                        transaction.from === FIREBASE_AUTH.currentUser.uid ||
                        transaction.to === FIREBASE_AUTH.currentUser.uid
                          ? 30
                          : 16,
                      paddingBottom:
                        transaction.from === FIREBASE_AUTH.currentUser.uid ||
                        transaction.to === FIREBASE_AUTH.currentUser.uid
                          ? 30
                          : 3,
                    }}
                    key={index}
                  >
                    {transaction.from === FIREBASE_AUTH.currentUser.uid
                      ? "Sen"
                      : memberNames[transaction.from]}{" "}
                    {transaction.to === FIREBASE_AUTH.currentUser.uid
                      ? "sana"
                      : memberNames[transaction.to]}
                    {transaction.to === FIREBASE_AUTH.currentUser.uid
                      ? " "
                      : "'a "}
                    {Math.round(transaction.amount)}₺{" "}
                    {transaction.from === FIREBASE_AUTH.currentUser.uid
                      ? "vereceksin"
                      : "verecek"}{" "}
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: theme.text,
                      fontSize:
                        transaction.from === FIREBASE_AUTH.currentUser.uid ||
                        transaction.to === FIREBASE_AUTH.currentUser.uid
                          ? 30
                          : 16,
                      paddingBottom:
                        transaction.from === FIREBASE_AUTH.currentUser.uid ||
                        transaction.to === FIREBASE_AUTH.currentUser.uid
                          ? 30
                          : 3,
                    }}
                    key={index}
                  >
                    {transaction.from === FIREBASE_AUTH.currentUser.uid
                      ? "You"
                      : memberNames[transaction.from]}{" "}
                    {transaction.from === FIREBASE_AUTH.currentUser.uid
                      ? "will give"
                      : "gives"}{" "}
                    {Math.round(transaction.amount)}₺ to{" "}
                    {transaction.to === FIREBASE_AUTH.currentUser.uid
                      ? "You"
                      : memberNames[transaction.to]}{" "}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            onPress={async () => {
              try {
                setLoading(true);
                markAsProcessed();
                const docRef = doc(FIRESTORE_DB, "groups", groupId);
                const data = [
                  {
                    transfers: transactions,
                    transactionsId: generateRandomString(),
                    date: new Date().toISOString(),
                    firstDate: startDate,
                    lastDate: endDate,
                    timeStamp: Date.now(),
                    createdBy: FIREBASE_AUTH.currentUser.uid,
                    creatorName: memberNames[FIREBASE_AUTH.currentUser.uid],
                  },
                ];
                await updateDoc(docRef, {
                  transactions: arrayUnion(...data),
                });
                setLoading(false);
                navigation.pop();
              } catch (error) {
                setModalVisible2(true);
              }
            }}
            style={{
              marginTop: 16,
              marginBottom: 100,
            }}
          >
            <View
              style={{
                padding: 16,
                backgroundColor: theme.button,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator
                  size={"small"}
                  color={theme.buttonText}
                ></ActivityIndicator>
              ) : (
                <Text style={{ color: theme.buttonText }}>{i18n.save}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ paddingTop: 20 }}>
          <Text style={{ color: theme.text, paddingBottom: 7, paddingLeft: 2 }}>
            {i18n.firstdate}
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.primary,
              padding: 8,
              color: theme.text,
              marginBottom: 8,
              borderRadius: 10,
              height: 50,
            }}
            placeholderTextColor={theme.text}
            placeholder="DD/MM/YYYY"
            value={startDate}
            onChangeText={(text) => setStartDate(formatDate(text))}
            keyboardType="numeric"
            maxLength={10}
          />
          <Text style={{ color: theme.text, paddingBottom: 7, paddingLeft: 2 }}>
            {i18n.lastdate}
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.primary,
              color: theme.text,
              padding: 8,
              marginBottom: 8,
              borderRadius: 10,
              height: 50,
            }}
            placeholderTextColor={theme.text}
            placeholder="DD/MM/YYYY"
            value={endDate}
            onChangeText={(text) => setEndDate(formatDate(text))}
            keyboardType="numeric"
            maxLength={10}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingTop: 10,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: theme.button,
                width: 90,
                height: 40,
                borderRadius: 30,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={async () => {
                await filterExpenses();
              }}
            >
              <Text style={{ color: theme.buttonText }}>{i18n.calculate}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default GroupSummary;
