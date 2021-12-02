import React from 'react';
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {ROUTES_PATH} from "../../routes";
import {Study} from "../study/Study";
import Login from "../login/Login";
import SignUp from "../signUp/SignUp";
import PrivateRoute from "../../routes/PrivateRoute";
import {Daily} from "../daily/Daily";
import {Setting} from "../setting/Setting";
import {Category} from "../category/Category";

export const Home = () => {
  return (
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
  );
}
