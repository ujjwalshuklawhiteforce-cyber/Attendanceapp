import React from 'react';
import { ScrollView, Text, View, StyleSheet, Button } from 'react-native';
import { color } from '@rneui/base';
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from 'react-native-gesture-handler';

const PrivacyandPolicy = ({ navigation }) => {
  return (
    <View style={styles.container}>
       <View style={{   borderBottomWidth:1, borderBottomColor:"#EBEBEB", paddingTop:46, display:"flex", flexDirection:"row", alignItems:"center", gap:60 ,}}>
     <TouchableOpacity  onPress={() => navigation.goBack()} style={{padding:10, marginLeft: 10, backgroundColor:"#EBEBEB" , borderRadius:5} }>
     <Icon 
          name="chevron-back-outline"
          type={IconType.Ionicons}
          color="black"
        //   color={colors.iconBlack}
          style={styles.addIcon}
        />
     </TouchableOpacity>
             <Text style={styles.title}>Terms<Text style={{color:"green"}} > & </Text>Conditions</Text>

      </View>
        
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      
        <Text style={styles.paragraph}>
          Welcome to our HR Attendance App. By using this application, you agree to the following terms and conditions. Please read them carefully.
        </Text>

        <Text style={styles.sectionTitle}>1. General</Text>
        <Text style={styles.paragraph}>
          These terms govern the use of the HR attendance app. By using the app, you agree to comply with all applicable laws and regulations.
        </Text>

        <Text style={styles.sectionTitle}>2. Attendance Records</Text>
        <Text style={styles.paragraph}>
          All attendance data entered in this system will be stored securely and will be used for the sole purpose of managing employee attendance. Unauthorized access or alteration of records is prohibited.
        </Text>

        <Text style={styles.sectionTitle}>3. Privacy</Text>
        <Text style={styles.paragraph}>
          We respect your privacy. All personal data collected by the app will be processed in accordance with our privacy policy. We will not share your personal data without your consent unless required by law.
        </Text>

        <Text style={styles.sectionTitle}>4. Liability</Text>
        <Text style={styles.paragraph}>
          The company is not responsible for any errors, omissions, or interruptions in the service. The app is provided "as is" without any warranties.
        </Text>

        <Text style={styles.paragraph}>
          By continuing to use the app, you agree to abide by these terms and conditions.
        </Text>

      
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
    backgroundColor: '#FAFAFA',
  },
  scrollContainer: {
     padding: 20,
    
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 30,
    borderRadius: 5,
    overflow: 'hidden',
  },
});

export default PrivacyandPolicy;
