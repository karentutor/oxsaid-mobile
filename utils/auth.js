import { axiosBase } from "../services/BaseService";

async function authenticate(email, password) {
  try {
    const response = await axiosBase.post("auth/login", {
      email: email,
      password: password,
    });

    const data = response.data; // Corrected to access data.token

    return data;
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
    const { token, user, isSuccess, msg } = await authenticate(email, password);

    if (isSuccess) {
      return { token, user }; // Return both token and user
    } else {
      throw new Error(msg || "Login failed."); // Handle any error messages from the backend
    }
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}
