import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Text from "@shared-components/text-wrapper/TextWrapper";
import styles from "./ClientRequest.styles";

const ClientRequest: React.FC = () => {
  const [form, setForm] = useState({
    clientName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    requirements: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Client Request Data:", form);

    Alert.alert(
      "Success",
      "Request submitted successfully"
    );

    setForm({
      clientName: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      requirements: "",
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>
          Client Request Form
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Client Name"
          value={form.clientName}
          onChangeText={text =>
            handleChange("clientName", text)
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Company Name"
          value={form.companyName}
          onChangeText={text =>
            handleChange("companyName", text)
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={text =>
            handleChange("email", text)
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={text =>
            handleChange("phone", text)
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Address"
          value={form.address}
          onChangeText={text =>
            handleChange("address", text)
          }
        />

        <TextInput
          style={styles.input}
          placeholder="City"
          value={form.city}
          onChangeText={text =>
            handleChange("city", text)
          }
        />

        <TextInput
          style={styles.input}
          placeholder="State"
          value={form.state}
          onChangeText={text =>
            handleChange("state", text)
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Country"
          value={form.country}
          onChangeText={text =>
            handleChange("country", text)
          }
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Requirements"
          multiline
          numberOfLines={5}
          value={form.requirements}
          onChangeText={text =>
            handleChange("requirements", text)
          }
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            Submit Request
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ClientRequest;