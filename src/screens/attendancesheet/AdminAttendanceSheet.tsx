
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TouchableHighlight, Image, ImageBackground, StyleProp, Alert, Platform, BackHandler } from 'react-native';
import { useAuth } from "context/AuthContext";
import Svg, { LinearGradient, Stop, Rect } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import { ScrollView } from 'react-native';
import { color } from '@rneui/base';
import { ScreenHeight, ScreenWidth } from '@freakycoder/react-native-helpers';
import { ScreenStackHeaderRightView } from 'react-native-screens';
import { setDate } from 'date-fns';
import data from '../../data/data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserWiseTrackingWebView from './Mapview/Userlocation';
import Icon, { IconType } from 'react-native-dynamic-vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useNavigation } from '@react-navigation/native';

interface PunchData {
  in: string;
  out: string;
  in_image: string;
  out_image: string;
  in_latitude?: string;
  in_longitude?: string;
  out_latitude?: string;
  out_longitude?: string;
}

interface ShiftAttendanceItem {
  Year: string;
  attendance: string;
  date: number;
  day: string;
  holiday: number;
  month: string;
  punches: PunchData[];
}

interface AttendanceItem {
  Year: string;
  attandance: string;
  date: number;
  day: string;
  holiday: number;
  in: string;
  in_image: any;
  month: string;
  out: string;
  out_image: any;
  in_latitude?: string;
  in_longitude?: string;
  out_latitude?: string;
  out_longitude?: string;
}

type CameraProps = {
  isActive: any;
  name: string;
};

