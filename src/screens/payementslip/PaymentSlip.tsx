import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, FlatList, Alert, StyleSheet, Modal, StyleProp, Image, Touchable } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { Picker } from '@react-native-picker/picker';
import LottieView from 'lottie-react-native';
import { TouchableHighlight } from 'react-native'; // Add this import

import { WebView } from 'react-native-webview';
// import Toast from 'react-native-toast-message';kjkkj
import { ScreenHeight, ScreenWidth } from '@freakycoder/react-native-helpers';
import Svg, { LinearGradient, Stop, Rect } from 'react-native-svg';
import { useAuth } from 'context/AuthContext';
import { getDate } from 'date-fns';
import { URLS } from '../../shared/constants/index';
import { color } from '@rneui/base';
const PaymentSlip : React.FC = () => {
  const [responseData, setResponseData] = useState(null);
  const currentDate = new Date()
  const previousMonth = currentDate.getMonth() === 0 ? 12 : currentDate.getMonth()
   const [selectedMonth, setSelectedMonth] = useState<string>(`${previousMonth}`);
    const [selectedYear, setSelectedYear] = useState<string>(`${new Date().getFullYear()}`);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false); // For showing the WebView modal
  // const [show, setShow] = useState('No payslip available.');
  const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);
    const [isYearModalVisible, setIsYearModalVisible] = useState(false);
    const [isWebViewVisible, setIsWebViewVisible] = useState(false);
    const [url, setUrl] = useState('');
  
 const { userInfo} = useAuth();
const months = [
    { label: <Text style={{color:"black"}}>January</Text>, value: '1' },
    { label:<Text style={{color:"black"}} >February</Text> , value: '2' },
    { label:  <Text style={{color:"black"}}>March</Text>, value: '3' },
    { label: <Text style={{color:"black"}}>April</Text> , value: '4' },
    { label: <Text style={{color:"black"}}>May</Text>, value: '5' },
    { label:  <Text style={{color:"black"}}>June</Text>, value: '6' },
    { label: <Text style={{color:"black"}}>July</Text> , value: '7' },
    { label: <Text style={{color:"black"}}>August</Text>, value: '8' },
    { label: <Text style={{color:"black"}}>September</Text>, value: '9' },
    { label: <Text style={{color:"black"}}>October</Text>, value: '10' },
    { label: <Text style={{color:"black"}}>November</Text>, value: '11' },
    { label: <Text style={{color:"black"}}>December</Text>, value: '12' },
  ];
  const currentYear = new Date().getFullYear(); // Get the current year
  const startYear = 2020; // Define the start year
  const years = [];
 // Use a loop to generate the years
 for (let year = startYear; year <= currentYear; year++) {
   years.push({ label: <Text style={{ color: "black" }}>{year}</Text>, value: year.toString() });
 }

  const parseData = JSON.parse(userInfo ? userInfo : {});
   const imagesource= parseData.data?.data?.image ;
   const fullname=parseData.data?.data?.name;
    const  user_ids=parseData["data"]?.user_id 
    const userid=parseData?.data?.data?.user_id;
   const designation=parseData.data?.data?.designation;
   const designations =parseData["data"]. designation? parseData["data"].designation :designation
   const [noPayslipAvailable, setNoPayslipAvailable] = useState(false);
   const fetchPayslip = (userId: number) => {
    fetch('https://whiteforcepayroll.com/admin/api/all-payslip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.data && Object.keys(data.data).length > 0) {
          setResponseData(data);
          setNoPayslipAvailable(false);
        } else {
          setNoPayslipAvailable(true);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setNoPayslipAvailable(true);
      });
  };
  

  const downloadPayslip = async () => {
    const payId = selectedPayslipUrl?.payroll_id; // Ensure it's not null or undefined
    const url = `https://whiteforcepayroll.com/admin/employee/downloadSinglePayslip?pay_id=${payId}`;
    setUrl(url);
    setIsWebViewVisible(true); // Show the WebView
    console.log("dfsdfsd",payId)
    
  };
  const openpayslip=()=>{
    setIsPreviewVisible(true) ;
     setUrl("")
     console.log("mygf",url)
  }
  useEffect(() => {
    fetchPayslip(user_ids?user_ids:userid); // Replace with dynamic user ID as needed
   console.log("fer",isWebViewVisible)
 
   
  }, []);

  const selectedPayslipKey = `${selectedMonth},${selectedYear}`;

  const selectedPayslipUrl = responseData?.data[selectedPayslipKey];
  // console.log(selectedMonth,selectedYear)
