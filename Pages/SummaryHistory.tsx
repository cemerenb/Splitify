//@ts-nocheck
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../FirebaseConfig"; // Adjust the import as necessary
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemeContext } from "../Theme/ThemeContext";
import TransferDetails from "./TransferDetails";

type RootStackParamList = {
  OldTransections: { groupId: string; memberNames: Array };
};
type OldTransectionsRouteProp = RouteProp<
  RootStackParamList,
  "OldTransections"
>;

interface OldTransectionsProps {
  route: OldTransectionsRouteProp;
}

const OldTransections: React.FC<OldTransectionsProps> = ({ route }) => {
  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const groupId = route.params.groupId;
  const memberNames = route.params.memberNames;
  const { theme } = useContext(ThemeContext);
  const [transfer, setTransfer] = useState([]);

  const fetchTransactions = async () => {
    const docRef = doc(FIRESTORE_DB, "groups", groupId);
    const data = await getDoc(docRef);

    setTransactions(data.data().transactions || []);
    setTransfer(data.data().transactions[0].transfers);
    console.log(data.data().transactions[0].transfers);
    setLoading(false);
  };

  useEffect(() => {
    if (count === 0) {
      console.log(groupId);
      setCount(1);
      fetchTransactions();
    }
  }, [count, groupId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: theme.shadow }]}
      onPress={() => {
        navigation.navigate("TransferDetails", {
          transfer: transfer,
          data: transactions,
          memberNames: memberNames,
        });
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={[styles.cardTitle, { color: theme.text, fontWeight: "400" }]}
        >
          Created By{" "}
        </Text>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {item.creatorName}
        </Text>
      </View>

      <Text style={[styles.cardText, { color: theme.text }]}>
        {item.firstDate} {" - "} {item.lastDate}
      </Text>
      <Text style={[styles.cardText, { color: theme.text, fontSize: 10 }]}>
        {item.transactionsId}
      </Text>
    </TouchableOpacity>
  );

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
            />
            <Text style={{ fontSize: 18, color: theme.text }}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
      {transactions.length == 0 && !loading ? (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Text>There are no past transactions to show</Text>
        </View>
      ) : transactions.length > 0 && !loading ? (
        <FlatList
          style={{
            height: Dimensions.get("window").height,
            paddingTop: 20,
          }}
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.transactionsId}
        />
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.background,
          }}
        >
          <ActivityIndicator
            size={"small"}
            color={theme.gradientStart}
          ></ActivityIndicator>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  card: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 14,
  },
});

export default OldTransections;
