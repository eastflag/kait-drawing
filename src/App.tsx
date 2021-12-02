import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {Layout, Spin} from "antd";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {ROUTES_PATH} from "./routes";
import {AuthProvider} from "./Auth";
import {Admin} from "./pages/admin";
import {Home} from "./pages/home";

import './App.css';

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
                {/*관리자 사이트*/}
                <Route path={ROUTES_PATH.Admin} component={Admin}></Route>
                {/*사용자 사이트*/}
                <Route path={ROUTES_PATH.Root} component={Home}></Route>
              </Switch>
            </BrowserRouter>
          </Layout.Content>
        </Layout>
      </Spin>
    </AuthProvider>
  );
}

export default App;
