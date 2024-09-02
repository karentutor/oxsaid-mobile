import { useContext, useState } from "react";
import {
  Alert,
  View,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";

import AuthContent from "../components/auth/AuthContent";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { AuthContext } from "../context/auth-context";
import tw from "twrnc";
import { login } from "../utils/auth";

function LoginScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const auth = useContext(AuthContext);

  async function loginHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const { token, user } = await login(email, password);
      auth.authenticate(token, user);
    } catch (error) {
      Alert.alert(
        "Authentication failed!",
        "Could not log you in. Please check your credentials or try again later!"
      );
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="Logging you in..." />;
  }

  return (
    <KeyboardAvoidingView
      style={tw`flex-1`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Updated TouchableWithoutFeedback with pointerEvents="box-none" */}
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
        pointerEvents="box-none"
      >
        <ScrollView
          contentContainerStyle={tw`flex-grow`}
          keyboardShouldPersistTaps="handled"
        >
          <View style={tw`flex-1 items-center justify-start p-0`}>
            <Image
              source={require("../assets/oxsaid-logo-cropped.png")}
              style={tw`w-62 h-62 m-5`}
              resizeMode="contain"
            />
            <AuthContent isLogin onAuthenticate={loginHandler} />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
