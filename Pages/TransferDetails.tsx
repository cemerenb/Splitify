//@ts-nocheck
import {
  Transaction,
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
  Alert,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../Theme/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";

type RootStackParamList = {
  TransferDetails: { transfer: Array; data: Array; memberNames: Array };
};
type TransferDetailsRouteProp = RouteProp<
  RootStackParamList,
  "TransferDetails"
>;

interface TransferDetailsProps {
  route: TransferDetailsRouteProp;
}

const TransferDetails: React.FC<TransferDetailsProps> = ({ route }) => {
  const transfer = route.params.transfer;
  const memberNames = route.params.memberNames;
  const data = route.params.data;
  console.log("-----------------------------");

  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);

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

  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  return (
    <View
      style={{
        backgroundColor: theme.background,
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
      }}
    >
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
            <Text style={{ fontSize: 18, color: theme.text }}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          flexDirection: "column",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          flex: 1,
        }}
      >
        <View
          style={{
            paddingLeft: 20,
            marginTop: 30,
            paddingVertical: 20,
            borderRadius: 20,
            backgroundColor: theme.shadow,
          }}
        >
          <Text style={{ color: theme.text, fontSize: 25 }}>
            {data[0].creatorName}
          </Text>
          <Text style={{ color: theme.text, fontSize: 12 }}>
            {data[0].transactionsId}
          </Text>

          <Text style={{ color: theme.text }}>
            {data[0].firstDate} {" - "} {data[0].lastDate}
          </Text>
        </View>
        <ScrollView
          style={{
            borderRadius: 20,
          }}
          scrollEnabled={transfer.length > 20 ? true : false}
        >
          <View
            style={{
              flexDirection: "row",
              paddingTop: 40,
              justifyContent: "flex-end",
            }}
          ></View>
          {rearrangeTransactions(transfer, FIREBASE_AUTH.currentUser.uid).map(
            (transaction, index) => (
              <View style={{ paddingLeft: 0 }}>
                <Text
                  style={{
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
                    color: theme.text,
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
              </View>
            )
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default TransferDetails;
