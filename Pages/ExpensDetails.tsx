// ExpenseEntry.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Define the MapData interface
interface MapData {
  imageURL?: string;
  date: string;
  timeStamp: string;
  note: string;
  totalData: number;
}

// Define the navigation props types
type RootStackParamList = {
  ExpenseEntry: { mapData: MapData };
};

type ExpenseEntryRouteProp = RouteProp<RootStackParamList, "ExpenseEntry">;

interface ExpenseEntryProps {
  route: ExpenseEntryRouteProp;
}

// ExpenseEntry component
const ExpenseEntry: React.FC<ExpenseEntryProps> = ({ route }) => {
  const mapData = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Date: {mapData.date}</Text>
      <Text style={styles.text}>Time: {mapData.timeStamp}</Text>
      <Text style={styles.text}>Note: {mapData.note}</Text>
      <Text style={styles.text}>Total Data: {mapData.total}</Text>
      {mapData.imageUrl && (
        <Image source={{ uri: mapData.imageUrl }} style={styles.image} />
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "cover",
    marginTop: 10,
  },
});

export default ExpenseEntry;