console.log("url dataa",selectedPayslipUrl)

  return (
    <View style={{ flex: 1 }}>
      <Svg height="100%" width="100%" style={{ position: 'absolute', top: 0, left: 0, display:"flex", justifyContent:"center", alignItems:"center"}}>
        <LinearGradient id="gradient1" x1="40%" y1="0%" x2="40%" y2="70%">
          <Stop offset="0%" stopColor="#0C322D" stopOpacity="1" />
          
          <Stop offset="50%" stopColor="#17533F" stopOpacity="0.9" />
        </LinearGradient>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#gradient1)" />
       <View  style={{width:ScreenWidth*1 ,height:"100%", backgroundColor:"transparent", flexDirection:"row", justifyContent:"center",alignItems:"center"}}>
       <View style={{width:ScreenWidth*1 ,  height:"100%", marginTop:ScreenHeight*0.2, alignItems:"center"}} >
       <View style={{alignItems:"center", flexDirection:"column", gap:15}}>
       <Image
               resizeMode="cover"
               source={{ uri: parseData["data"].image?parseData["data"].image:imagesource }}
               style={{  width: ScreenWidth * 0.2, 
                height: ScreenWidth * 0.2,
                borderRadius: ScreenWidth * 1,}}
             />
     
                                <View style={{ width:ScreenWidth*1,justifyContent:"center",display:"flex" ,flexDirection:"row"}}>
                                <Text  style={{color:"white", fontSize:25, textTransform:"capitalize" , fontWeight:"600"}}>{fullname?fullname:parseData["data"].name}</Text>
            
                                </View>
                             <View  style={{flexDirection:"row", display:"flex", alignItems:"center",justifyContent:"center", gap:8}}>
                             <Image  resizeMode='contain' style={{width:15,height:15}} source={require("../../assets/../assets/images/camera/verified.png")} />
                             
                             <Text style={{color:"white", fontSize:15 ,textTransform:"capitalize",fontWeight:"600"}}>{designations?designations:"your designation"}
                             </Text>
                             </View>
                          
           <View style={{backgroundColor:"#C3C3C3" , alignItems:"center", marginTop:15, height:ScreenHeight*0.038, width:ScreenWidth*0.5, justifyContent:"center", gap:10, display:"flex", flexDirection:"row",borderRadius:ScreenWidth*1}}>
           <Image style={{width:20,height:20}} source={require("../../assets/../assets/images/camera/chatting.png")} />
           <Text style={{color:"black", fontWeight:"700", textTransform:"capitalize", fontSize:14}}>your total Payslip </Text>
           </View>
       </View>

</View>
       </View>
      </Svg>

      {/* <Toast ref={(ref) => Toast.setRef(ref)} /> */}
      <View
        style={{
          // marginTop: ScreenHeight * 0.1,
          // width: ScreenWidth * 1,
          // height: ScreenHeight * 0.2,
         
        }}
      ></View>

      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
         
          borderColor: 'rgb(29,91,65)',
          borderTopRightRadius: 30,
          borderTopLeftRadius: 20,
          marginTop: ScreenHeight * 0.4,
 overflow:"scroll"
        }}
      >
        <Text style={styles.headerText}>Get your <Text style={{color: 'rgb(29,91,65)'}}>P</Text>ayslip</Text>
        <View style={styles.container}>
          {/* Month Picker */}
       <View style={{height:ScreenHeight*0.2, display:"flex" ,justifyContent:"center" ,}}>
           <View style={styles.dropdown}>
                    
                    <TouchableOpacity onPress={() => setIsMonthModalVisible(true)}>
                      <Text style={styles.selectedValue}>
                        {months.find((month) => month.value === selectedMonth)?.label}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dropdown}>
                           
                            <TouchableOpacity onPress={() => setIsYearModalVisible(true)}>
                            <Text style={styles.selectedValue}>
                                {years.find((month) => month.value === selectedYear)?.label}
                              </Text>
                               {/* <Text style={styles.selectedValue}>{selectedYear}</Text> */}
                            </TouchableOpacity>
                          </View>
                          <View  style={{width:ScreenWidth*1, display:"flex",   justifyContent:"center" ,alignItems:"center"}}>
                            <Text style={{width:ScreenWidth*0.4 ,marginTop:ScreenHeight*0.02  , marginRight:ScreenWidth*0.06, height:ScreenHeight*0.002 ,backgroundColor:'rgb(29,91,65)'}}></Text>
                          </View>
       </View>
          {/* Year Picker */}
          

          {/* Display Selected Payslip */}
          {noPayslipAvailable ? (
 <View>
   <Text  style={{ textAlign: 'center', marginTop: 20, fontSize: 16 ,color:"black" }}>
    Payslip is coming soon..
  </Text>
  </View>
):(
          selectedPayslipUrl ? (
            <View style={{display:"flex", flexDirection:"row", justifyContent:"center", gap:10, alignItems:"center",  marginLeft:ScreenWidth*0.03}}>
              <TouchableOpacity
                onPress={openpayslip}
                style={styles.previewButton}
              >
                <Text style={styles.previewButtonText}>Preview</Text>
                <Image style={{width:20,height:20}} source={require("../../assets/../assets/images/camera/download.png")} />
              </TouchableOpacity>

              {/* <TouchableOpacity
                onPress={() => downloadPayslip(selectedPayslipUrl)}
                style={styles.downloadButton}
              >
                <Text style={styles.downloadButtonText}>Download</Text>
                <Image style={{width:20,height:20}} source={require("../../../../assets/images/camera/download.png")} />
              </TouchableOpacity> */}
            </View>
          ) : (
            <View style={{
             width:ScreenWidth*1,alignItems:"center"
            }}>
             
              {/* <LottieView
                                            loop
                                            autoPlay
                                            source={require("../../../../assets/images/camera/errorpayslip.json")}
                                            style={{width:ScreenWidth*0.4,height:ScreenHeight*0.1}}
                                          /> */}
                                          <Text style={{marginRight:35,color:"black",fontWeight:"900"}} >No Payslip for  {months.find((month) => month.value === selectedMonth)?.label}  {years.find((month) => month.value === selectedYear)?.label}</Text>
            </View>
          ))}
 <Modal
        transparent={true}
        visible={isMonthModalVisible}
        onRequestClose={() => setIsMonthModalVisible(false)}
      >
        <View style={styles.modalContainers}>
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
                  style={styles.modalOption}
                >
                  <Text>{item.label}</Text>
                </TouchableHighlight>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Year Selection Modal */}
      <Modal
        transparent={true}
        visible={isYearModalVisible}
        onRequestClose={() => setIsYearModalVisible(false)}
      >
        <View style={styles.modalContainers}>
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
          {/* WebView Modal */}
          <Modal visible={isPreviewVisible} animationType="slide" onRequestClose={() => setIsPreviewVisible(false)}>
            <View style={styles.modalContainer}>
             <View style={styles.viewhearder}>
             <TouchableOpacity style={styles.closeButton} onPress={() => setIsPreviewVisible(false)}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
     
              
      <TouchableOpacity
                onPress={downloadPayslip}
                style={styles.previewButtons}
              >
                {/* <Text style={styles.previewButtonText}>Download</Text> */}
                <Image style={{width:20,height:20}} source={require("../../assets/../assets/images/camera/download.png")} />
              </TouchableOpacity>
             </View>

               {/* <TouchableOpacity
                onPress={() => downloadPayslip(selectedPayslipUrl)}
                style={styles.downloadButton}
              >
                <Text style={styles.downloadButtonText}>Download</Text>
                <Image style={{width:20,height:20}} source={require("../../../../assets/images/camera/download.png")} />
              </TouchableOpacity> */}
              {selectedPayslipUrl && (
                <WebView
                  source={{ uri: selectedPayslipUrl?.url }}
                  style={styles.webview}
                  onError={(err) => {
                    console.error('WebView Error:', err);
                    Alert.alert('Error', 'Failed to load the preview.');
                  }}
                />

              )}
             
        <View style={{height:300, display:"none", width:20,}}>
        <WebView
          source={{ uri: isWebViewVisible?url:"" }}
          style={{  backgroundColor :"transparent"  }}
         
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
    // marginTop: ScreenWidth * 0.01,
    backgroundColor: 'white',
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color:"black",
    marginTop:ScreenHeight*0.05,
    
   
  },
  viewhearder:{
display:"flex",
justifyContent:"space-between" ,
width:ScreenWidth,
// backgroundColor:"red",
flexDirection:"row",
alignItems:"center"
  },
  picker: {
    backgroundColor: '#F4F4F4', // Light grey background
    borderRadius: 8, // Rounded corners
    height: 50, // Fixed height for vertical centering
    marginVertical: 10, // Spacing between pickers
    paddingHorizontal: 10, // Padding for better appearance
    fontSize: 16, // Text size
    color: 'black', // Text color
    justifyContent: 'center', // Center picker content vertically
    textAlign: 'center', // Center picker content horizontally
    textAlignVertical: 'center', // Ensure text is vertically centered (Android-specific)
  },
  previewButton: {
    backgroundColor: 'rgb(29,91,65)',
    padding: 10,
    borderRadius: 5,
    display:"flex", 
    justifyContent:"center", 
    alignItems:"center",
    flexDirection:"row",
    gap:15,
    width:ScreenWidth*0.6,
  },
  previewButtons:{
    backgroundColor: 'rgb(29,91,65)',
    padding: 10,
    borderRadius: 5,
    display:"flex", 
    justifyContent:"center", 
    alignItems:"center",
    flexDirection:"row",
    position:"absolute", 
    right:ScreenWidth*0.1,
    top:ScreenHeight*0.85,
    zIndex:999,
    gap:15,
    width:ScreenWidth*0.1,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  downloadButton: {
    backgroundColor: 'rgb(29,91,65)',
    padding: 10,
    borderRadius: 5,
    display:"flex", 
    justifyContent:"center", 
    alignItems:"center",
    flexDirection:"row",
    gap:15
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  noPayslipText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',

   
    // alignItems:"flex-end"
  },
  closeButton: {
    padding: 1,
    height:30,
    width:30,
    backgroundColor: "black",
    alignItems: 'center', 
    justifyContent:"center",
   borderRadius:8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  webview: {
    flex: 1,
    position:"relative"
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ScreenHeight*0.03,
  },
  dropdown: {
    // flex: 1,
   margin:ScreenWidth*0.02,
    width:ScreenWidth*0.9,
 
    alignItems:"center"
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedValue: {
    padding: 10,
    backgroundColor: '#eaeaea',
    color:"black",
    borderRadius: 5,
    fontWeight:"600",
    textAlign:"center",
    width:ScreenWidth*0.6
  },
  tableBackground: {
    flex: 1,
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden', // Ensures the image does not exceed the table boundary
  },
    redText: {
    // color: '#ff0000',
    color:"black"
  },
  black:{
color:"black"
  },
  blueText: {
    // color: 'blue',
    color:"black"
  },
  backgroundImage: {
    opacity: 0.15, // Adjust opacity for better readability of text
  },
  submitButton: {
    backgroundColor: '"rgb(29,91,65)"',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: "rgb(29,91,65)",
    padding: 10,
    borderRadius: 5,
    marginTop:ScreenHeight*0.03,
  
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: "white"
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    // color:"blue"
    color:"black"
  },
  cell2: {
    flex: 1,
    textAlign: 'center',
    color:""
  },
  cell3: {
    flex: 1,
    textAlign: 'center',
    color:""
  },
  cell4: {
    flex: 1,
    textAlign: 'center',
    color:"blue"
  },
  modalContainers: {
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
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default PaymentSlip;
