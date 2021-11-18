import React, {useContext, useEffect} from 'react';
import {Redirect, Route, useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {ROUTES_PATH} from "./index";
import {jwtUtils} from "../utils/jwtUtils";
import {Dropdown, Layout, Menu, Row, Space, Typography} from "antd";
import {HomeTwoTone, MenuOutlined, ScheduleOutlined, SettingOutlined, SnippetsOutlined} from '@ant-design/icons';
import {setToken} from "../redux/reducers/AuthReducer";
import {setUser} from "../redux/reducers/UserReducer";
import {AuthContext} from "../Auth";

import styles from './PrivateRoute.module.scss';

const {Content, Header, Footer} = Layout;
const {Text} = Typography;

const PrivateRoute = (props: any) => {
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
    dispatch(setUser({}));
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
    <Layout className={styles.container}>
      <Header className={styles.header}>
        <Row style={{height: '100%'}} justify="space-between" align="middle">
          <HomeTwoTone onClick={() => history.push(ROUTES_PATH.Root)} />
          <Dropdown overlay={menu} placement="bottomRight">
            <MenuOutlined />
          </Dropdown>
        </Row>
      </Header>

      <Content className={styles.body}>
        <Route
          {...rest}
          render={
            routeProps => <RouteComponent {...routeProps} />
          }
        />
      </Content>

      <Footer className={styles.footer}>
        <div className={styles.box} onClick={() => history.push('/daily')}>
          <ScheduleOutlined className={styles.icon} />
          <span className={styles.text}>일별</span>
        </div>
        <div className={styles.box} onClick={() => history.push('/category')}>
          <SnippetsOutlined className={styles.icon} />
          <span className={styles.text}>카테고리</span>
        </div>
        <div className={styles.box} onClick={() => history.push('/setting')}>
          <SettingOutlined className={styles.icon} />
          <span className={styles.text}>설정</span>
        </div>
      </Footer>
    </Layout>
  );
};

export default PrivateRoute
