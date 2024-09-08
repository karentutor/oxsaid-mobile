import React, { useState, useEffect } from "react";
import {
  Alert,
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
import BusinessInformation from "../components/ui/BusinessInformation"; // Renamed component for better clarity
import { useNavigation } from "@react-navigation/native";

function CreateBusinessScreen() {
  const { auth } = useAuth();
  const { access_token } = auth;
  const currentUserId = auth.user._id;
  const navigation = useNavigation(); // For navigation within the app

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [addLocationMode, setAddLocationMode] = useState(false); // Track if we are in add location mode
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    fetchBusinessNames();
  }, []);

  // Fetch list of business names
  const fetchBusinessNames = async () => {
    setLoading(true);
    try {
      const response = await axiosBase.get("/businesses/business-name", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setBusinesses(response.data);
    } catch (error) {
      console.error("Error fetching business names:", error.message);
      alert("Failed to fetch business names. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function for adding a different location
  const AddDifferentLocation = () => {
    setAddLocationMode(true);
    setFormVisible(true);
  };

  // Handle selecting a business from the modal
  const handleSelectBusiness = async (business) => {
    try {
      const response = await axiosBase.get(
        `/businesses/business-name/${business._id}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      setSelectedBusiness(response.data); // Populate business details from API
      setModalVisible(false);
      setFormVisible(false);
    } catch (error) {
      console.error("Error fetching business details:", error);
      alert("Error fetching business details");
    }
  };

  // Handle creating a new business or location
  const handleCreateBusiness = async (newBusinessData) => {
    try {
      const businessData = {
        ...newBusinessData,
        userId: currentUserId, // Add the user's ID to the new business data
      };

      await axiosBase.post(`/businesses/business-name`, businessData, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      alert("Success", "Business created successfully!");
      setFormVisible(false); // Hide the form after successful creation
      fetchBusinessNames(); // Refresh the list of businesses
      navigation.navigate("Home");
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
            onPress={() => navigation.goBack()} // Go back to the previous screen
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
          {selectedBusiness && !addLocationMode && (
            <View style={tw`mt-0`}>
              {/* Display detailed information of the selected business */}
              <BusinessInformation business={selectedBusiness} />

              {/* Buttons */}
              <View style={tw`mt-4`}>
                <View style={tw`flex-row justify-between mb-4`}>
                  {/* Yes, I work here (primary800) */}
                  <TouchableOpacity
                    style={tw`bg-[#1a2a40] p-3 rounded-lg w-1/2 mr-2`}
                    onPress={() => handleLinkBusinessToUser(selectedBusiness)}
                  >
                    <Text style={tw`text-center text-white font-bold text-xl`}>
                      Yes, I work here
                    </Text>
                  </TouchableOpacity>

                  {/* Different location (secondary500) */}
                  <TouchableOpacity
                    style={tw`bg-[#ffab40] p-3 rounded-lg w-1/2 ml-2`}
                    onPress={AddDifferentLocation} // Trigger the new function
                  >
                    <Text style={tw`text-center text-white text-xl font-bold`}>
                      I work here but at a different location
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* CreateNewBusinessForm to add a new business or location */}
          {formVisible && (
            <CreateNewBusinessForm
              onSubmit={handleCreateBusiness}
              onClose={() => setFormVisible(false)}
              selectedBusiness={addLocationMode ? selectedBusiness : null} // Pass selected business if adding location
              addLocationMode={addLocationMode} // Pass add location mode to control form fields
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
