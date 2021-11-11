import React, {useEffect, useRef} from 'react';
import {Redirect, Route, useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {ROUTES_PATH} from "./index";
import {jwtUtils} from "../utils/jwtUtils";
import {Dropdown, Layout, Menu, Row, Space, Typography, message} from "antd";
import {HomeTwoTone, MenuOutlined} from '@ant-design/icons';
import {setToken} from "../redux/reducers/AuthReducer";
import {setUser} from "../redux/reducers/UserReducer";
import {firestore} from "../firebase";

import './PrivateRoute.scss';
import {setDocumentId, setJoinRoom, setRooms} from "../redux/reducers/ChatReducer";

const {Content, Header} = Layout;
const {Text} = Typography;

const PrivateRoute = (props) => {
  // removeFirestoreUser 함수안의 userDocumentId가 업데이트 되지 않아서(초기값 유지) userDocumentRef 사용함.
  const userDocumentRef = useRef(null);
  const joinRoomRef = useRef(null);
  const roomsRef = useRef([]);
  const dispatch = useDispatch();
  const history = useHistory();
  const { component: RouteComponent, ...rest } = props;

  const token = useSelector(({Auth}) => Auth.token);
  const user = useSelector(({User}) => User.user);
  const {rooms, joinRoom} = useSelector(({Chat}) => Chat);

  useEffect(() => {
    if (!jwtUtils.isAuth(token)) {
      return;
    }

    // rooms 정보 읽어서 redux에 저장
    let roomsPromise = null;
    if (user.account_type === 'teacher') {
      roomsPromise = firestore.collection('rooms').get();
    } else {
      roomsPromise = firestore.collection('rooms')
        .where('user_id', '==', user.id).get();
    }
    roomsPromise.then(snapshot => {
      const rooms = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      dispatch(setRooms(rooms));
    })

    // 초기 데이터를 읽은후 변경된 rooms 정보를 업데이트
    const unsubscribePromise = firestore.collection('rooms')
      .where("updated", ">", new Date());
    if (user.account_type === 'student') {
      unsubscribePromise.where('user_id', '==', user.id);
    }
    const unsubscribe = unsubscribePromise.onSnapshot(listener);

    // firestore users 컬렉션에 저장
    firestore.collection('users').add(user)
      .then(user_document => {
        dispatch(setDocumentId(user_document.id));
        userDocumentRef.current = user_document.id;
      });

    // 윈도우 창이 강제로 닫히면 cleanup 이 호출되지 않는다. 따라서 beforeunload 이벤트를 사용해야 한다.
    window.addEventListener('beforeunload', removeFirestoreUser);

    // cleanup 에서의 함수는 closure로서 초기상태를 유지한다. 연결하기 위해서는 useRef나 객체를 사용해야함.
    return () => {
      window.removeEventListener('beforeunload', removeFirestoreUser);
      unsubscribe();
      removeFirestoreUser();
    }
  }, []);

  useEffect(() => {
    joinRoomRef.current = joinRoom;
  }, [joinRoom]);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms])

  // todo
  const listener = (docs) => {
    docs.docChanges().forEach(change => {
      console.log('change room:', change.type, change.doc.id, change.doc.data());
      switch(change.type) {
        case 'added': // joiners 에 참여자가 추가되면 added로 들어온다.
        case 'modified':
          // joiners 업데이트: 방이 있다면 joiners 업데이트 없다면 새로 추가
          const oldRoom = roomsRef.current.find(item => item.id === change.doc.id);
          if (oldRoom) {
            oldRoom.joiners = change.doc.data().joiners;
            dispatch(setRooms([...roomsRef.current]));
          } else {
            const newRoom = {id: change.doc.id, ...change.doc.data()};
            dispatch(setRooms([...roomsRef.current, newRoom]));
          }
          break;
      }
    })
  }

  const removeFirestoreUser = async () => {
    if (!userDocumentRef.current) {
      return;
    }
    // firestore에서 users 제거
    await firestore.collection('users').doc(userDocumentRef.current).delete();

    // (윈도우 강제 종료시) firestore에서 rooms의 joiners 삭제
    if (joinRoomRef.current) {
      const joinRoom = joinRoomRef.current;
      const doc = await firestore.collection('rooms').doc(`${joinRoom.group_id}_${joinRoom.user_id}`).get();
      const room = doc.data();
      const index = room.joiners.findIndex(item => item.userDocumentId === userDocumentRef.current);
      room.joiners.splice(index, 1);
      await firestore.collection('rooms').doc(`${joinRoom.group_id}_${joinRoom.user_id}`).set(room);
    }
    // (윈도우 강제 종료시) joinRoom 삭제
    dispatch(setJoinRoom(null));
    dispatch(setDocumentId(null));
    dispatch(setRooms([]));
  }

  const logout = () => {
    dispatch(setToken(''));
    dispatch(setUser(null));
    history.push('/login');
  }

  // 아래 view가 리턴되지 않도록 한다. jwtUtils.getRoles() 실행시 에러 발생함.
  // 이후에 useEffect가 실행된다.
  if (!jwtUtils.isAuth(token)) {
    logout();
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
