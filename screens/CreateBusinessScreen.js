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
import BusinessInformation from "../components/ui/BusinessInformation";
import CreateNewBusinessForm from "../components/ui/CreateNewBusinessForm"; // Import the form here
import { useNavigation } from "@react-navigation/native";

function CreateBusinessScreen() {
  const { auth } = useAuth();
  const { access_token } = auth;
  const currentUserId = auth.user._id;
  const navigation = useNavigation(); // For navigation within the app

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false); // To control form visibility
  const [addLocationMode, setAddLocationMode] = useState(false); // For adding a new location
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessDetailsList, setBusinessDetailsList] = useState([]); // To hold BusinessDetails

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

  // Handle selecting a business from the modal
  const handleSelectBusiness = async (business) => {
    try {
      const response = await axiosBase.get(
        `/businesses/business-name/${business._id}/details`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      setSelectedBusiness(business); // Store the selected BusinessName
      setBusinessDetailsList(response.data); // Store all the BusinessDetails for that BusinessName
      setModalVisible(false); // Close modal after selection
      setFormVisible(false); // Hide form if previously visible
    } catch (error) {
      console.error("Error fetching business details:", error);
      alert("Error fetching business details");
    }
  };

  // Show CreateNewBusinessForm when the user clicks "I do not see my business name"
  const handleShowForm = () => {
    setFormVisible(true); // Show the form
    setAddLocationMode(false); // Reset to "Create new business" mode
  };

  // Handle opening the form for adding a new location
  const handleAddLocation = () => {
    setFormVisible(true); // Show the form
    setAddLocationMode(true); // Set to "Add new location" mode
  };

  // Function to handle linking user to a specific business location (BusinessDetails)
  const handleLinkBusinessDetails = async (businessDetail) => {
    try {
      const response = await axiosBase.put(
        `/users/link-business-details`, // Backend endpoint to link user to BusinessDetails
        {
          userId: currentUserId,
          businessNameId: selectedBusiness._id,
          businessDetailsId: businessDetail._id, // ID of the specific BusinessDetails (location)
        },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (response.status === 200) {
        Alert.alert(
          "Success",
          "You have been linked to this business location."
        );
        navigation.navigate("Home"); // Navigate back to the home screen
      }
    } catch (error) {
      console.error("Error linking business details:", error);
      Alert.alert("Error", "Failed to link business details.");
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
                onPress={handleShowForm} // Show form when clicked
              >
                <Text style={tw`text-center text-white`}>
                  I do not see my business name
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Show the CreateNewBusinessForm */}
          {formVisible && (
            <CreateNewBusinessForm
              onSubmit={handleCreateBusiness} // Correct submit function passed here
              onClose={() => setFormVisible(false)} // Close form on cancel
              addLocationMode={addLocationMode} // Pass the mode for adding location
              selectedBusiness={selectedBusiness} // Pass the selected business if adding a location
            />
          )}

          {/* Show all BusinessDetails cards for the selected BusinessName */}
          {selectedBusiness && (
            <View style={tw`mt-4`}>
              <Text style={tw`text-lg font-bold text-center mb-4`}>
                {selectedBusiness.name}
              </Text>

              {/* Button for adding a new location */}
              {/* <TouchableOpacity
                style={tw`mt-4 bg-yellow-500 p-4 rounded mb-4`}
                onPress={handleAddLocation} // Open form for adding a new location
              > */}
              <Text
                style={tw`text-center text-black text-blue-500 mb-4`}
                onPress={handleAddLocation}
              >
                Tap if you work at this company but at a different location
              </Text>
              {/* </TouchableOpacity> */}

              {/* Instruction to tap on the business location */}
              <Text style={tw`text-center mb-4 text-red-500`}>
                Tap the business card if you work there
              </Text>

              {/* Map over all the business details and render a card for each */}
              {businessDetailsList.map((details) => {
                const businessInfo = {
                  businessName: selectedBusiness, // Pass the selected business name
                  businessDetail: details, // Pass each business detail
                };

                return (
                  <TouchableOpacity
                    key={`${details._id}-${Date.now()}`} // Use _id combined with timestamp
                    onPress={() => handleLinkBusinessDetails(details)} // Tap to link the selected address
                  >
                    <View style={tw`mb-4`}>
                      <BusinessInformation business={businessInfo} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
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

// import React, { useState, useEffect } from "react";
// import {
//   Alert,
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
// } from "react-native";
// import { axiosBase } from "../services/BaseService";
// import useAuth from "../hooks/useAuth";
// import tw from "twrnc";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import FilterModal from "../components/ui/FilterModal";
// import BusinessInformation from "../components/ui/BusinessInformation";
// import { useNavigation } from "@react-navigation/native";

// function CreateBusinessScreen() {
//   const { auth } = useAuth();
//   const { access_token } = auth;
//   const currentUserId = auth.user._id;
//   const navigation = useNavigation(); // For navigation within the app

//   const [businesses, setBusinesses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [formVisible, setFormVisible] = useState(false);
//   const [addLocationMode, setAddLocationMode] = useState(false); // Track if we are in add location mode
//   const [selectedBusiness, setSelectedBusiness] = useState(null);
//   const [businessDetailsList, setBusinessDetailsList] = useState([]); // New state to hold BusinessDetails

//   useEffect(() => {
//     fetchBusinessNames();
//   }, []);

//   // Fetch list of business names
//   const fetchBusinessNames = async () => {
//     setLoading(true);
//     try {
//       const response = await axiosBase.get("/businesses/business-name", {
//         headers: { Authorization: `Bearer ${access_token}` },
//       });
//       setBusinesses(response.data);
//     } catch (error) {
//       console.error("Error fetching business names:", error.message);
//       alert("Failed to fetch business names. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle selecting a business from the modal
//   const handleSelectBusiness = async (business) => {
//     try {
//       const response = await axiosBase.get(
//         `/businesses/business-name/${business._id}/details`,
//         {
//           headers: { Authorization: `Bearer ${access_token}` },
//         }
//       );

//       setSelectedBusiness(business); // Store the selected BusinessName
//       setBusinessDetailsList(response.data); // Store all the BusinessDetails for that BusinessName
//       setModalVisible(false);
//       setFormVisible(false);
//     } catch (error) {
//       console.error("Error fetching business details:", error);
//       alert("Error fetching business details");
//     }
//   };

//   return (
//     <ScrollView style={tw`p-4 bg-white`}>
//       {loading ? (
//         <View style={tw`flex-1 justify-center items-center`}>
//           <ActivityIndicator size="large" color="#0000ff" />
//         </View>
//       ) : (
//         <View>
//           {/* Top left back arrow */}
//           <TouchableOpacity
//             style={tw`p-2 mb-4`}
//             onPress={() => navigation.goBack()} // Go back to the previous screen
//           >
//             <Ionicons name="arrow-back" size={24} color="black" />
//           </TouchableOpacity>

//           {!formVisible && !selectedBusiness && (
//             <>
//               {/* Business Selector */}
//               <TouchableOpacity
//                 style={tw`border border-gray-300 rounded-lg p-2 w-full flex-row items-center justify-between`}
//                 onPress={() => setModalVisible(true)}
//               >
//                 <Text style={tw`text-black`}>
//                   {selectedBusiness
//                     ? `Selected Business: ${selectedBusiness.name}`
//                     : "Select or enter a new business"}
//                 </Text>
//                 <Text style={tw`text-black`}>▼</Text>
//               </TouchableOpacity>

//               {/* Button for entering new business */}
//               <TouchableOpacity
//                 style={tw`mt-4 bg-blue-500 p-4 rounded`}
//                 onPress={() => setFormVisible(true)}
//               >
//                 <Text style={tw`text-center text-white`}>
//                   I do not see my business name
//                 </Text>
//               </TouchableOpacity>
//             </>
//           )}

//           {/* Show all BusinessDetails cards for the selected BusinessName */}
//           {selectedBusiness && (
//             <View style={tw`mt-4`}>
//               <Text style={tw`text-lg font-bold text-center mb-4`}>
//                 {selectedBusiness.name}
//               </Text>

//               {/* Map over all the business details and render a card for each */}
//               {businessDetailsList.map((details) => {
//                 // Construct an object that combines businessName and businessDetail
//                 const businessInfo = {
//                   businessName: selectedBusiness, // Pass the selected business name
//                   businessDetail: details, // Pass each business detail
//                 };

//                 return (
//                   <View key={details._id} style={tw`mb-4`}>
//                     <BusinessInformation business={businessInfo} />
//                   </View>
//                 );
//               })}
//             </View>
//           )}

//           {/* FilterModal for selecting business */}
//           <FilterModal
//             visible={modalVisible}
//             onClose={() => setModalVisible(false)}
//             data={businesses}
//             onSelect={handleSelectBusiness}
//             selectedValue={selectedBusiness?.name}
//             object={true} // Pass object=true to return the full object
//           />
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// export default CreateBusinessScreen;
