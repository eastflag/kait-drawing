import jwtDecode from "jwt-decode";

export const jwtUtils = {
  isAuth: (currentUser) => {
    if (!currentUser) {
      return false;
    }
    const decoded = jwtDecode(currentUser.accessToken);
    console.log((decoded.exp - new Date().getTime() / 1000) / 60 + '분 남았습니다.');
    // console.log(decoded);
    if (decoded.exp > new Date().getTime() / 1000) {
      return true;
    } else {
      return false;
    }
  },
  isAdmin: (user) => {
    console.log(user);
    if (user.accountType === 'teacher') {
      return true;
    } else {
      return false;
    }
  },
}
