export default function authHeader() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.token) {
    console.log("Auth Header Token:", user.token); // Debug log to check the token value
    return { Authorization: "Bearer " + user.token };
  } else {
    return {};
  }
}
