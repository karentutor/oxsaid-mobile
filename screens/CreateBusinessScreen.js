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
import Ionicons from "react-native-vector-icons/Ionicons";
import FilterModal from "../components/ui/FilterModal";
import CreateNewBusinessForm from "../components/ui/CreateNewBusinessForm";
import BusinessDetails from "../components/ui/BusinessDetails";
import { useNavigation } from "@react-navigation/native";

function CreateBusinessScreen() {
  const { auth } = useAuth();
  const { access_token } = auth;
  const currentUserId = auth.user._id;
  const navigation = useNavigation(); // Get navigation prop

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
      setBusinesses(response.data); // Make sure data includes the full object
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

  const handleCreateBusiness = async (newBusinessData) => {
    try {
      const businessData = {
        ...newBusinessData,
        userId: currentUserId,
      };

      await axiosBase.post(`/businesses/business-name`, businessData, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      alert("Success", "Business created successfully!");
      setFormVisible(false);
      fetchBusinessNames();
    } catch (error) {
      console.error("Error creating business:", error);
      alert("Error", "Failed to create business. Please try again.");
    }
  };

  return (
    <ScrollView style={tw`p-4 bg-white`}>
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View>
          {/* Top left back arrow */}
          <TouchableOpacity
            style={tw`p-2 mb-4`}
            onPress={() => navigation.goBack()} // Go back to previous screen
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          {!formVisible && !selectedBusiness && (
            <>
              {/* Business Selector */}
              <TouchableOpacity
                style={tw`border border-gray-300 rounded-lg p-2 w-full flex-row items-center justify-between`}
                onPress={() => setModalVisible(true)}
              >
                <Text style={tw`text-black`}>
                  {selectedBusiness
                    ? `Selected Business: ${selectedBusiness.name}`
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
              <Text>{selectedBusiness.name}</Text>
              <BusinessDetails business={selectedBusiness} />
            </View>
          )}

          {/* CreateNewBusinessForm to add a new business */}
          {formVisible && (
            <CreateNewBusinessForm
              onSubmit={handleCreateBusiness}
              onClose={() => setFormVisible(false)}
            />
          )}

          {/* FilterModal for selecting business */}
          <FilterModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            data={businesses}
            onSelect={handleSelectBusiness}
            selectedValue={selectedBusiness?.name}
            object={true} // Pass object=true to return the full object
          />
        </View>
      )}
    </ScrollView>
  );
}

export default CreateBusinessScreen;
