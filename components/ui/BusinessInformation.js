import React from "react";
import { View, Text } from "react-native";
import tw from "../../lib/tailwind";

const BusinessInformation = ({ business }) => {
  console.log("in business information componnet", business);
  if (!business) {
    return null;
  }

  // Destructure businessName and businessDetail from the passed business object
  const { businessName, businessDetail } = business;

  if (!businessName || !businessDetail) {
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
  } = businessName;

  const { address, city, country, phone, email, description } = businessDetail;

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      {/* Card container with more padding and a narrower width */}
      <View style={tw`bg-gray-100 rounded-lg shadow-lg p-6 w-10/12 max-w-md`}>
        <Text style={tw`text-xl font-bold text-center mb-4`}>
          Business Information
        </Text>

        {/* Two-column layout inside the card */}
        <View style={tw`flex-row justify-between mb-4`}>
          <View style={tw`w-1/2 pr-4`}>
            {/* Add more right padding */}
            <Text style={tw`font-bold`}>Business Name:</Text>
            <Text>{name}</Text>
            <Text style={tw`font-bold mt-4`}>Business Size:</Text>
            <Text>{size}</Text>
          </View>

          <View style={tw`w-1/2 pl-4`}>
            {/* Add more left padding */}
            <Text style={tw`font-bold`}>Occupation:</Text>
            <Text>{occupation}</Text>
            <Text style={tw`font-bold mt-4`}>Sub Occupation:</Text>
            <Text>{subOccupation}</Text>
          </View>
        </View>

        {/* Alumni Owned and Website URL in the same row */}
        <View style={tw`flex-row justify-between mb-4`}>
          <View style={tw`w-1/2 pr-4`}>
            <Text style={tw`font-bold`}>Alumni Owned:</Text>
            <Text>{isAlumniOwned ? "Yes" : "No"}</Text>
          </View>

          <View style={tw`w-1/2 pl-4`}>
            <Text style={tw`font-bold`}>Website URL:</Text>
            <Text>{websiteUrl}</Text>
          </View>
        </View>

        {/* Address and Phone in the same row */}
        <View style={tw`flex-row justify-between mb-4`}>
          <View style={tw`w-1/2 pr-4`}>
            <Text style={tw`font-bold`}>Address:</Text>
            <Text>{address}</Text>
          </View>

          <View style={tw`w-1/2 pl-4`}>
            <Text style={tw`font-bold`}>Phone:</Text>
            <Text>{phone}</Text>
          </View>
        </View>

        {/* Email and Year Founded in the same row */}
        <View style={tw`flex-row justify-between mb-4`}>
          <View style={tw`w-1/2 pr-4`}>
            <Text style={tw`font-bold`}>Year Founded:</Text>
            <Text>{yearFounded}</Text>
          </View>

          <View style={tw`w-1/2 pl-4`}>
            <Text style={tw`font-bold`}>Email:</Text>
            <Text>{email}</Text>
          </View>
        </View>

        {/* City and Country in the same row */}
        <View style={tw`flex-row justify-between mb-4`}>
          <View style={tw`w-1/2 pr-4`}>
            <Text style={tw`font-bold`}>City:</Text>
            <Text>{city}</Text>
          </View>

          <View style={tw`w-1/2 pl-4`}>
            <Text style={tw`font-bold`}>Country:</Text>
            <Text>{country}</Text>
          </View>
        </View>

        {/* Description (if available) */}
        {description ? (
          <View style={tw`mb-4`}>
            <Text style={tw`font-bold`}>Description:</Text>
            <Text>{description}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default BusinessInformation;
