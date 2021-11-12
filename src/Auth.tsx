import React, { useEffect, useState } from "react";
import {auth} from "./firebase";

export const AuthContext = React.createContext({currentUser: null});

export const AuthProvider = ({children}: any) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    auth.onAuthStateChanged((user: any) => {
      console.log('onAuthStateChanged: ', user);
      setCurrentUser(user)
      setPending(false)
    });
  }, []);

  if (pending) {
    return <>Loading...</>
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
