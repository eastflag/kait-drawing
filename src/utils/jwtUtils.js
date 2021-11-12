import jwtDecode from "jwt-decode";

export const jwtUtils = {
  isAuth: (currentUser) => {
    if (!currentUser) {
      return false;
    }
    const decoded = jwtDecode(currentUser.accessToken);
    // console.log(decoded);
    if (decoded.exp > new Date().getTime() / 1000) {
      return true;
    } else {
      return false;
    }
  },
}
