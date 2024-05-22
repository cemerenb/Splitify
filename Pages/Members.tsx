import { RouteProp, useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Share,
  Alert,
  Modal,
  Button,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import {
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaxSpacer, MinSpacer } from "../Utils/Spacers";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import { ThemeContext } from "../Theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  Members: { groupId: string };
};
type MembersRouteProp = RouteProp<RootStackParamList, "Members">;

interface MembersProps {
  route: MembersRouteProp;
}

const Members: React.FC<MembersProps> = ({ route }) => {
  const [count, setCount] = useState(0);
  const [members, setMembers] = useState([]);
  const [memberNames, setMemberNames] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [ownerUid, setOwnerUid] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoadingStatus] = useState(true);
  const [selection, setSelection] = useState(1);

  const [total, setTotal] = useState(0);
  const [admin, setAdminStatus] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const { theme } = useContext(ThemeContext);

  const generateRandomString = async (length = 10) => {
    // Possible characters for the random string
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;

    // Generate a random string of the specified length
    const randomString = Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * charactersLength))
    ).join("");

    return randomString;
  };
  const getMemberNames = async () => {
    setMemberNames([]);
    for (let index = 0; index < members.length; index++) {
      const nameDocRef = doc(FIRESTORE_DB, "users", members[index]);
      let name = await (await getDoc(nameDocRef)).data().name;
      setMemberNames((memberNames) => [...memberNames, name]);
    }
  };
  const getGroupDetails = async () => {
    setTotal(0);
    const docRef = doc(FIRESTORE_DB, "groups", groupId);
    const groupData = await getDoc(docRef);
    const nameDocRef = doc(FIRESTORE_DB, "users", groupData.data().ownerUid);
    setMembers(groupData.data().members ?? []);
    setAdmins(groupData.data().admins ?? []);
    setOwnerUid(groupData.data().ownerUid ?? "");
    setOwnerName((await getDoc(nameDocRef)).data().name);
    if (
      groupData.data().ownerUid == FIREBASE_AUTH.currentUser.uid ||
      groupData.data().admins.includes(FIREBASE_AUTH.currentUser.uid)
    ) {
      console.log("Admin");

      setAdminStatus(true);
    }
    setLoadingStatus(false);
  };

  const transferOwnership = async (uid) => {
    try {
      setModalVisible(true);
      const docRef = doc(FIRESTORE_DB, "groups", groupId);
      await updateDoc(docRef, {
        admins: arrayUnion(uid),
        ownerUid: uid,
      });
      setAdmins((await getDoc(docRef)).data().admins);
      setOwnerUid((await getDoc(docRef)).data().ownerUid);
      // @ts-ignore

      navigation.replace("Members", { groupId: groupId });
      setModalVisible(false);
    } catch (error) {
      Alert.alert("An error occured while transfering ownership");
    }
  };
  const makeAdmin = async (uid) => {
    setModalVisible(true);
    const docRef = doc(FIRESTORE_DB, "groups", groupId);
    await updateDoc(docRef, {
      admins: arrayUnion(uid),
    });
    setAdmins((await getDoc(docRef)).data().admins);
    // @ts-ignore

    navigation.replace("Members", { groupId: groupId });
    setModalVisible(false);
  };
  const revokeAdmin = async (uid) => {
    setModalVisible(true);
    const docRef = doc(FIRESTORE_DB, "groups", groupId);
    const admins = (await getDoc(docRef)).data().admins;
    const updatedAdmins = admins.filter((a) => a !== uid);
    await updateDoc(docRef, {
      admins: updatedAdmins,
    });
    setAdmins(updatedAdmins);
    // @ts-ignore

    navigation.replace("Members", { groupId: groupId });
    setModalVisible(false);
  };
  const deleteGroup = async () => {
    const userUid = FIREBASE_AUTH.currentUser.uid;
    const personalDocRef = doc(FIRESTORE_DB, "personal", userUid);
    const groups = (await getDoc(personalDocRef)).data().groups;

    const udpatedGroups = groups.filter((g) => g !== groupId);
    const data = {
      groups: udpatedGroups,
    };
    await updateDoc(personalDocRef, data);
    const docRef = doc(FIRESTORE_DB, "groups", groupId);
    await deleteDoc(docRef);
    navigation.pop(2);
  };

  const kickUser = async (uid) => {
    setModalVisible(false);
    try {
      const userUid = uid;
      const personalDocRef = doc(FIRESTORE_DB, "personal", userUid);
      const groups = (await getDoc(personalDocRef)).data().groups;
      const udpatedGroups = groups.filter((g) => g !== groupId);

      const docRef = doc(FIRESTORE_DB, "groups", groupId);
      const updatedMembers = members.filter((e) => e !== userUid);
      const updateAdmins = admins.filter((a) => a !== userUid);

      const newGroups = {
        groups: udpatedGroups,
      };

      const newData = {
        members: updatedMembers,
        admins: updateAdmins,
      };

      await updateDoc(docRef, newData);
      await updateDoc(personalDocRef, newGroups);
      await getGroupDetails();
      await getMemberNames();
      // @ts-ignore
      navigation.replace("Members", { groupId: groupId });
    } catch (error) {
      Alert.alert("An error occured");
    }
  };

  const leaveGroup = async () => {
    const userUid = FIREBASE_AUTH.currentUser.uid;
    const personalDocRef = doc(FIRESTORE_DB, "personal", userUid);
    const groups = (await getDoc(personalDocRef)).data().groups;
    const udpatedGroups = groups.filter((g) => g !== groupId);

    const docRef = doc(FIRESTORE_DB, "groups", groupId);
    const updatedMembers = members.filter((e) => e !== userUid);
    const updateAdmins = admins.filter((a) => a !== userUid);
    const randomNumber =
      Math.floor(Math.random() * (updatedMembers.length - 1 - 0 + 1)) + 0;
    const newGroups = {
      groups: udpatedGroups,
    };
    const newOwner = {
      ownerUid: updatedMembers[randomNumber],
      members: updatedMembers,
      admins: updateAdmins,
    };
    const newData = {
      members: updatedMembers,
      admins: updateAdmins,
    };
    if (ownerUid == userUid) {
      await updateDoc(docRef, newOwner);
      await updateDoc(personalDocRef, newGroups);
      await updateDoc(docRef, {
        admins: arrayUnion(updatedMembers[randomNumber]),
      });
    } else {
      await updateDoc(docRef, newData);
      await updateDoc(personalDocRef, newGroups);
    }

    navigation.pop(2);
  };

  const onShare = async () => {
    try {
      const code = await generateRandomString();
      const docRef = doc(FIRESTORE_DB, "invites", code);
      const data = {
        groupId: groupId,
        timeStamp: new Date().getTime() + 86400000,
        used: false,
      };
      setDoc(docRef, data);
      const result = await Share.share({
        message: code,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  useEffect(() => {
    getMemberNames();
  }, [members]);
  useLayoutEffect(() => {
    if (count == 0) {
      getGroupDetails();
      AsyncStorage.getItem("themeMode").then((value) => {
        setSelection(value == "dark" ? 2 : value == "light" ? 1 : 0);
        console.log(value == "dark" ? 2 : value == "light" ? 1 : 0);
      });

      setCount(1);
    }
  }, []);
  const FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 0.4,
          width: Dimensions.get("window").width - 60,
          paddingLeft: 20,
          marginLeft: 10,
          backgroundColor: theme.shadow,
        }}
      />
    );
  };
  const { groupId } = route.params;
  if (memberNames.length < members.length) {
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
  } else if (memberNames.length === members.length && members.length > 0) {
    return (
      <SafeAreaView
        style={{ backgroundColor: theme.background, paddingTop: 50, flex: 1 }}
      >
        <ScrollView>
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: theme.secondary,
                    width: Dimensions.get("window").width * 0.85,
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    width: Dimensions.get("window").width * 0.7,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={30} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 22, color: theme.text }}>
                  {memberNames[members.indexOf(selectedUser)]}
                </Text>
                <Text style={{ fontSize: 12, color: theme.text }}>
                  {selectedUser}
                </Text>

                <View
                  style={{
                    marginTop: 30,
                    borderRadius: 20,
                    backgroundColor: theme.third,
                    width: Dimensions.get("window").width * 0.8 - 40,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedUser == ownerUid) {
                        Alert.alert(
                          "",
                          "You cannot kick group owner",
                          [
                            {
                              text: "Okay",
                              onPress: () => {
                                setModalVisible(false);
                              },
                              style: "cancel",
                            },
                          ],
                          { cancelable: true }
                        );
                      } else {
                        kickUser(selectedUser);
                      }
                    }}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 20,
                      paddingVertical: 20,
                    }}
                  >
                    <Text style={{ color: theme.text, fontSize: 18 }}>
                      Kick User
                    </Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      height: 0.5,
                      backgroundColor: "rgba(50,50,50,0.3)",
                      width: "100%",
                    }}
                  ></View>
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedUser == ownerUid) {
                        Alert.alert(
                          "",
                          "You cannot change the group owner's permissions",
                          [
                            {
                              text: "Okay",
                              onPress: () => {
                                setModalVisible(false);
                              },
                              style: "cancel",
                            },
                          ],
                          { cancelable: true }
                        );
                      } else {
                        admins.includes(selectedUser)
                          ? revokeAdmin(selectedUser)
                          : makeAdmin(selectedUser);
                      }
                    }}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 20,
                      paddingVertical: 20,
                    }}
                  >
                    <Text style={{ color: theme.text, fontSize: 18 }}>
                      {admins.includes(selectedUser)
                        ? "Revoke Admin"
                        : "Make Admin"}
                    </Text>
                  </TouchableOpacity>
                  {FIREBASE_AUTH.currentUser.uid == ownerUid ? (
                    <View>
                      <View
                        style={{
                          height: 0.5,
                          backgroundColor: "rgba(50,50,50,0.3)",
                          width: "100%",
                        }}
                      ></View>
                      <TouchableOpacity
                        onPress={async () => {
                          Alert.alert(
                            "",
                            "Are you sure you want to transfer ownership?",
                            [
                              {
                                text: "Cancel",
                                onPress: () => {},
                              },
                              {
                                text: "Transfer",
                                onPress: async () => {
                                  await transferOwnership(selectedUser);
                                },
                                style: "default",
                              },
                            ],
                            { cancelable: true }
                          );
                        }}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingHorizontal: 20,
                          paddingVertical: 20,
                        }}
                      >
                        <Text style={{ color: theme.text, fontSize: 18 }}>
                          Transfer Ownership
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View></View>
                  )}
                </View>
              </View>
            </View>
          </Modal>
          <View style={{ paddingBottom: 20 }}>
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
                  color={theme.text}
                  name="chevron-back-outline"
                  size={30}
                ></Ionicons>
                <Text style={{ color: theme.text, fontSize: 18 }}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
          {admin ? (
            <View
              style={{
                width: Dimensions.get("window").width - 40,
                marginLeft: 20,
                borderRadius: 20,
                backgroundColor: theme.primary,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 15,
                }}
                onPress={() => {
                  onShare();
                }}
              >
                <Ionicons
                  color={theme.text}
                  name="scan-outline"
                  size={30}
                ></Ionicons>
                <Text
                  style={{ color: theme.text, fontSize: 20, paddingLeft: 10 }}
                >
                  Scan QR code
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  height: 0.3,
                  width: "100%",
                  backgroundColor: theme.text,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              ></View>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 15,
                }}
                onPress={() => {
                  onShare();
                }}
              >
                <Ionicons
                  color={theme.text}
                  name="link-outline"
                  size={30}
                ></Ionicons>
                <Text
                  style={{ color: theme.text, fontSize: 20, paddingLeft: 10 }}
                >
                  Share invite code
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ backgroundColor: theme.background }}></View>
          )}
          <MaxSpacer></MaxSpacer>

          {admins.includes(FIREBASE_AUTH.currentUser.uid) ? (
            <FlatList
              ItemSeparatorComponent={FlatListItemSeparator}
              scrollEnabled={false}
              style={{
                width: Dimensions.get("window").width - 40,
                marginLeft: 20,
                borderRadius: 20,
                backgroundColor: theme.primary,
              }}
              data={members} // List data
              keyExtractor={(item) => item} // Use groupId as unique key
              renderItem={({ index, item }) => (
                <TouchableOpacity
                  onPress={() => {
                    if (item != FIREBASE_AUTH.currentUser.uid) {
                      setModalVisible(true);
                      setSelectedUser(item);
                    }
                  }}
                  disabled={
                    item == FIREBASE_AUTH.currentUser.uid ? true : false
                  }
                >
                  <View
                    style={{
                      height: 55,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: theme.text, fontSize: 20 }}>
                      {memberNames[index]}
                    </Text>
                    {members[index] == ownerUid ? (
                      <View
                        style={{
                          width: 60,
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                        }}
                      >
                        <LinearGradient
                          colors={[
                            "rgba(130, 67, 255, 1)",
                            "rgba(221, 50, 52, 1)",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            height: 30,
                            width: 70,
                            borderRadius: 30,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "600" }}>
                            Owner
                          </Text>
                        </LinearGradient>
                      </View>
                    ) : admins.includes(members[index]) &&
                      ownerUid != members[index] ? (
                      <View
                        style={{
                          width: 70,
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                          paddingHorizontal: 10,
                        }}
                      >
                        <Text style={{ color: theme.text, fontSize: 16 }}>
                          Admin
                        </Text>
                      </View>
                    ) : (
                      <View></View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <FlatList
              ItemSeparatorComponent={FlatListItemSeparator}
              scrollEnabled={false}
              style={{
                width: Dimensions.get("window").width - 40,
                marginLeft: 20,
                borderRadius: 20,
                backgroundColor: theme.primary,
              }}
              data={members} // List data
              keyExtractor={(item) => item} // Use groupId as unique key
              renderItem={({ index, item }) => (
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 20,
                      paddingVertical: 20,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{memberNames[index]}</Text>
                    {members[index] == ownerUid ? (
                      <View
                        style={{
                          width: 60,
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                        }}
                      >
                        <LinearGradient
                          colors={[
                            "rgba(130, 67, 255, 1)",
                            "rgba(221, 50, 52, 1)",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            height: 30,
                            width: 70,
                            borderRadius: 30,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "600" }}>
                            Owner
                          </Text>
                        </LinearGradient>
                      </View>
                    ) : admins.includes(members[index]) &&
                      ownerUid != members[index] ? (
                      <View
                        style={{
                          width: 70,
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                          paddingHorizontal: 10,
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>Admin</Text>
                      </View>
                    ) : (
                      <View></View>
                    )}
                  </View>
                </View>
              )}
            />
          )}

          <MaxSpacer></MaxSpacer>
          <View
            style={{
              width: Dimensions.get("window").width - 40,
              marginLeft: 20,
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 20,

                backgroundColor: "rgb(253,60,74)",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 15,
              }}
              onPress={() => {
                if (members.length == 1) {
                  Alert.alert(
                    "Delete Group",
                    "Are you sure you want to delete the group?",
                    [
                      {
                        text: "Cancel",
                        onPress: () => {},
                      },
                      {
                        text: "Delete",
                        onPress: () => {
                          deleteGroup();
                        },
                        style: "destructive",
                      },
                    ],
                    { cancelable: true }
                  );
                } else {
                  Alert.alert(
                    "Leave Group",
                    "Are you sure you want to leave the group?",
                    [
                      {
                        text: "Cancel",
                        onPress: () => {},
                      },
                      {
                        text: "Leave",
                        onPress: () => {
                          leaveGroup();
                        },
                        style: "destructive",
                      },
                    ],
                    { cancelable: true }
                  );
                }
              }}
            >
              {members.length == 1 ? (
                <Ionicons
                  color={"white"}
                  name="close-outline"
                  size={30}
                ></Ionicons>
              ) : (
                <Ionicons
                  color={"white"}
                  name="log-out-outline"
                  size={30}
                ></Ionicons>
              )}

              <Text style={{ color: "white", fontSize: 20, paddingLeft: 10 }}>
                {members.length == 1 ? "Delete Group" : "Leave Group"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  closeButton: {
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: Dimensions.get("window").width * 0.8,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Members;
