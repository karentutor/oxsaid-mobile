import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons
import tw from "../../lib/tailwind"; // Adjust the import based on your setup

const { height } = Dimensions.get("window");

const FilterModal = ({
  visible,
  onClose,
  data,
  onSelect,
  selectedValue,
  object = false,
}) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(
    data.findIndex((item) => (object ? item.name : item) === selectedValue)
  );
  const [searchTerm, setSearchTerm] = useState(""); // State for the search input
  const [filteredData, setFilteredData] = useState(data); // State for the filtered data

  useEffect(() => {
    // Filter data based on search term
    if (searchTerm) {
      const filtered = data.filter((item) =>
        (object ? item.name : item)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  const renderItem = ({ item, index }) => {
    const itemName = object ? item.name : item; // Handle both object and string cases
    return (
      <TouchableOpacity
        style={tw`h-12 justify-center`}
        onPress={() => {
          setCurrentIndex(index);
          onSelect(object ? item : itemName); // Pass the whole object or just the string
          onClose();
        }}
      >
        <Text style={tw`text-center text-lg`}>{itemName}</Text>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item) => (object ? item._id : item);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
      >
        <View style={tw`bg-white rounded-lg p-6 w-3/4`}>
          {/* Search Input with looking glass icon */}
          <View
            style={tw`flex-row items-center border border-gray-300 rounded p-2 mb-4`}
          >
            <MaterialIcons name="search" size={20} color="lightgray" />
            {/* MaterialIcons search icon */}
            <TextInput
              style={tw`ml-2 flex-1 text-black`}
              placeholder="Type to search..."
              placeholderTextColor="gray"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {/* Scrollable List */}
          <FlatList
            ref={flatListRef}
            data={filteredData} // Use the filtered data here
            keyExtractor={keyExtractor} // Use the business _id or string as key
            initialScrollIndex={currentIndex >= 0 ? currentIndex : 0}
            getItemLayout={(data, index) => ({
              length: 50,
              offset: 50 * index,
              index,
            })}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            style={{ height: 250 }}
            contentContainerStyle={{ paddingBottom: 150 }}
          />
          <TouchableOpacity
            style={tw`mt-4 p-2 bg-primary500 rounded-lg`}
            onPress={onClose}
          >
            <Text style={tw`text-center text-white`}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
