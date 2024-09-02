import { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import AuthForm from "./AuthForm";
import { Colors } from "../../constants/styles";

function AuthContent({ isLogin, onAuthenticate }) {
  const navigation = useNavigation();

  const [credentialsInvalid, setCredentialsInvalid] = useState({
    email: false,
    password: false,
  });

  function submitHandler(credentials) {
    let { email, password } = credentials;

    email = email.trim();
    password = password.trim();

    const emailIsValid = email.includes("@");
    const passwordIsValid = password.length > 6;

    if (!emailIsValid || !passwordIsValid) {
      Alert.alert("Invalid input", "Please check your entered credentials.");
      setCredentialsInvalid({
        email: !emailIsValid,
        password: !passwordIsValid,
      });
      return;
    }

    onAuthenticate({ email, password });
  }

  return (
    <View
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={50}
    >
      {/* Updated TouchableWithoutFeedback with pointerEvents="box-none" */}
      <ScrollView contentContainerStyle={styles.authContent}>
        <AuthForm
          isLogin={isLogin}
          onSubmit={submitHandler}
          credentialsInvalid={credentialsInvalid}
        />
      </ScrollView>
    </View>
  );
}

export default AuthContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authContent: {
    marginTop: -10,
    marginHorizontal: 50,
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 8,
    backgroundColor: Colors.primary800,
    elevation: 2,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    width: "130%",
    alignSelf: "center",
  },
});

// import { useState } from "react";
// import {
//   Alert,
//   StyleSheet,
//   View,
//   ScrollView,
//   KeyboardAvoidingView,
//   TouchableWithoutFeedback,
//   Keyboard,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";

// import AuthForm from "./AuthForm";
// import { Colors } from "../../constants/styles";

// function AuthContent({ isLogin, onAuthenticate }) {
//   const navigation = useNavigation();

//   const [credentialsInvalid, setCredentialsInvalid] = useState({
//     email: false,
//     password: false,
//     confirmEmail: false,
//     confirmPassword: false,
//   });

//   function submitHandler(credentials) {
//     let { email, confirmEmail, password, confirmPassword } = credentials;

//     email = email.trim();
//     password = password.trim();

//     const emailIsValid = email.includes("@");
//     const passwordIsValid = password.length > 6;
//     const emailsAreEqual = email === confirmEmail;
//     const passwordsAreEqual = password === confirmPassword;

//     if (
//       !emailIsValid ||
//       !passwordIsValid ||
//       (!isLogin && (!emailsAreEqual || !passwordsAreEqual))
//     ) {
//       Alert.alert("Invalid input", "Please check your entered credentials.");
//       setCredentialsInvalid({
//         email: !emailIsValid,
//         confirmEmail: !emailIsValid || !emailsAreEqual,
//         password: !passwordIsValid,
//         confirmPassword: !passwordIsValid || !passwordsAreEqual,
//       });
//       return;
//     }

//     onAuthenticate({ email, password });
//   }

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior="padding"
//       keyboardVerticalOffset={50} // Adjust if necessary
//     >
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <ScrollView contentContainerStyle={styles.authContent}>
//           <AuthForm
//             isLogin={isLogin}
//             onSubmit={submitHandler}
//             credentialsInvalid={credentialsInvalid}
//           />
//         </ScrollView>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }

// export default AuthContent;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   authContent: {
//     marginTop: -10,
//     marginHorizontal: 50,
//     paddingVertical: 10,
//     paddingHorizontal: 50,
//     borderRadius: 8,
//     backgroundColor: Colors.primary800,
//     elevation: 2,
//     shadowColor: "black",
//     shadowOffset: { width: 1, height: 1 },
//     shadowOpacity: 0.35,
//     shadowRadius: 4,
//     width: "130%", // Adjust width as needed
//     alignSelf: "center",
//   },
// });
