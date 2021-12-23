import React, {useContext} from 'react';
import {BrowserRouter, Redirect, Route, Switch, useHistory} from "react-router-dom";
import {ROUTES_PATH} from "../../routes";
import {Study} from "../study/Study";
import {Daily} from "../daily/Daily";
import {Setting} from "../setting/Setting";
import {Category} from "../category/Category";
import {useDispatch, useSelector} from "react-redux";
import {AuthContext} from "../../Auth";
import {UserVO} from "../model/UserVO";
import {setUser} from "../../redux/reducers/UserReducer";
import {signOut} from "firebase/auth";
import {auth} from "../../firebase";
import {jwtUtils} from "../../utils/jwtUtils";
import {Dropdown, Layout, Menu, Typography} from "antd";
import {
  HomeTwoTone,
  LeftOutlined,
  MenuOutlined,
  ScheduleOutlined,
  SettingOutlined,
  SnippetsOutlined
} from "@ant-design/icons";

import styles from './HomeIndex.module.scss';
import {ScoreIndex} from "../score";
import {CommonVO} from "../model/CommonVO";

const {Content, Header, Footer} = Layout;
const {Text} = Typography;

export const HomeIndex = ({history, location}: any) => {
  const title: string = useSelector(({Common}: any) => Common.title);

  const dispatch = useDispatch();

  const {currentUser} = useContext(AuthContext);
  const user: UserVO = useSelector(({User}: any) => User);

  const logout = () => {
    dispatch(setUser({}));
    // todo: 인증 토큰은 currentUser의 accessToken으로 갖고 오기 때문에 파이어베이스 로그아웃
    signOut(auth);
    history.push('/login');
  }

  // 아래 view가 리턴되지 않도록 한다. jwtUtils.getRoles() 실행시 에러 발생함.
  // 이후에 useEffect가 실행된다.
  if (!jwtUtils.isAuth(currentUser)) {
    return <Redirect to={ROUTES_PATH.Login} />
  }

  const menu = (
    <Menu>
      <Menu.Item key={1} onClick={() => history.push('/user/profile')}>
        <Text strong>
          정보 수정
        </Text>
      </Menu.Item>
      <Menu.Item key={2} onClick={() => history.push('/user/password')}>
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
        {/*left*/}
        {
          location.pathname === '/user/daily' ? <HomeTwoTone onClick={() => history.push(ROUTES_PATH.User)} />
            : <LeftOutlined style={{fontSize: '1.4rem'}} onClick={() => history.push('/')} />
        }
        {/*center*/}
        <span>{title}</span>
        {/*{ location.pathname === '/user/daily' && <span>오늘의 학습</span> }*/}
        {/*{ location.pathname.indexOf('/study') >= 0 && <span>문제 풀이</span> }*/}
        {/*{ location.pathname === '/user/category' && <span>카테고리별 학습</span> }*/}
        {/*{ location.pathname === '/user/setting' && <span>설정</span> }*/}
        {/*right*/}
        <Dropdown overlay={menu} placement="bottomRight">
          <MenuOutlined />
        </Dropdown>
      </Header>

      <Content className={styles.body}>
        <Route path={ROUTES_PATH.Daily} component={Daily}></Route>
        <Route path={ROUTES_PATH.Study} component={Study}></Route>
        <Route path={ROUTES_PATH.Score} component={ScoreIndex}></Route>
        <Route path={ROUTES_PATH.Setting} component={Setting}></Route>
      </Content>

      <Footer className={styles.footer}>
        <div className={styles.box} onClick={() => history.push(ROUTES_PATH.Daily)}>
          <ScheduleOutlined className={styles.icon} />
          <span className={styles.text}>문제풀이</span>
        </div>
        <div className={styles.box} onClick={() => history.push(ROUTES_PATH.Score)}>
          <SnippetsOutlined className={styles.icon} />
          <span className={styles.text}>채점결과</span>
        </div>
        <div className={styles.box} onClick={() => history.push(ROUTES_PATH.Setting)}>
          <SettingOutlined className={styles.icon} />
          <span className={styles.text}>설정</span>
        </div>
      </Footer>
    </Layout>
  );
}
