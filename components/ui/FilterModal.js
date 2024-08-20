import React, { useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import tw from "twrnc";

const { height } = Dimensions.get("window");

const FilterModal = ({ visible, onClose, data, onSelect, selectedValue }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(data.indexOf(selectedValue));

  const selectedIndex = data.indexOf(selectedValue);
  const startIndex = Math.max(0, selectedIndex - 2);

  const onScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const itemHeight = 50;
    const totalItems = data.length;
    const maxScrollIndex = totalItems - 3;

    // Calculate the index of the item closest to the center of the gray bar
    let index = Math.round(offsetY / itemHeight) + 2;

    // Adjust if nearing the end of the list
    if (index >= maxScrollIndex) {
      index = totalItems - 1; // Force index to be the last item
    }

    if (index >= 0 && index < totalItems) {
      setCurrentIndex(index);
    }
  };

  const renderItem = ({ item }) => (
    <View style={tw`h-12 justify-center`}>
      <Text style={tw`text-center text-lg`}>{item}</Text>
    </View>
  );

  const handleTap = () => {
    if (currentIndex >= 0 && currentIndex < data.length) {
      onSelect(data[currentIndex]);
      onClose();
    }
  };

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
            snapToInterval={50}
            decelerationRate="fast"
            onMomentumScrollEnd={onScrollEnd}
            renderItem={renderItem}
            style={{ height: 250 }} // 5 items with each height of 50
            contentContainerStyle={{ paddingBottom: 150 }} // Extra space to allow full scrolling to last item
          />
          {/* Gray Bar Tap Area */}
          <TouchableOpacity
            style={[
              tw`absolute left-0 right-0`,
              {
                top: 100, // Position the bar in the middle
                height: 50,
              },
            ]}
            onPress={handleTap}
          >
            <View style={tw`bg-gray-300 opacity-70 h-full`}></View>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`mt-4 p-2 bg-blue-500 rounded-lg`}
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
