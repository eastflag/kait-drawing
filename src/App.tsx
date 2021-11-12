import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {Layout, Spin} from "antd";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {ROUTES_PATH} from "./routes";
import {Main} from "./pages/main/Main";
import Login from "./pages/login/Login";
import SignUp from "./pages/signUp/SignUp";
import PrivateRoute from "./routes/PrivateRoute";

import './App.css';
import {AuthProvider} from "./Auth";

const App = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state: any) => state.Noti.loading);

  return (
    <AuthProvider>
      <Spin spinning={loading} size="large">
        <Layout style={{height: '100vh'}}>
          <Layout.Content className="layout">
            <BrowserRouter>
              <Switch>
                <PrivateRoute path={ROUTES_PATH.Main} component={Main}></PrivateRoute>
                {/*<PrivateRoute exact path={ROUTES_PATH.Profile} component={ModifyProfile}></PrivateRoute>*/}
                {/*<PrivateRoute exact path={ROUTES_PATH.Password} component={ModifyPassword}></PrivateRoute>*/}
                <Route path={ROUTES_PATH.Login} component={Login}></Route>
                <Route path={ROUTES_PATH.SignUp} component={SignUp}></Route>
                <Redirect path="*" to="/main" />
              </Switch>
            </BrowserRouter>
          </Layout.Content>
        </Layout>
      </Spin>
    </AuthProvider>
  );
}

export default App;
