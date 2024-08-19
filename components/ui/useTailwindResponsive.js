// import { useState, useEffect } from "react";
// import { Dimensions } from "react-native";
// import tw from "twrnc";

// // Manually define screen sizes as per your Tailwind configuration
// const screens = {
//   sm: 640,
//   md: 768,
//   lg: 1024,
//   xl: 1280,
// };

// export default function useTailwindResponsive() {
//   const [screenWidth, setScreenWidth] = useState(
//     Dimensions.get("window").width
//   );

//   useEffect(() => {
//     const handleResize = () => {
//       setScreenWidth(Dimensions.get("window").width);
//     };

//     const subscription = Dimensions.addEventListener("change", handleResize);

//     return () => {
//       if (subscription?.remove) {
//         subscription.remove(); // Correct way to remove the event listener
//       }
//     };
//   }, []);

//   const styles = {
//     indexGrid:
//       screenWidth >= screens.xl
//         ? tw`flex-row justify-center mx-auto`
//         : screenWidth >= screens.lg
//         ? tw`flex-col`
//         : tw`flex-col`,
//     twoColumnGrid:
//       screenWidth >= screens.xl
//         ? tw`flex-row justify-center mx-auto`
//         : screenWidth >= screens.lg
//         ? tw`flex-col`
//         : tw`flex-col`,
//   };

//   return styles;
// }
