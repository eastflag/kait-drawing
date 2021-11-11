import jwtDecode from "jwt-decode";

export const jwtUtils = {
  isAuth: (token) => {
    if (!token) {
      return false;
    }
    const decoded = jwtDecode(token);
    // console.log(decoded);
    if (decoded.exp > new Date().getTime() / 1000) {
      return true;
    } else {
      return false;
    }
  },
  getUser: (token) => {
    const decoded = jwtDecode(token)
    return {
      id: decoded.id,
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      account_type: decoded.account_type
    };
  },
}
