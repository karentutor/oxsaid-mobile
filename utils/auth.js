import axios from "axios";

// const API_KEY = "AIzaSyDCYasArcOwcALFhIj2szug5aD2PgUQu1E";

async function authenticate(email, password) {
  const url = `tbc`;

  //   const response = await axios.post(url, {
  //     email: email,
  //     password: password,
  //   });

  const token = "123";
  //   const token = response.data;

  return token;
}

// export function createUser(email, password) {
//   return authenticate("signUp", email, password);
// }

export function login(email, password) {
  return authenticate(email, password);
}