const AdminAttendanceSheet = ({ isActive, name }: CameraProps) => {
  const navigation = useNavigation();
  const [attendanceData, setAttendanceData] = useState<AttendanceItem[]>([]);
  const [shiftdata, setshiftdata] = useState<ShiftAttendanceItem[]>([]);
  const [showShiftView, setShowShiftView] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { userInfo, isdata } = useAuth();
  const parseData = JSON.parse(userInfo ? userInfo : "{}");
  const fullname = parseData.data?.data?.name;
  const user_ids = isActive;
  const userid = isActive;
  const designation = parseData.data?.data?.designation;
  const currentDate = new Date();

  const previousMonth = currentDate.getMonth();
  const month = previousMonth + 1;
  const [selectedMonth, setSelectedMonth] = useState<string>(`${month}`);
  const [selectedYear, setSelectedYear] = useState<string>(`${currentDate.getFullYear()}`);
  const [totalPresent, setTotalPresent] = useState<number>(0);
  const [totalAbsent, setTotalAbsent] = useState<number>(0);
  const [totalHalfday, setTotalHalfday] = useState<number>(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [selectedTrackingDate, setSelectedTrackingDate] = useState<string>('');

  const [date, setdate] = useState()
  const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);

  const handleImagePress = (img) => {
    console.log("IMAGE CLICK =>", img);

    if (!img) return;

    setSelectedImage(null);

    setTimeout(() => {
      setSelectedImage(img);
      setModalVisible(true);
    }, 100);
  };

  const handleTrackingPress = (day: string, date: number, month: string, year: string, hasCheckout: boolean) => {
    if (!hasCheckout) {
      Alert.alert('No Checkout', 'User has not checked out yet. Tracking map is only available after checkout.');
      return;
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[parseInt(month) - 1];
    const formattedDate = `${day}-${monthName} ${date}, ${year}`;

    setSelectedTrackingDate(formattedDate);
    setTrackingModalVisible(true);
  };

  const months = [
    { label: <Text style={{ color: "black" }}>January</Text>, value: '1' },
    { label: <Text style={{ color: "black" }} >February</Text>, value: '2' },
    { label: <Text style={{ color: "black" }}>March</Text>, value: '3' },
    { label: <Text style={{ color: "black" }}>April</Text>, value: '4' },
    { label: <Text style={{ color: "black" }}>May</Text>, value: '5' },
    { label: <Text style={{ color: "black" }}>June</Text>, value: '6' },
    { label: <Text style={{ color: "black" }}>July</Text>, value: '7' },
    { label: <Text style={{ color: "black" }}>August</Text>, value: '8' },
    { label: <Text style={{ color: "black" }}>September</Text>, value: '9' },
    { label: <Text style={{ color: "black" }}>October</Text>, value: '10' },
    { label: <Text style={{ color: "black" }}>November</Text>, value: '11' },
    { label: <Text style={{ color: "black" }}>December</Text>, value: '12' },
  ];

  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const years = [];

  for (let year = startYear; year <= currentYear; year++) {
    years.push({ label: <Text style={{ color: "black" }}>{year}</Text>, value: year.toString() });
  }

  const getCheckInOutData = async () => {
    try {
      const longitute = await AsyncStorage.getItem("longitute");
      const latitute = await AsyncStorage.getItem("latitute");
      console.log(longitute, latitute)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchAttendanceData();
    getCheckInOutData();
    console.log(isActive);

    const onBackPress = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => backHandler.remove();
  }, [user_ids, isdata, navigation]);

  const fetchAttendanceData = async () => {
    fetchshiftattendanceData();
    setLoading(true);
    try {
      const response = await fetch('https://whiteforcepayroll.com/admin/api/getMonthAttendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: isdata.user_id ? isdata.user_id : userid,
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Error fetching data: Server returned non-JSON response (HTTP ' + response.status + '):', text.substring(0, 200));
        setAttendanceData([]);
        return;
      }

      const json = await response.json();
      if (json.status) {
        setAttendanceData(json.data);

        let present = 0;
        let absent = 0;
        let halfday = 0;
        json.data.forEach((item: AttendanceItem) => {
          if (item.attandance === 'P') {
            present++;
          } else if (item.attandance === 'A' && item.holiday === 0) {
            absent++;
          } else if (item.attandance === 'H' && item.holiday === 0) {
            halfday++;
          }
        });
        setTotalHalfday(halfday)
        setTotalPresent(present);
        setTotalAbsent(absent);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchshiftattendanceData = async () => {
    try {
      const res = await fetch("https://whiteforcepayroll.com/admin/api/getMonthAttendance-new", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: isdata.user_id ? isdata.user_id : userid,
          month: selectedMonth,
          year: selectedYear,
        }),
      })

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Error fetching shift data: Server returned non-JSON response (HTTP ' + res.status + '):', text.substring(0, 200));
        setshiftdata([]);
        return;
      }

      const data = await res.json();
      setshiftdata(data.data || []);
      console.log("shift", data)
    } catch (err) {
      console.log(err)
    }
  }

  const renderShiftItem = ({ item }: { item: ShiftAttendanceItem }) => {
    const formattedDate = `${item.date}`;
    let attendanceStatus = '';

    if (item.attendance === 'P') {
      attendanceStatus = 'P';
    } else if (item.attendance === 'H' && item.holiday === 0) {
      attendanceStatus = 'H';
    } else if (item.attendance === 'A' && item.holiday === 0) {
      attendanceStatus = 'A';
    } else {
      attendanceStatus = '__';
    }

    const hasAnyCheckout = item.punches && item.punches.some(punch => punch.out);

    return (
      <View style={styles.shiftRow}>
        <View style={styles.shiftDateCell}>
          <Text style={styles.shiftDateText}>{item.day}, {formattedDate}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={styles.shiftAttendanceText}>{attendanceStatus}</Text>
            {hasAnyCheckout && (
              <TouchableOpacity
                onPress={() => handleTrackingPress(item.day, item.date, item.month, item.Year, true)}
                style={styles.mapIconBtn}
              >
                <Icon name="map-marker-alt" type="FontAwesome5" size={14} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.punchesContainer}>
          {item.punches && item.punches.length > 0 ? (
            [...item.punches].reverse().map((punch, index) => (
              <View key={index} style={styles.punchRow}>
                <View style={styles.punchItem}>
                  <Text style={styles.punchLabel}>#{index + 1}. In: </Text>
                  <Text style={styles.punchTime}>{punch.in || "__"}</Text>
                </View>
                <View style={styles.punchItem}>
                  <Text style={styles.punchLabel}>Out: </Text>
                  <Text style={styles.punchTime}>{punch.out || "__"}</Text>
                </View>
                <View style={styles.imageContainer}>
                  <TouchableOpacity onPress={() => punch.in ? handleImagePress(punch.in_image) : null}>
                    {punch.in ? (
                      <Image
                        source={{ uri: punch.in_image }}
                        style={styles.punchImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={require("../../assets/images/camera/vector.webp")}
                        style={styles.punchImage}
                        resizeMode="cover"
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => punch.out ? handleImagePress(punch.out_image) : null}>
                    {punch.out ? (
                      <Image
                        source={{ uri: punch.out_image }}
                        style={styles.punchImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={require("../../assets/images/camera/vector.webp")}
                        style={styles.punchImage}
                        resizeMode="cover"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noPunchText}>No punches recorded</Text>
          )}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: AttendanceItem }) => {
    const formattedDate = `${item.date}`;
    let attendanceStatus = '';
    if (item.attandance === 'P') {
      attendanceStatus = 'P';
    } else if (item.attandance === 'H' && item.holiday === 0) {
      attendanceStatus = 'H';
    } else if (item.attandance === 'A' && item.holiday === 0) {
      attendanceStatus = 'A';
    } else {
      attendanceStatus = '__';
    }

    const hasCheckout = !!item.out;

    return (
      <View style={styles.row}>
        <View style={styles.cellDate}>
          <Text style={styles.cellText}>{item.day}, {formattedDate}</Text>
        </View>
        <View style={styles.cellStatus}>
          <Text style={styles.cellText}>{attendanceStatus}</Text>
        </View>
        <View style={styles.cellTime}>
          <Text style={styles.cellText}>{item.in ? item.in : "__"}</Text>
        </View>
        <View style={styles.cellTime}>
          <Text style={styles.cellText}>{item.out ? item.out : "__"}</Text>
        </View>
        <View style={styles.cellImage}>
          <TouchableOpacity onPress={() => item.in ? handleImagePress(item.in_image) : null}>
            {item.in ? (
              <Image
                source={{ uri: item.in_image }}
                style={styles.imageCell}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("../../assets/images/camera/vector.webp")}
                style={styles.imageCell}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.cellImage}>
          <TouchableOpacity onPress={() => item.out ? handleImagePress(item.out_image) : null}>
            {item.out ? (
              <Image
                source={{ uri: item.out_image }}
                style={styles.imageCell}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("../../assets/images/camera/vector.webp")}
                style={styles.imageCell}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.cellTracking}>
          {hasCheckout ? (
            <TouchableOpacity
              onPress={() => handleTrackingPress(item.day, item.date, item.month, item.Year, hasCheckout)}
              style={styles.mapIconBtn}
            >
              <Icon name="map-marker-alt" type="FontAwesome5" size={14} color="white" />
            </TouchableOpacity>
          ) : (
            <Text style={{ color: '#ccc', fontSize: 11 }}>—</Text>
          )}
        </View>
      </View>
    );
  };

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerCellDate}>
        <Text style={styles.headerText}>Date</Text>
      </View>
      <View style={styles.headerCellStatus}>
        <Text style={styles.headerText}>Status</Text>
      </View>
      <View style={styles.headerCellTime}>
        <Text style={styles.headerText}>In</Text>
      </View>
      <View style={styles.headerCellTime}>
        <Text style={styles.headerText}>Out</Text>
      </View>
      <View style={styles.headerCellImage}>
        <Text style={styles.headerText}>In Image</Text>
      </View>
      <View style={styles.headerCellImage}>
        <Text style={styles.headerText}>Out Image</Text>
      </View>
      <View style={styles.headerCellTracking}>
        <Text style={styles.headerText}>Tracking</Text>
      </View>
    </View>
  );

  const ShiftHeader = () => (
    <View style={styles.shiftHeader}>
      <Text style={styles.shiftHeaderText}>Date & Status</Text>
      <Text style={styles.shiftHeaderTextLast}>Punch Records</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ---------------- Back Arrow Button ---------------- */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 50 : 35,
          left: 16,
          zIndex: 999,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.22)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name="arrow-back"
          type={IconType.Ionicons}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      <Svg height="100%" width="100%" style={{ position: 'absolute', top: 0, left: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <LinearGradient id="gradient1" x1="40%" y1="0%" x2="40%" y2="70%">
          <Stop offset="0%" stopColor="#0C322D" stopOpacity="1" />
          <Stop offset="50%" stopColor="#17533F" stopOpacity="0.9" />
        </LinearGradient>

        <Rect x="0" y="0" width="100%" height="100%" fill="url(#gradient1)" />
        <View style={{ width: ScreenWidth * 1, height: "100%", backgroundColor: "transparent", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: ScreenWidth * 0.4, height: "100%", marginTop: ScreenHeight * 0.15, alignItems: "center" }} >
            <View style={{ alignItems: "center", flexDirection: "column", gap: 15 }}>
              <View>
                <View style={{ width: ScreenWidth * 1, justifyContent: "center", display: "flex", flexDirection: "row" }}>
                  <Text style={{ color: "white", fontSize: 28, textTransform: "capitalize", fontWeight: "600" }}>{isdata.name}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Svg>

      <View style={{ flex: 1, marginTop: ScreenHeight * 0.14 }}>
        <View style={{ display: "flex", width: ScreenWidth * 1, flexDirection: "row", justifyContent: "center", gap: 20 }}>
          <TouchableOpacity style={{ width: ScreenWidth * 0.27, backgroundColor: "#B3C3BF", height: ScreenHeight * 0.034, borderWidth: 1, borderColor: "rgb(20, 77, 68)", alignItems: "center", gap: 15, display: "flex", flexDirection: "row", marginTop: 50, borderRadius: ScreenWidth * 1, justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 100, height: 200 }, shadowOpacity: 0, shadowRadius: 1.84, elevation: 10 }} onPress={() => setIsMonthModalVisible(true)}>
            <View>
              <Text style={{ fontWeight: "700" }}>
                {months.find((month) => month.value === selectedMonth)?.label}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ backgroundColor: "#B3C3BF", height: ScreenHeight * 0.034, alignItems: "center", borderWidth: 1, borderColor: "rgb(20, 77, 68)", gap: 15, display: "flex", flexDirection: "row", marginTop: 50, width: ScreenWidth * 0.27, justifyContent: "center", borderRadius: ScreenWidth * 1 }} onPress={() => setIsYearModalVisible(true)}>
            <View>
              <Text style={{ fontWeight: "700" }} onPress={() => setIsYearModalVisible(true)}>
                {years.find((month) => month.value === selectedYear)?.label}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={fetchAttendanceData}>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, height: ScreenHeight * 0.034, backgroundColor: "#315947", borderWidth: ScreenWidth * 0.001, borderColor: "white", width: ScreenWidth * 0.27, display: "flex", alignItems: "center", marginTop: 50, borderRadius: ScreenWidth * 1 }}>
              <Image style={{ width: 14, height: 14 }} source={require("../../assets/../assets/images/camera/share.png")} />
              <Text style={{ color: "white", textTransform: "capitalize", fontSize: 15 }}>Submit </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{
          backgroundColor: 'white',
          flex: 1,
          paddingTop: 30,
          padding: ScreenWidth * 0.02,
          borderColor: 'rgb(29,91,65)',
          borderTopRightRadius: 30,
          borderTopLeftRadius: 30,
          marginTop: ScreenHeight * 0.04,
        }}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "black" }}> <Text style={{ color: 'rgb(29,91,65)' }}>A</Text>ttendance Table</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10, marginBottom: 5 }}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !showShiftView && styles.toggleButtonActive
              ]}
              onPress={() => setShowShiftView(false)}
            >
              <Text style={[
                styles.toggleButtonText,
                !showShiftView && styles.toggleButtonTextActive
              ]}>
                Simple
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                showShiftView && styles.toggleButtonActive
              ]}
              onPress={() => setShowShiftView(true)}
            >
              <Text style={[
                styles.toggleButtonText,
                showShiftView && styles.toggleButtonTextActive
              ]}>
                Shift
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centeredContainer}>
              <LottieView
                loop
                autoPlay
                source={require("../.././../assets/camera/loaers.json")}
                style={{ width: ScreenWidth * 0.3, height: ScreenHeight * 0.2 }}
              />
            </View>
          ) : (
            <>
              {(showShiftView ? shiftdata.length : attendanceData.length) === 0 ? (
                <Image style={styles.attendancescreen} />
              ) : (
                <>
                  <View style={styles.tableBackground}>
                    {showShiftView ? (
                      <>
                        <ShiftHeader />
                        <FlatList
                          data={shiftdata}
                          keyExtractor={(item, index) => `${item.date}-${index}`}
                          renderItem={renderShiftItem}
                        />
                      </>
                    ) : (
                      <>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View>
                            <Header />
                            <FlatList
                              data={attendanceData}
                              renderItem={renderItem}
                              keyExtractor={(item, index) => `${item.date}-${index}`}
                            />
                          </View>
                        </ScrollView>
                      </>
                    )}


                  </View>
                </>
              )}
            </>
          )}
          {/* Zoomable Image Modal */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => {
              setModalVisible(false);
              setSelectedImage(null);
            }}
          >
            <ImageViewer
              imageUrls={selectedImage ? [{ url: selectedImage }] : []}
              enableSwipeDown
              onSwipeDown={() => {
                setModalVisible(false);
                setSelectedImage(null);
              }}
              onCancel={() => {
                setModalVisible(false);
                setSelectedImage(null);
              }}
              saveToLocalByLongPress={false}
              renderIndicator={() => null}
              backgroundColor="rgba(0,0,0,0.95)"
              renderHeader={() => (
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedImage(null);
                  }}
                >
                  <Icon name="close" size={28} color="#fff" />
                </TouchableOpacity>
              )}
            />
          </Modal>

          <Modal
            visible={trackingModalVisible}
            transparent={false}
            animationType="slide"
            onRequestClose={() => setTrackingModalVisible(false)}
          >
            <View style={styles.trackingModalContainer}>
              <View style={styles.trackingModalHeader}>
                <Text style={styles.trackingModalTitle}>Location Tracking</Text>
                <TouchableOpacity onPress={() => setTrackingModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              {selectedTrackingDate && (
                <UserWiseTrackingWebView
                  userId={isdata.user_id ? isdata.user_id : userid}
                  date={selectedTrackingDate}
                />
              )}
            </View>
          </Modal>

          <Modal
            transparent={true}
            visible={isMonthModalVisible}
            onRequestClose={() => setIsMonthModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <FlatList
                  data={months}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableHighlight
                      onPress={() => {
                        setSelectedMonth(item.value);
                        setIsMonthModalVisible(false);
                      }}
                      style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd', backgroundColor: month.toString() === item.value ? "#e6e6e6" : "white" }}
                    >
                      <Text>{item.label}</Text>
                    </TouchableHighlight>
                  )}
                />
              </View>
            </View>
          </Modal>

          <Modal
            transparent={true}
            visible={isYearModalVisible}
            onRequestClose={() => setIsYearModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <FlatList
                  data={years}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableHighlight
                      onPress={() => {
                        setSelectedYear(item.value);
                        setIsYearModalVisible(false);
                      }}
                      style={styles.modalOption}
                    >
                      <Text>{item.label}</Text>
                    </TouchableHighlight>
                  )}
                />
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: ScreenWidth * 1
  },
  attendancescreen: {
    width: 400,
    height: 400,
    alignSelf: 'center',
    marginTop: 120,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableBackground: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  // Fixed Header Styles
  header: {
    flexDirection: 'row',
    backgroundColor: "rgb(29,91,65)",
    borderRadius: 5,
    marginTop: ScreenHeight * 0.01,
  },
  headerText: {
    fontWeight: '600',
    textAlign: 'center',
    color: "white",
    fontSize: 13,
  },
  headerCellDate: {
    width: 100,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  headerCellStatus: {
    width: 60,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  headerCellTime: {
    width: 70,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  headerCellImage: {
    width: 70,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  headerCellTracking: {
    width: 70,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Fixed Row Styles
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cellText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  cellDate: {
    width: 100,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellStatus: {
    width: 60,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellTime: {
    width: 70,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellImage: {
    width: 70,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellTracking: {
    width: 70,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapIconBtn: {
    backgroundColor: 'rgb(29,91,65)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  imageCell: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    width: '80%',
    maxHeight: '70%',
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalContainers: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullScreenImage: {
    width: ScreenWidth * 0.9,
    height: ScreenHeight * 0.6,
    borderRadius: 10,
  },

  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
  // Toggle button styles
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    minWidth: 80,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: 'rgb(29,91,65)',
  },
  toggleButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  // Shift view styles
  shiftHeader: {
    flexDirection: 'row',
    borderRadius: 5,
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: ScreenHeight * 0.01,
    height: ScreenWidth * 0.11,
  },
  shiftHeaderText: {
    display: "flex",
    flex: 1,
    fontWeight: '500',
    textAlign: 'center',
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    height: ScreenHeight * 0.038,
    paddingVertical: 7,
    fontSize: 14,
    backgroundColor: "rgb(29,91,65)",
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  shiftHeaderTextLast: {
    display: "flex",
    flex: 1,
    fontWeight: '500',
    textAlign: 'center',
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    height: ScreenHeight * 0.038,
    paddingVertical: 7,
    fontSize: 14,
    backgroundColor: "rgb(29,91,65)",
  },
  shiftRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  shiftDateCell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  shiftDateText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
  },
  shiftAttendanceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgb(29,91,65)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
  },
  punchesContainer: {
    paddingLeft: 10,
  },
  punchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
  },
  punchItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  punchLabel: {
    color: '#666',
    fontSize: 12,
    marginRight: 5,
  },
  punchTime: {
    color: 'black',
    fontSize: 13,
    fontWeight: '600',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  punchImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noPunchText: {
    color: '#999',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  trackingModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  trackingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgb(29,91,65)',
    elevation: 5,
  },
  trackingModalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
});

export default AdminAttendanceSheet;