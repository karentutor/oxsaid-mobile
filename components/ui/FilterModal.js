import React, { useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
// import tw from "twrnc";
import tw from "../../lib/tailwind"; // or, if no custom config: `from 'twrnc'`
import { Colors } from "../../constants/styles";

const { height } = Dimensions.get("window");

const FilterModal = ({ visible, onClose, data, onSelect, selectedValue }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(data.indexOf(selectedValue));

  const selectedIndex = data.indexOf(selectedValue);
  const startIndex = Math.max(0, selectedIndex - 2);

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
          {/* Scrollable List */}
          <FlatList
            ref={flatListRef}
            data={data}
            keyExtractor={(item) => item}
            initialScrollIndex={startIndex}
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
