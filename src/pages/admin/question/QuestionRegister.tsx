import React, {useEffect, useState} from 'react';
import {Button, Card, DatePicker, Divider, Form, Input, InputNumber, Row, Select, Space, Upload} from "antd";
import moment from "moment";
import {MinusCircleOutlined, PlusOutlined, UploadOutlined} from "@ant-design/icons";
import {doc, addDoc, collection, getDocs} from "firebase/firestore";
import {firestore, storage} from "../../../firebase";
import {CategoryVO} from "../../model/CategoryVO";

const { Option, OptGroup } = Select;

export const QuestionRegister = () => {
  const [assessmentForm] = Form.useForm();
  const [questionForm] = Form.useForm();
  const [type, setType] = useState('주관식');
  const [questionImage, setQuestionImage] = useState<any>();
  const [assessmentId, setAssessmentId] = useState<string>();
  const [categories, setCategories] = useState<CategoryVO[]>([]);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    const categoriesSnap = await getDocs(collection(firestore, 'categories'));
    const tempCategories: CategoryVO[] = [];
    categoriesSnap.forEach(doc => tempCategories.push({id: doc.id, ...doc.data()}));
    setCategories(tempCategories);
    console.log(tempCategories);
  }

  const onAssessmentFinish = async (values: any) => {
    console.log('Received values of form:', values);

    const assessmentRef = await addDoc(collection(firestore, `assessments`), {
      category: values.category.split('>')[0].trim(),
      subCategory: values.category.split('>')[1].trim(),
      title: values.title
    });
    setAssessmentId(assessmentRef.id);
    // for (let question of values.questions) {
    //   await addDoc(collection(firestore, `assessments/${assessmentRef.id}/questions`), {
    //     chapter: question.chapter,
    //     content: question.content
    //   });
    // }
  };

  const onTypeChanged = () => {
    setType(questionForm.getFieldValue('type'));
  }

  const onQuestionFinish = async (values: any) => {
    console.log('Received values of form:', values);
    console.log(questionForm.getFieldValue('type'));

    if (questionImage) {
      values.image_id = questionImage.id;
    }
  }

  // valuePropName="fileList" 을 설정하고 여기서 이벤트 처리를 한다. uploading, progress, done 상태가 차례로 온다.
  const normFile = (e: any) => {
    console.log('Upload event:', e);

    if (Array.isArray(e)) {
      return e;
    }

    // 서버 전송후 응답값을 얻는다.
    if (e.file && e.file.status === 'done') {
      // e.file.response: {result: 0, message: "success", data: 4}
      setQuestionImage({
        id: e.file.response.data,
        name: e.file.name
      })
    }

    return e && e.fileList;
  };

  const onUploadChange = (info: any) => {
    if (info.file.status === 'uploading') {
      console.log('uploading...');
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      // getBase64(info.file.originFileObj, imageUrl =>
      //   this.setState({
      //     imageUrl,
      //     loading: false,
      //   }),
      // );

      console.log('done');
    }
  }

  return (
    <div style={{padding: '1rem'}}>
      <Form form={assessmentForm}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            name="assessment_form" onFinish={onAssessmentFinish}>
        <Form.Item
          name="category"
          label="학년 > 단원"
          rules={[
            {
              required: true,
              message: '단원을 선택하세요.',
            },
          ]}
        >
          <Select placeholder="단원을 선택하세요">
            {
              categories.map((category: CategoryVO) => <OptGroup key={category.category} label={category.category}>{
                category.subCategories?.map(item => <Option key={item} value={`${category.category} > ${item}`}>{item}</Option>)
              }</OptGroup>)
            }
          </Select>
        </Form.Item>
        <Form.Item
          name="title"
          label="제목"
          rules={[
            {
              required: true,
              message: '단원을 선택하세요.',
            },
          ]}
        >
          <Input placeholder="제목을입력하세요." />
        </Form.Item>
        <Row justify="center">
          <Button type="primary" htmlType="submit">
            저장
          </Button>
        </Row>
      </Form>

      <Divider>문제 입력</Divider>

      <Card>
        <Form form={questionForm}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              name="question_form" onFinish={onQuestionFinish}>
          <Form.Item
            name="evaluation_score"
            label="배점"
          >
            <InputNumber placeholder="배점을 입력하세요." />
          </Form.Item>
          <Form.Item
            name="type"
            label="유형"
            rules={[
              {
                required: true,
                message: '유형을 선택하세요.',
              },
            ]}
          >
            <Select placeholder="유형을 선택하세요" defaultValue="주관식" onChange={onTypeChanged}>
              <Option value="객관식">객관식</Option>
              <Option value="주관식">주관식</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="question_image"
            label="이미지">
            <Upload
              name="image"
              // action="/api/image/upload"
              onChange={onUploadChange}
              listType="picture"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="content"
            label="문제내용"
          >
            <Input placeholder="문제내용을입력하세요." />
          </Form.Item>
          {
            type === '주관식' ? '주관식' : '객관식'
          }
          <Row justify="center">
            <Button type="primary" htmlType="submit">
              저장
            </Button>
          </Row>
        </Form>
      </Card>

        {/*<Form.List name="questions">
          {(fields, {add, remove}) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }: any, index: number) => (
                <>
                  <Space>
                    <Form.Item noStyle
                               {...restField} name={[name, 'type']} fieldKey={[fieldKey, '종류']}
                               rules={[{ required: true, message: '단원을 입력하세요.' }]}>
                      <Select placeholder="종류 선택" defaultValue="객관식">
                        <Option key="1" value="객관식">객관식</Option>
                        <Option key="2" value="주관식">주관식</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item noStyle
                      {...restField} name={[name, 'title']} fieldKey={[fieldKey, '제목']}
                      rules={[{ required: true, message: '제목을 입력하세요.' }]}>
                      <Input placeholder="제목 입력" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                  {
                    form.getFieldValue('questions')[key]?.type === '주관식' && <Form.Item noStyle
                                                                      {...restField} name={[name, 'content']} fieldKey={[fieldKey, '내용']}
                       rules={[{ required: true, message: '문제를 입력하세요' }]}>
                      <Input.TextArea rows={4} placeholder="문제 내용" />
                    </Form.Item>
                  }
                  {
                    form.getFieldValue('questions')[key]?.type !== '주관식' && <div>객관식</div>
                  }
                  <Divider></Divider>
                </>
              ))}
              <Form.Item noStyle>
                <Button type="dashed" onClick={(event) => {
                  add({type: '주관식', title: ''})
                }} block icon={<PlusOutlined />}>
                  Add field
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>*/}
    </div>
  );
};
