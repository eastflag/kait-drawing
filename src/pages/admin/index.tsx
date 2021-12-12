import {Dropdown, Layout, Menu, Typography} from "antd";
import {jwtUtils} from "../../utils/jwtUtils";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {ROUTES_PATH} from "../../routes";
import React, {useContext} from "react";
import {AuthContext} from "../../Auth";
import {UserVO} from "../model/UserVO";
import {useDispatch, useSelector} from "react-redux";
import {
  HomeTwoTone,
  LeftOutlined,
  MenuOutlined,
  ScheduleOutlined,
  SettingOutlined,
  SnippetsOutlined
} from "@ant-design/icons";
import {setUser} from "../../redux/reducers/UserReducer";
import {signOut} from "firebase/auth";
import {auth} from "../../firebase";
import Student from "./grade/Student";
import Grade from "./grade/Grade";

import styles from "./AdminIndex.module.scss";
import QuestionIndex from "./question";
import {QuestionRegister} from "./question/QuestionRegister";

const {Content, Header, Footer} = Layout;
const {Text} = Typography;

export const AdminIndex = ({history, location}: any) => {
  const dispatch = useDispatch();
  const {currentUser} = useContext(AuthContext);
  const user: UserVO = useSelector(({User}: any) => User);

  if (!jwtUtils.isAuth(currentUser)) {
    return <Redirect to={ROUTES_PATH.Login} />
  }

  if (!jwtUtils.isAdmin(user)) {
    return <Redirect to={ROUTES_PATH.User} />
  }

  const logout = () => {
    dispatch(setUser({}));
    // todo: 인증 토큰은 currentUser의 accessToken으로 갖고 오기 때문에 파이어베이스 로그아웃
    signOut(auth);
    history.push('/login');
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
        {/*left*/}
        {
          location.pathname === '/admin' ? <HomeTwoTone onClick={() => history.push(ROUTES_PATH.Admin)} />
            : <LeftOutlined style={{fontSize: '1.4rem'}} onClick={() => history.goBack()} />
        }
        {/*center*/}
        { location.pathname === '/admin' && <span>관리자 홈</span> }
        {/*right*/}
        <Dropdown overlay={menu} placement="bottomRight">
          <MenuOutlined />
        </Dropdown>
      </Header>

      <Content className={styles.body}>
        <Route path={ROUTES_PATH.AdminQuestion} component={QuestionIndex}></Route>
        <Route path={ROUTES_PATH.AdminQuestionRegister} component={QuestionRegister}></Route>
        <Route path={ROUTES_PATH.AdminMark} component={Student}></Route>
        <Route path={ROUTES_PATH.AdminGrade} component={Grade}></Route>
      </Content>

      <Footer className={styles.footer}>
        <div className={styles.box} onClick={() => history.push(ROUTES_PATH.AdminQuestion)}>
          <ScheduleOutlined className={styles.icon} />
          <span className={styles.text}>문제등록</span>
        </div>
        <div className={styles.box} onClick={() => history.push(ROUTES_PATH.AdminMark)}>
          <SnippetsOutlined className={styles.icon} />
          <span className={styles.text}>채점</span>
        </div>
        <div className={styles.box} onClick={() => history.push('/setting')}>
          <SettingOutlined className={styles.icon} />
          <span className={styles.text}>설정</span>
        </div>
      </Footer>
    </Layout>
  );
}
