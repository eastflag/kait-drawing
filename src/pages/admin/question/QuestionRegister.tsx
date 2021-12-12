import React from 'react';
import {Button, DatePicker, Divider, Form, Input, Space} from "antd";
import moment from "moment";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import {doc, addDoc, collection} from "firebase/firestore";
import {firestore} from "../../../firebase";

export const QuestionRegister = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    console.log('Received values of form:', values);
    // console.log(moment(values.date).format('YYYY-MM-DD'));

    const assessmentRef = await addDoc(collection(firestore, `assessments`), {
      date: moment(values.date).format('YYYY-MM-DD'),
      grade: values.grade,
      title: values.title
    });
    for (let question of values.questions) {
      await addDoc(collection(firestore, `assessments/${assessmentRef.id}/questions`), {
        chapter: question.chapter,
        content: question.content
      });
    }
  };

  return (
    <div style={{padding: '1rem'}}>
      <Form form={form}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            name="register_form" onFinish={onFinish}>
        <Form.Item name="date" label="날짜"
          rules={[
            {
              required: true,
              message: '날짜를 선택하세요.',
            },
          ]}>
          <DatePicker />
        </Form.Item>
        <Form.Item
          name="grade"
          label="학년"
          rules={[
            {
              required: true,
              message: '학년을 입력하세요.',
            },
          ]}
        >
          <Input placeholder="학년 예) 중 1-1" />
        </Form.Item>
        <Form.Item
          name="title"
          label="제목"
        >
          <Input placeholder="제목을입력하세요." />
        </Form.Item>

        <Divider>문제 입력</Divider>

        <Form.List name="questions">
          {(fields, {add, remove}) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }: any) => (
                <>
                  <Space>
                    <Form.Item noStyle
                      {...restField} name={[name, 'chapter']} fieldKey={[fieldKey, '단원']}
                      rules={[{ required: true, message: '단원을 입력하세요.' }]}>
                      <Input placeholder="단원 입력" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                  <Form.Item noStyle
                    {...restField} name={[name, 'content']} fieldKey={[fieldKey, '내용']}
                    rules={[{ required: true, message: '문제를 입력하세요' }]}>
                    <Input.TextArea rows={4} placeholder="문제 내용" />
                  </Form.Item>
                  <Divider></Divider>
                </>
              ))}
              <Form.Item noStyle>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add field
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button style={{}}
            type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};