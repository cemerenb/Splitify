import React, { useContext, useLayoutEffect, useState } from "react";
import {
  SafeAreaView,
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
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { RouteProp, useNavigation } from "@react-navigation/native";
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

type RootStackParamList = {
  AllGroupExpenses: { groupId: string };
};
type AllGroupExpensesRouteProp = RouteProp<
  RootStackParamList,
  "AllGroupExpenses"
>;

interface AllGroupExpensesProps {
  route: AllGroupExpensesRouteProp;
}

const AllGroupExpenses: React.FC<AllGroupExpensesProps> = ({ route }) => {
  const { groupId } = route.params;

  const [selection, setSelection] = useState(0);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [expensesArray, setArray] = useState([]);
  const [loading, setLoadingStatus] = useState(true);
  const [visible, setVisibility] = useState(false);
  const [dateFirst, setDateFirst] = useState(new Date());
  const [dateLast, setDateLast] = useState(new Date());
  const [expanded, setExpanded] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [rangeSelection, setRangeSelection] = useState(false);
  const { theme } = useContext(ThemeContext);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  const selectionData = [
    { title: "All" },
    { title: "Utilities" },
    { title: "Food & Groceries" },
    { title: "Healthcare" },
    { title: "Entertainment" },
    { title: "Shopping" },
    { title: "Education" },
    { title: "Transportation" },
    { title: "Personal Care" },
    { title: "Miscellaneous" },
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
    console.log(groupId);

    const docRef = doc(FIRESTORE_DB, "groups", groupId);
    const groupData = await getDoc(docRef);

    setArray(groupData.data()?.expenses ?? []);
    setDateFirst(
      new Date(
        groupData.data()?.expenses[
          groupData.data().expenses.length - 1
        ].timeStamp
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
    { label: "Date", value: false },
    { label: "Range", value: true },
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
      <SafeAreaView
        style={{
          backgroundColor: theme.background,
          minHeight: Dimensions.get("window").height,
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
              <Text style={{ fontSize: 18, color: theme.text }}>Back</Text>
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
        <View
          style={{
            backgroundColor: theme.text,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <View style={[styles.datePickersContainer, animationStyle]}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                paddingTop: 20,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                {rangeSelection && (
                  <Text style={{ paddingLeft: 10, color: theme.reverse }}>
                    -
                  </Text>
                )}
                {rangeSelection && (
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
              <View
                style={{
                  width: "29%",
                  paddingRight: 20,
                  paddingLeft: 10,
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <SwitchSelector
                  options={options}
                  initial={0}
                  buttonColor={theme.card}
                  onPress={(value) => {
                    setRangeSelection(value);
                  }}
                />
              </View>
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
                      { borderColor: theme.reverse },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownButtonTxtStyle,
                        { color: theme.reverse },
                      ]}
                    >
                      {selectedItem && selectedItem.title}
                    </Text>
                    <Icon
                      name={isOpened ? "chevron-up" : "chevron-down"}
                      style={[
                        styles.dropdownButtonArrowStyle,
                        { color: theme.reverse },
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
                      backgroundColor: theme.text,
                      ...(isSelected && { backgroundColor: theme.card }),
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemTxtStyle,
                        { color: theme.reverse },
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
                justifyContent: "flex-end",
                marginBottom: 10,
                paddingRight: 20,
              }}
            >
              <Button
                onPress={() => {
                  setFilterActive(true);
                  toggleExpand();
                }}
                title="Clear"
              ></Button>
              <Button
                onPress={() => {
                  setFilterActive(false);
                  toggleExpand();
                }}
                title="Filter"
              ></Button>
            </View>
          </View>
        </View>
        <ScrollView>
          <FlatList
            scrollEnabled={false}
            style={{ width: "100%", paddingHorizontal: 20 }}
            data={expensesArray.filter((item) => {
              // Check if filterActive is true and apply date filtering logic
              if (filterActive) {
                if (rangeSelection) {
                  // If range selection is true, filter by date range
                  const itemDate = new Date(item.date);
                  return (
                    itemDate.getTime() >= dateFirst.getTime() &&
                    itemDate.getTime() <= dateLast.getTime()
                  );
                } else {
                  // If range selection is false, filter by selected date
                  const itemDate = new Date(item.date);
                  const firstDate = new Date(dateFirst);
                  return (
                    itemDate.getDate() === firstDate.getDate() &&
                    itemDate.getMonth() === firstDate.getMonth() &&
                    itemDate.getFullYear() === firstDate.getFullYear()
                  );
                }
              } else {
                // If filterActive is false, apply filtering based on category selection
                return selection === 0 || item.type === selection;
              }
            })}
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
      </SafeAreaView>
    );
  }
};

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
    justifyContent: "flex-start",
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
export default AllGroupExpenses;
