import React, {useCallback} from 'react';
import {Form, Input, Button, Checkbox, message, Row, Typography} from "antd";
import api from "../../utils/api";
import {auth, firestore} from "../../firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';

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
      span: 16,
      offset: 8,
    },
  },
};

interface Props {
  history: any;
}

const SignUp: React.FC<Props> = ({history}) => {
  const [form] = Form.useForm();

  const onFinish = useCallback(async (values) => {
    console.log('Received values of form: ', values);
    const {email, name, password} = values;

    try {
      const {user} = await createUserWithEmailAndPassword(auth, email, password);
      // data = {home: {uid: xxx, phoneNumber: xx, photoURL: xx, email: xxx, displayName: xxx}, credential: null, additionalUserInfo: wg, operationType: "signIn"}
      console.log(user);

      // firestore users에 저장
      await setDoc(doc(firestore, 'users', user.uid), {
        email: email,
        displayName: name,
      });

      history.push("/"); // login 으로 간다.
    } catch (error: any) {
      message.error(error);
    }
  }, [history]);

  return (
    <div style={{padding: '1rem'}}>
      <Row justify="center" style={{marginTop: '1rem'}}>
        <Title level={3}>회원가입</Title>
      </Row>
      <Form
        {...formItemLayout}
        form={form}
        name="register"
        onFinish={onFinish}
        scrollToFirstError
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
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="이름"
          rules={[
            {
              required: true,
              message: '이름을 입력해주세요!',
            },
          ]}
        >
          <Input />
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
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="패스워드 확인"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: '패스워드를 확인해주세요!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }

                return Promise.reject('패스워드가 서로 일치하지 않습니다.!');
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject('약관에 동의 하세요.'),
            },
          ]}
          {...tailFormItemLayout}
        >
          <Checkbox>
            약관을 읽고 동의합니다. {/*I have read the <a href="">agreement</a>*/}
          </Checkbox>
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default SignUp;
