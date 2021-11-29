import { Layout } from "antd";
import {jwtUtils} from "../../utils/jwtUtils";
import {Redirect} from "react-router-dom";
import {ROUTES_PATH} from "../../routes";
import React, {useContext} from "react";
import {AuthContext} from "../../Auth";
import {UserVO} from "../model/UserVO";
import {useSelector} from "react-redux";

export const Admin = () => {
  const {currentUser} = useContext(AuthContext);
  const user: UserVO = useSelector(({User}: any) => User);

  if (!jwtUtils.isAuth(currentUser)) {
    return <Redirect to={ROUTES_PATH.Login} />
  }

  if (!jwtUtils.isAdmin(user)) {
    return <Redirect to={ROUTES_PATH.Root} />
  }

  return (
    <Layout>
      <Layout.Content>
        admin
      </Layout.Content>
    </Layout>
  );
}
