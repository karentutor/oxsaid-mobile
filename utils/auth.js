import axios from "axios";

async function authenticate(email, password) {
  const url = `http://10.0.0.99:8000/api/auth/login`; // Correct endpoint

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

export function login(email, password) {
  return authenticate(email, password);
}

// import axios from "axios";

// // const API_KEY = "AIzaSyDCYasArcOwcALFhIj2szug5aD2PgUQu1E";

// async function authenticate(email, password) {
//   const url = `http://10.0.0.99:8000/api/auth/login`; // Updated to the correct endpoint

//   console.log("hit");
//   const response = await axios.post(url, {
//     email: email,
//     password: password,
//   });
//   console.log("response", response);

//   // const token = "123";
//   const token = response.token;

//   return token;
// }

// export function login(email, password) {
//   return authenticate(email, password);
// }
