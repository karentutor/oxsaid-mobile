import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import tw from "../../lib/tailwind";
import FilterModal from "./FilterModal";
import { companysizeData, OCCUPATION_DATA } from "../../data";
import geoData from "../../data/geoDataSorted";

const CreateNewBusinessForm = ({ onSubmit, onClose }) => {
  // State for modals visibility
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [occupationModalVisible, setOccupationModalVisible] = useState(false);
  const [subOccupationModalVisible, setSubOccupationModalVisible] =
    useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  // Form state for BusinessName and BusinessDetails
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [isAlumniOwned, setIsAlumniOwned] = useState(false);
  const [yearFounded, setYearFounded] = useState("");
  const [occupation, setOccupation] = useState("");
  const [subOccupation, setSubOccupation] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [picturePath, setPicturePath] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  // Handle form submission
  const handleSubmit = () => {
    onSubmit({
      name,
      size,
      isAlumniOwned,
      yearFounded,
      occupation,
      subOccupation,
      websiteUrl,
      picturePath,
      address,
      city,
      country,
      phone,
      email,
      description,
    });
  };

  // Get sub-occupations based on the selected occupation
  const getSubOccupations = () => {
    const selectedOccupation = OCCUPATION_DATA.find(
      (occ) => occ.name === occupation
    );
    return selectedOccupation
      ? selectedOccupation.sublist.map((sub) => sub.name)
      : [];
  };

  return (
    <ScrollView style={tw`p-4 bg-white`}>
      <Text style={tw`text-lg font-bold mb-4`}>Create New Business</Text>

      {/* Business Name */}
      <Text style={tw`mb-2 font-bold`}>Business Name</Text>
      <TextInput
        style={tw`border p-2 mb-4`}
        value={name}
        onChangeText={setName}
        placeholder="Enter business name"
      />

      {/* Business Size with FilterModal */}
      <Text style={tw`mb-2 font-bold`}>Business Size</Text>
      <TouchableOpacity
        style={tw`border p-2 mb-4`}
        onPress={() => setSizeModalVisible(true)}
      >
        <Text>{size ? size : "Select business size"}</Text>
      </TouchableOpacity>

      {/* FilterModal for Business Size */}
      <FilterModal
        visible={sizeModalVisible}
        onClose={() => setSizeModalVisible(false)}
        data={companysizeData.map((item) => item.name)}
        onSelect={setSize}
        selectedValue={size}
      />

      {/* Alumni Owned */}
      <Text style={tw`mb-2 font-bold`}>Alumni Owned</Text>
      <TouchableOpacity
        style={tw`border p-2 mb-4`}
        onPress={() => setIsAlumniOwned(!isAlumniOwned)}
      >
        <Text>{isAlumniOwned ? "Yes" : "No"}</Text>
      </TouchableOpacity>

      {/* Year Founded */}
      <Text style={tw`mb-2 font-bold`}>Year Founded</Text>
      <TextInput
        style={tw`border p-2 mb-4`}
        value={yearFounded}
        onChangeText={setYearFounded}
        placeholder="Enter year founded"
        keyboardType="numeric"
      />

      {/* Occupation with FilterModal */}
      <Text style={tw`mb-2 font-bold`}>Occupation</Text>
      <TouchableOpacity
        style={tw`border p-2 mb-4`}
        onPress={() => setOccupationModalVisible(true)}
      >
        <Text>{occupation ? occupation : "Select occupation"}</Text>
      </TouchableOpacity>

      {/* FilterModal for Occupation */}
      <FilterModal
        visible={occupationModalVisible}
        onClose={() => setOccupationModalVisible(false)}
        data={OCCUPATION_DATA.map((occ) => occ.name)}
        onSelect={setOccupation}
        selectedValue={occupation}
      />

      {/* Sub-Occupation with FilterModal */}
      {occupation && (
        <>
          <Text style={tw`mb-2 font-bold`}>Sub Occupation</Text>
          <TouchableOpacity
            style={tw`border p-2 mb-4`}
            onPress={() => setSubOccupationModalVisible(true)}
          >
            <Text>
              {subOccupation ? subOccupation : "Select sub occupation"}
            </Text>
          </TouchableOpacity>

          {/* FilterModal for Sub-Occupation */}
          <FilterModal
            visible={subOccupationModalVisible}
            onClose={() => setSubOccupationModalVisible(false)}
            data={getSubOccupations()}
            onSelect={setSubOccupation}
            selectedValue={subOccupation}
          />
        </>
      )}

      {/* Country with FilterModal */}
      <Text style={tw`mb-2 font-bold`}>Country</Text>
      <TouchableOpacity
        style={tw`border p-2 mb-4`}
        onPress={() => setCountryModalVisible(true)}
      >
        <Text>{country ? country : "Select country"}</Text>
      </TouchableOpacity>

      {/* FilterModal for Country */}
      <FilterModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        data={Object.keys(geoData)}
        onSelect={setCountry}
        selectedValue={country}
      />

      {/* City with FilterModal */}
      {country && (
        <>
          <Text style={tw`mb-2 font-bold`}>City</Text>
          <TouchableOpacity
            style={tw`border p-2 mb-4`}
            onPress={() => setCityModalVisible(true)}
          >
            <Text>{city ? city : "Select city"}</Text>
          </TouchableOpacity>

          {/* FilterModal for City */}
          <FilterModal
            visible={cityModalVisible}
            onClose={() => setCityModalVisible(false)}
            data={geoData[country]}
            onSelect={setCity}
            selectedValue={city}
          />
        </>
      )}

      {/* Address */}
      <Text style={tw`mb-2 font-bold`}>Address</Text>
      <TextInput
        style={tw`border p-2 mb-4`}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter address"
      />

      {/* Phone */}
      <Text style={tw`mb-2 font-bold`}>Phone</Text>
      <TextInput
        style={tw`border p-2 mb-4`}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
      />

      {/* Email */}
      <Text style={tw`mb-2 font-bold`}>Email</Text>
      <TextInput
        style={tw`border p-2 mb-4`}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        keyboardType="email-address"
      />

      {/* Description */}
      <Text style={tw`mb-2 font-bold`}>Description</Text>
      <TextInput
        style={tw`border p-2 mb-4`}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter business description"
        multiline
      />

      {/* Submit and Cancel buttons */}
      <TouchableOpacity
        style={tw`bg-blue-500 p-4 rounded`}
        onPress={handleSubmit}
      >
        <Text style={tw`text-center text-white`}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={tw`mt-4 p-4 rounded bg-red-500`}
        onPress={onClose}
      >
        <Text style={tw`text-center text-white`}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateNewBusinessForm;
