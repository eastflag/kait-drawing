import React, {useEffect} from 'react';
import {Button, Checkbox, Divider, Form, Input, message, Row, Typography} from 'antd';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {Link} from "react-router-dom";
import {ROUTES_PATH} from "../../routes";
import {useDispatch} from "react-redux";
import {auth} from "../../firebase";
import api from "../../utils/api";
import {setUser} from "../../redux/reducers/UserReducer";
import {jwtUtils} from "../../utils/jwtUtils";
import {setToken} from "../../redux/reducers/AuthReducer";
import {setLoading} from "../../redux/reducers/NotiReducer";
import { getRedirectResult, signInWithEmailAndPassword, signInWithRedirect } from 'firebase/auth';
import firebase from "firebase/compat";
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;

const {Title} = Typography;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 24,
      offset: 0,
    },
  },
};

interface Props {
  history: any;
}

const Login: React.FC<Props> = ({history}) =>  {
  const dispatch = useDispatch();

  useEffect(() => {
    getGoogleRedirectResult();
  }, []);

  // 구글 로그인후 redirect 된 결과를 얻는다.
  const getGoogleRedirectResult = async () => {
    dispatch(setLoading(true)); // await 아래에 가면 동작을 안한다.

    const result = await getRedirectResult(auth);
    // console.log('redirect result: ', result);
    // console.log('redirect result: ', typeof result);
    // _.forOwn(result, (value, key) => console.log(value, key));

    if (result?.user) {

      // const credential = result.credential;
      const gUser = result.user;

      // uid, email, displayName 획득, uid로 서버 조회 없으면 insert 있으면
      const {data} = await api.post(`/api/unauth/snsLogin`,
        {login_type: 'google', email: gUser.email, name: gUser.displayName, uid: gUser.uid, account_type: 'student'});
      const user = jwtUtils.getUser(data.token);

      dispatch(setToken(data.token))
      dispatch(setUser(user))

      history.push('/');
    }

    dispatch(setLoading(false));
  }

  const onFinish = async (values: any) => {
    console.log('Received values of form: ', values);
    try {
      const {email, password} = values;
      const result = await signInWithEmailAndPassword(auth, email, password);

      // uid로 사용자 정보를 얻어서 redux에 설정
      const {data} = await api.get(`/api/unauth/login?uid=${result.user.uid}`);
      console.log(data);
      const user = jwtUtils.getUser(data.token);

      dispatch(setToken(data.token))
      dispatch(setUser(user))

      history.push('/');
    } catch (error) {
      console.log(error);
      // message.error(error.message);
    }
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider)
  }

  return (
    <div style={{padding: '1rem'}}>
      <Row justify="center">
        <Title level={3}>로그인</Title>
      </Row>

      <Divider>이메일 로그인</Divider>
      <Form
        {...formItemLayout}
        name="normal_login"
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            {
              type: 'email',
              message: '유효한 E-mail이 아닙니다!',
            },
            {
              required: true,
              message: 'E-mail을 입력해주세요!',
            },
          ]}
          style={{marginBottom: '0.5rem'}}
        >
          <Input prefix={<UserOutlined />} placeholder="이메일" />
        </Form.Item>
        <Form.Item
          name="password"
          label="패스워드"
          rules={[
            {
              required: true,
              message: '패스워드를 입력해주세요!',
            },
          ]}
          style={{marginBottom: '0.5rem'}}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="패스워드"
          />
        </Form.Item>
        <Form.Item {...tailFormItemLayout} style={{marginBottom: '0.5rem'}}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

  {/*        <a className="login-form-forgot" href="">
            Forgot password
          </a>*/}
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" ghost htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>

      <Divider>간편 로그인</Divider>
      <Button type="primary" ghost block onClick={googleLogin}>
        <img src="/assets/images/google.png" width={24}></img>
        구글 로그인
      </Button>

      <Divider>처음이신가요?</Divider>
      <Row justify="center">
        <Button type="primary" block>
          <Link to={ROUTES_PATH.SignUp}>회원 가입</Link>
        </Button>
      </Row>
    </div>
  );
}

export default Login;
