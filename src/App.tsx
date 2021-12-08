import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {Layout, Spin} from "antd";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {ROUTES_PATH} from "./routes";
import {AuthProvider} from "./Auth";
import {AdminIndex} from "./pages/admin";
import {HomeIndex} from "./pages/home";

import './App.css';
import Login from "./pages/login/Login";
import SignUp from "./pages/signUp/SignUp";

const App = () => {
  const loading = useSelector((state: any) => state.Noti.loading);

  const [containerHeight, setContainerHeight] = useState<number|string>(0);

  useEffect(() => {
    resizeContainerHeight();

    window.addEventListener('resize', resizeContainerHeight);
    return () => {
      window.removeEventListener('resize', resizeContainerHeight);
    }
  }, [])

  const resizeContainerHeight = () => {
    setContainerHeight((window.innerHeight - 1) + 'px');
  }

  return (
    <AuthProvider>
      <Spin spinning={loading} size="large">
        <Layout style={{height: containerHeight}}>
          <Layout.Content>
            <BrowserRouter>
              <Switch>
                <Route path={ROUTES_PATH.Login} component={Login}></Route>
                <Route path={ROUTES_PATH.SignUp} component={SignUp}></Route>
                {/*관리자 사이트*/}
                <Route path={ROUTES_PATH.Admin} component={AdminIndex}></Route>
                {/*사용자 사이트*/}
                <Route path={ROUTES_PATH.User} component={HomeIndex}></Route>

                <Redirect path="/" to={ROUTES_PATH.Daily}></Redirect>
              </Switch>
            </BrowserRouter>
          </Layout.Content>
        </Layout>
      </Spin>
    </AuthProvider>
  );
}

export default App;
