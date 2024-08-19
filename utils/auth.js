import axios from "axios";

async function authenticate(email, password) {
  const url = `${process.env.EXPO_PUBLIC_API_URL}/login`; // Correct endpoint

  try {
    const response = await axios.post(url, {
      email: email,
      password: password,
    });

    const token = response.data.token; // Corrected to access data.token

    return token;
  } catch (error) {
    console.error("Error during API call:", error);
    if (error.response) {
      console.error("Server responded with:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error; // Re-throw the error after logging
  }
}

// Making the login function async and handling errors properly
export async function login(email, password) {
  try {
    const token = await authenticate(email, password);
    return token; // Return the token if the login is successful
  } catch (error) {
    console.error("Login failed:", error);
    throw error; // Re-throw the error so it can be handled by the calling code
  }
}
