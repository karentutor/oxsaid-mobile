import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { axiosBase } from "../services/BaseService";
import useAuth from "../hooks/useAuth";
import tw from "twrnc";
import FilterModal from "../components/ui/FilterModal";
import CreateNewBusinessForm from "../components/ui/CreateNewBusinessForm";

function CreateBusinessScreen() {
  const { auth } = useAuth();
  const { access_token } = auth;

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    fetchBusinessNames();
  }, []);

  const fetchBusinessNames = async () => {
    setLoading(true);
    try {
      const response = await axiosBase.get("/businesses/business-name", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setBusinesses(response.data.map((business) => business.name));
    } catch (error) {
      console.error("Error fetching business names:", error.message);
      alert("Failed to fetch business names. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBusiness = (business) => {
    setSelectedBusiness(business);
    setModalVisible(false);
    setFormVisible(false);
  };

  const handleFormSubmit = (newBusinessData) => {
    // Submit new business data and close the form
    console.log("New Business Data:", newBusinessData);
    setFormVisible(false);
  };

  return (
    <ScrollView style={tw`p-4 bg-white`}>
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View>
          {!formVisible && !selectedBusiness && (
            <>
              {/* Business Selector */}
              <TouchableOpacity
                style={tw`border border-gray-300 rounded-lg p-2 w-full flex-row items-center justify-between`}
                onPress={() => setModalVisible(true)}
              >
                <Text style={tw`text-black`}>
                  {selectedBusiness
                    ? `Selected Business: ${selectedBusiness}`
                    : "Select or enter a new business"}
                </Text>
                <Text style={tw`text-black`}>▼</Text>
              </TouchableOpacity>

              {/* Button for entering new business */}
              <TouchableOpacity
                style={tw`mt-4 bg-blue-500 p-4 rounded`}
                onPress={() => setFormVisible(true)}
              >
                <Text style={tw`text-center text-white`}>
                  I do not see my business name
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Show selected business details */}
          {selectedBusiness && (
            <View style={tw`mt-6`}>
              <Text style={tw`font-bold`}>Business Name:</Text>
              <Text>{selectedBusiness}</Text>
              {/* Display other business details as needed */}
            </View>
          )}

          {/* CreateNewBusinessForm to add a new business */}
          {formVisible && (
            <CreateNewBusinessForm
              onSubmit={handleFormSubmit}
              onClose={() => setFormVisible(false)}
            />
          )}

          {/* FilterModal for selecting business */}
          <FilterModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            data={businesses}
            onSelect={handleSelectBusiness}
            selectedValue={selectedBusiness}
          />
        </View>
      )}
    </ScrollView>
  );
}

export default CreateBusinessScreen;
