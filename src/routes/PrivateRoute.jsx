import React, {useContext, useEffect} from 'react';
import {Redirect, Route, useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {ROUTES_PATH} from "./index";
import {jwtUtils} from "../utils/jwtUtils";
import {Dropdown, Layout, Menu, Row, Space, Typography} from "antd";
import {HomeTwoTone, MenuOutlined} from '@ant-design/icons';
import {setToken} from "../redux/reducers/AuthReducer";
import {setUser} from "../redux/reducers/UserReducer";

import './PrivateRoute.scss';
import {AuthContext} from "../Auth";

const {Content, Header} = Layout;
const {Text} = Typography;

const PrivateRoute = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { component: RouteComponent, ...rest } = props;

  const {currentUser} = useContext(AuthContext);

  useEffect(() => {
    if (!jwtUtils.isAuth(currentUser)) {
      return;
    }
  }, []);

  const logout = () => {
    dispatch(setToken(''));
    dispatch(setUser(null));
    history.push('/login');
  }

  // 아래 view가 리턴되지 않도록 한다. jwtUtils.getRoles() 실행시 에러 발생함.
  // 이후에 useEffect가 실행된다.
  if (!jwtUtils.isAuth(currentUser)) {
    return <Redirect to={ROUTES_PATH.Login} />
  }

  const menu = (
    <Menu>
      <Menu.Item key={1} onClick={() => history.push('/profile')}>
        <Text strong>
          정보 수정
        </Text>
      </Menu.Item>
      <Menu.Item key={2} onClick={() => history.push('/password')}>
        <Text strong>
          패스워드 변경
        </Text>
      </Menu.Item>
      <Menu.Item key={3} onClick={logout}>
        <Text strong>
          logout
        </Text>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      <Header>
        <Row justify="space-between" align="middle" className="private_header">
          <HomeTwoTone onClick={() => history.push(ROUTES_PATH.Main)} className="header__title" />
          <Space size="large" align="center">
            <Dropdown overlay={menu} placement="bottomRight">
              <MenuOutlined className="header__menu" />
            </Dropdown>
          </Space>
        </Row>
      </Header>

      <Content style={{padding: '0', marginTop: '50px'}}>
        <Route
          {...rest}
          render={
            routeProps => <RouteComponent {...routeProps} />
          }
        />
      </Content>
    </Layout>
  );
};

export default PrivateRoute
