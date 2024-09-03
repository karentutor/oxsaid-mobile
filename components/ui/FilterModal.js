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
import tw from "../../lib/tailwind"; // Adjust the import based on your setup

const { height } = Dimensions.get("window");

const FilterModal = ({ visible, onClose, data, onSelect, selectedValue }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(data.indexOf(selectedValue));
  const [searchTerm, setSearchTerm] = useState(""); // State for the search input
  const [filteredData, setFilteredData] = useState(data); // State for the filtered data

  useEffect(() => {
    // Filter data based on search term
    if (searchTerm) {
      const filtered = data.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={tw`h-12 justify-center`}
      onPress={() => {
        setCurrentIndex(index);
        onSelect(item);
        onClose();
      }}
    >
      <Text style={tw`text-center text-lg`}>{item}</Text>
    </TouchableOpacity>
  );

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
          {/* Search Input */}
          <TextInput
            style={tw`border border-gray-300 rounded p-2 mb-4`}
            placeholder="Type to search..." // Added placeholder text
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          {/* Scrollable List */}
          <FlatList
            ref={flatListRef}
            data={filteredData} // Use the filtered data here
            keyExtractor={(item) => item}
            initialScrollIndex={currentIndex >= 0 ? currentIndex : 0}
            getItemLayout={(data, index) => ({
              length: 50,
              offset: 50 * index,
              index,
            })}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            style={{ height: 250 }} // 5 items with each height of 50
            contentContainerStyle={{ paddingBottom: 150 }} // Extra space to allow full scrolling to last item
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
