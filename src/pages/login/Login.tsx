import React, {useEffect} from 'react';
import {Button, Checkbox, Divider, Form, Input, message, Row, Typography} from 'antd';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {Link} from "react-router-dom";
import {ROUTES_PATH} from "../../routes";
import {useDispatch} from "react-redux";
import {auth, firestore} from "../../firebase";
import {setUser} from "../../redux/reducers/UserReducer";
import {setLoading} from "../../redux/reducers/NotiReducer";
import { getRedirectResult, signInWithEmailAndPassword, signInWithRedirect } from 'firebase/auth';
import { GoogleAuthProvider } from "firebase/auth";
import {doc, getDoc, setDoc} from "firebase/firestore";

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

    try {
      const result = await getRedirectResult(auth);
      if (!result!.user) {
        dispatch(setLoading(false));
        return;
      }

      console.log('redirect result: ', result);

      const docRef = doc(firestore, 'users', result!.user.uid);
      const docSnap = await getDoc(docRef);
      let user = {uid: result!.user.uid};

      if (!docSnap.exists()) {
        // firestore에  없다면 저장
        const userData = {
          email: result!.user.email,
          displayName: result!.user.displayName,
          photoURL: result!.user.photoURL,
          phoneNumber: result!.user.phoneNumber,
        };
        await setDoc(doc(firestore, 'users', result!.user.uid), userData);
        user = { ...user, ...userData };
      } else {
        user = { ...user,  ...docSnap.data() }
      }

      // 사용자 정보를 DB에 저장하고 그 정보를 User에 설정한다.
      dispatch(setUser(user));

      history.push('/');
    } catch(error: any) {
      // message.error(error.message);
    }

    dispatch(setLoading(false));
  }

  // email, password 로그인
  const onFinish = async (values: any) => {
    console.log('Received values of form: ', values);
    try {
      const {email, password} = values;
      const result = await signInWithEmailAndPassword(auth, email, password);

      // firestore에서 uid로 사용자 정보를 얻어서 redux에 설정
      console.log(result);

      const docRef = doc(firestore, 'users', result.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const user = {
          uid: result.user.uid,
          ...docSnap.data()
        }
        dispatch(setUser(user));
        history.push('/');
      } else {
        // 에러가 있다면 catch문에서 처리된다.
      }
    } catch (error: any) {
      message.error(error.message);
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
