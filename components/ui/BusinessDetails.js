import React from "react";
import { View, Text, StyleSheet } from "react-native";
import tw from "../../lib/tailwind";

const BusinessDetails = ({ business }) => {
  if (!business) {
    return null;
  }

  const {
    name,
    size,
    isAlumniOwned,
    yearFounded,
    occupation,
    subOccupation,
    websiteUrl,
    address,
    city,
    country,
    phone,
    email,
    description,
  } = business;

  return (
    <View style={tw`p-4`}>
      <Text style={styles.title}>Business Details</Text>

      {/* Business Name */}
      <Text style={styles.label}>Business Name:</Text>
      <Text style={styles.value}>{name}</Text>

      {/* Business Size */}
      <Text style={styles.label}>Business Size:</Text>
      <Text style={styles.value}>{size}</Text>

      {/* Alumni Owned */}
      <Text style={styles.label}>Alumni Owned:</Text>
      <Text style={styles.value}>{isAlumniOwned ? "Yes" : "No"}</Text>

      {/* Year Founded */}
      <Text style={styles.label}>Year Founded:</Text>
      <Text style={styles.value}>{yearFounded}</Text>

      {/* Occupation */}
      <Text style={styles.label}>Occupation:</Text>
      <Text style={styles.value}>{occupation}</Text>

      {/* Sub Occupation */}
      <Text style={styles.label}>Sub Occupation:</Text>
      <Text style={styles.value}>{subOccupation}</Text>

      {/* Website URL */}
      <Text style={styles.label}>Website URL:</Text>
      <Text style={styles.value}>{websiteUrl}</Text>

      {/* Address */}
      <Text style={styles.label}>Address:</Text>
      <Text style={styles.value}>{address}</Text>

      {/* City */}
      <Text style={styles.label}>City:</Text>
      <Text style={styles.value}>{city}</Text>

      {/* Country */}
      <Text style={styles.label}>Country:</Text>
      <Text style={styles.value}>{country}</Text>

      {/* Phone */}
      <Text style={styles.label}>Phone:</Text>
      <Text style={styles.value}>{phone}</Text>

      {/* Email */}
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{email}</Text>

      {/* Description */}
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.value}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default BusinessDetails;
