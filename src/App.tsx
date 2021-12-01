import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {Layout, Spin} from "antd";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {ROUTES_PATH} from "./routes";
import {Study} from "./pages/study/Study";
import Login from "./pages/login/Login";
import SignUp from "./pages/signUp/SignUp";
import PrivateRoute from "./routes/PrivateRoute";

import './App.css';
import {AuthProvider} from "./Auth";
import {Daily} from "./pages/daily/Daily";
import {Setting} from "./pages/setting/Setting";
import { Category } from './pages/category/Category';

const App = () => {
  const loading = useSelector((state: any) => state.Noti.loading);

  const [containerHeight, setContainerHeight] = useState<number|string>(0);

  useEffect(() => {
    setContainerHeight((window.innerHeight - 1) + 'px');
  }, [])

  return (
    <AuthProvider>
      <Spin spinning={loading} size="large">
        <Layout style={{height: containerHeight}}>
          <Layout.Content>
            <BrowserRouter>
              <Switch>
                <PrivateRoute path={ROUTES_PATH.Daily} component={Daily}></PrivateRoute>
                <PrivateRoute path={ROUTES_PATH.Study} component={Study}></PrivateRoute>
                <PrivateRoute path={ROUTES_PATH.Category} component={Category}></PrivateRoute>
                <PrivateRoute path={ROUTES_PATH.Setting} component={Setting}></PrivateRoute>
                {/*<PrivateRoute exact path={ROUTES_PATH.Profile} component={ModifyProfile}></PrivateRoute>*/}
                {/*<PrivateRoute exact path={ROUTES_PATH.Password} component={ModifyPassword}></PrivateRoute>*/}
                <Route path={ROUTES_PATH.Login} component={Login}></Route>
                <Route path={ROUTES_PATH.SignUp} component={SignUp}></Route>
                <Redirect path="*" to="/daily" />
              </Switch>
            </BrowserRouter>
          </Layout.Content>
        </Layout>
      </Spin>
    </AuthProvider>
  );
}

export default App;
