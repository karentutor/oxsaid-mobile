import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import tw from "twrnc";

const GroupCard = ({ group, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={tw`bg-white p-4 rounded-lg shadow-md mb-4 flex-row items-start`}
    >
      {/* Group Image on the Left */}
      <View style={tw`mr-8`}>
        {/* Increased margin to 8 */}
        {group.groupCoverImage ? (
          <Image
            source={{ uri: group.groupCoverImage }}
            style={tw`w-24 h-24 rounded-full`}
          />
        ) : (
          <View
            style={tw`w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center`}
          >
            <Text style={tw`text-gray-500`}>No Image</Text>
          </View>
        )}
      </View>

      {/* Group Info on the Right, properly spaced and wrapped */}
      <View style={tw`flex-1`}>
        {/* Group Title */}
        <View style={tw`mb-2`}>
          <Text style={tw`text-xs text-gray-500`}>Title:</Text>
          <Text style={tw`text-lg font-bold flex-wrap`}>{group.name}</Text>
        </View>

        {/* Group Description */}
        <View style={tw`mb-2`}>
          <Text style={tw`text-xs text-gray-500`}>Description:</Text>
          <Text style={tw`text-sm text-gray-600 flex-wrap`}>
            {group.description}
          </Text>
        </View>

        {/* Number of Members */}
        <View>
          <Text style={tw`text-xs text-gray-500`}>Number of Members:</Text>
          <Text style={tw`text-sm text-gray-500`}>
            {group.groupMembers.length}{" "}
            {group.groupMembers.length === 1 ? "Member" : "Members"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default GroupCard;

// import React from "react";
// import { View, Text, TouchableOpacity, Image } from "react-native";
// import tw from "twrnc";

// const GroupCard = ({ group, onPress }) => {
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       style={tw`bg-white p-4 rounded-lg shadow-md mb-4 flex-row items-center justify-between`}
//     >
//       {/* Group Image on the Left */}
//       <View style={tw`mr-4`}>
//         {group.groupCoverImage ? (
//           <Image
//             source={{ uri: group.groupCoverImage }}
//             style={tw`w-24 h-24 rounded-full`}
//           />
//         ) : (
//           <View
//             style={tw`w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center`}
//           >
//             <Text style={tw`text-gray-500`}>No Image</Text>
//           </View>
//         )}
//       </View>

//       {/* Group Info on the Right, with keys and values middle aligned */}
//       <View style={tw`flex-1 pr-4`}>
//         {/* Group Title */}
//         <View style={tw`flex-row items-center justify-end mb-2`}>
//           <Text style={tw`text-xs text-gray-500 mr-2`}>Title:</Text>
//           <Text style={tw`text-lg font-bold`}>{group.name}</Text>
//         </View>

//         {/* Group Description */}
//         <View style={tw`flex-row items-center justify-end mb-2`}>
//           <Text style={tw`text-xs text-gray-500 mr-2`}>Description:</Text>
//           <Text style={tw`text-sm text-gray-600`}>{group.description}</Text>
//         </View>

//         {/* Number of Members */}
//         <View style={tw`flex-row items-center justify-end`}>
//           <Text style={tw`text-xs text-gray-500 mr-2`}>Number of Members:</Text>
//           <Text style={tw`text-sm text-gray-500`}>
//             {group.groupMembers.length}{" "}
//             {group.groupMembers.length === 1 ? "Member" : "Members"}
//           </Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// };

// export default GroupCard;
