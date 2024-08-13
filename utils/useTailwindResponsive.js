// useTailwindResponsive.js
import { useState, useEffect } from "react";
import { Dimensions } from "react-native";
import tw from "./tailwind";

export default function useTailwindResponsive() {
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(Dimensions.get("window").width);
    };

    Dimensions.addEventListener("change", handleResize);

    return () => {
      Dimensions.removeEventListener("change", handleResize);
    };
  }, []);

  const styles = {
    indexGrid:
      screenWidth >= parseInt(tw.theme.screens.xl)
        ? tw`flex-row justify-center mx-auto`
        : screenWidth >= parseInt(tw.theme.screens.lg)
        ? tw`flex-col`
        : tw`flex-col`,
    twoColumnGrid:
      screenWidth >= parseInt(tw.theme.screens.xl)
        ? tw`flex-row justify-center mx-auto`
        : screenWidth >= parseInt(tw.theme.screens.lg)
        ? tw`flex-col`
        : tw`flex-col`,
  };

  return styles;
}
