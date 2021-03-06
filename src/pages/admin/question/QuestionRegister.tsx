import React, {useEffect, useState} from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Upload
} from "antd";
import moment from "moment";
import {MinusCircleOutlined, PlusOutlined, UploadOutlined} from "@ant-design/icons";
import {doc, addDoc, collection, getDocs, getDoc} from "firebase/firestore";
import {firestore, storage} from "../../../firebase";
import {CategoryVO} from "../../model/CategoryVO";
import firebase from "firebase/compat";
import { Checkbox } from 'antd-mobile';
const queryString = require('query-string');

const { Option, OptGroup } = Select;

export const QuestionRegister = ({location}: any) => {
  const [assessmentForm] = Form.useForm();
  const [questionForm] = Form.useForm();
  const [type, setType] = useState('objective'); // objective, subjective, subjectiveDescription
  const [questionImage, setQuestionImage] = useState<any>();
  const [assessmentId, setAssessmentId] = useState<string>();
  const [categories, setCategories] = useState<CategoryVO[]>([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const {id} = queryString.parse(location.search);

    getCategories();

    if (id) {
      setAssessmentId(id);
      getAssessment(id);
      getQuestions(id);
    }
  }, []);

  const getCategories = async () => {
    const categoriesSnap = await getDocs(collection(firestore, 'categories'));
    const tempCategories: CategoryVO[] = [];
    categoriesSnap.forEach(doc => tempCategories.push({id: doc.id, ...doc.data()}));
    setCategories(tempCategories);
    console.log(tempCategories);
  }

  const getAssessment = async (id: string) => {
    const assessmentRef = await getDoc(doc(firestore, `assessments/${id}`));
    assessmentForm.setFieldsValue({
      category: `${assessmentRef.data()?.category} > ${assessmentRef.data()?.subCategory}`,
      title: assessmentRef.data()?.title
    });
  }

  const getQuestions = async (id: string) => {
    const questionsRef = await getDocs(collection(firestore, `assessments/${id}/questions`));
    const tempQuestions: any = [];
    questionsRef.forEach(doc => {
      tempQuestions.push({id: doc.id, ...doc.data()})
    })
    setQuestions(tempQuestions);
    console.log(tempQuestions);
  }

  const onAssessmentFinish = async (values: any) => {
    console.log('Received values of form:', values);

    if (!assessmentId) {
      // ??????
      const assessmentRef = await addDoc(collection(firestore, `assessments`), {
        category: values.category.split('>')[0].trim(),
        subCategory: values.category.split('>')[1].trim(),
        title: values.title
      });
      setAssessmentId(assessmentRef.id);
    } else {
      // todo: ??????
    }

  };

  const onTypeChanged = () => {
    setType(questionForm.getFieldValue('type'));
  }

  const onQuestionFinish = async (values: any) => {
    console.log('Received values of form:', values);
    console.log(questionForm.getFieldValue('type'));

    const question: any = {
      question_title: values.question_title,
      evaluation_score: values.evaluation_score,
      type: values.type
    }

    if (values.content) {
      question.content = values.content;
    }

    if (questionImage) {
      question.question_image = `https://ez-ask.com/api/image/download/${questionImage.id}`;
    }

    if (type === 'objective') {
      question.answers = values.answers;
      if (values.choice1) {
        question.choice1 = values.choice1;
      }
      if (values.choice2) {
        question.choice2 = values.choice2;
      }
      if (values.choice3) {
        question.choice3 = values.choice3;
      }
      if (values.choice4) {
        question.choice4 = values.choice4;
      }
      if (values.choice5) {
        question.choice5 = values.choice5;
      }
    }

    console.log(question);
    const questionRef = await addDoc(collection(firestore, `assessments/${assessmentId}/questions`), question);
    const tempQuestions: any = [...questions];
    tempQuestions.push({id: questionRef.id, ...question});
    setQuestions(tempQuestions);

    // ??? ?????????
    questionForm.resetFields();
  }

  // valuePropName="fileList" ??? ???????????? ????????? ????????? ????????? ??????. uploading, progress, done ????????? ????????? ??????.
  const normFile = (e: any) => {
    console.log('Upload event:', e);

    if (Array.isArray(e)) {
      return e;
    }

    // ?????? ????????? ???????????? ?????????.
    if (e.file && e.file.status === 'done') {
      // e.file.response: {result: 0, message: "success", data: 4}
      setQuestionImage({
        id: e.file.response.data,
        name: e.file.name
      })
    }

    return e && e.fileList;
  };

  // todo: firestore ????????????
  const onUploadChange = (info: any) => {
    if (info.file.status === 'uploading') {
      console.log('uploading...');
      return;
    }
    if (info.file.status === 'done') {
      firebase.storage().ref().child('uploads/images/temp.jpg')
        .put(info.file)
        .then(snapshot => {
          console.log(snapshot.ref.getDownloadURL());
          return snapshot.ref.getDownloadURL();
        })
        .then(url => {
          console.log(url);
        })
        .catch(error => {
          console.log(error);
        });
      console.log('done');
    }
    // https://codesandbox.io/s/vy7677x3wl?file=/index.js:610-888
  }

  return (
    <div style={{padding: '1rem'}}>
      <Form form={assessmentForm}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            name="assessment_form" onFinish={onAssessmentFinish}>
        <Form.Item
          name="category"
          label="?????? > ??????"
          rules={[
            {
              required: true,
              message: '????????? ???????????????.',
            },
          ]}
        >
          <Select placeholder="????????? ???????????????">
            {
              categories.map((category: CategoryVO) => <OptGroup key={category.category} label={category.category}>{
                category.subCategories?.map(item => <Option key={item} value={`${category.category} > ${item}`}>{`${category.category} > ${item}`}</Option>)
              }</OptGroup>)
            }
          </Select>
        </Form.Item>
        <Form.Item
          name="title"
          label="??????"
          rules={[
            {
              required: true,
              message: '????????? ???????????????.',
            },
          ]}
        >
          <Input placeholder="????????????????????????." />
        </Form.Item>
        <Row justify="center">
          <Button type="primary" htmlType="submit">
            ??????
          </Button>
        </Row>
      </Form>

      <Divider>?????? ??????</Divider>

      {/*????????? ?????? ????????????*/}
      {
        questions.map((question: any) => <Card key={question.id} style={{marginBottom: '0.5rem', fontSize: '12px'}}>
          <Row gutter={14}>
            <Col span={6} style={{textAlign: 'end'}}>??????</Col>
            <Col span={18}>{question.question_title}</Col>
          </Row>
          <Row gutter={14}>
            <Col span={6} style={{textAlign: 'end'}}>??????</Col>
            <Col span={18}>{question.evaluation_score}</Col>
          </Row>
          <Row gutter={14}>
            <Col span={6} style={{textAlign: 'end'}}>??????</Col>
            <Col span={18}>{question.type === 'objective' ? '?????????' : question.type === 'subjective' ? '?????????' : '?????????'}</Col>
          </Row>
          <Row gutter={14}>
            <Col span={6} style={{textAlign: 'end'}}>?????? ?????????</Col>
            <Col span={18}><img src={question.question_image} style={{width: '100%'}} /></Col>
          </Row>
          <Row gutter={14}>
            <Col span={6} style={{textAlign: 'end'}}>??????</Col>
            <Col span={18}>{question.content}</Col>
          </Row>
          {
            question.type === 'objective' && <>
              <Row gutter={14}>
                <Col span={6} style={{textAlign: 'end'}}>??????</Col>
                <Col span={18}>{question.answers.join(',')}</Col>
              </Row>
              <Row gutter={14}>
                <Col span={6} style={{textAlign: 'end'}}>??????1</Col>
                <Col span={18}>{question.choice1}</Col>
              </Row>
              {
                question.choice2 && <Row gutter={14}>
                  <Col span={6} style={{textAlign: 'end'}}>??????2</Col>
                  <Col span={18}>{question.choice2}</Col>
                </Row>
              }
              {
                question.choice3 && <Row gutter={14}>
                  <Col span={6} style={{textAlign: 'end'}}>??????3</Col>
                  <Col span={18}>{question.choice3}</Col>
                </Row>
              }
              {
                question.choice4 && <Row gutter={14}>
                  <Col span={6} style={{textAlign: 'end'}}>??????4</Col>
                  <Col span={18}>{question.choice4}</Col>
                </Row>
              }
              {
                question.choice5 && <Row gutter={14}>
                  <Col span={6} style={{textAlign: 'end'}}>??????5</Col>
                  <Col span={18}>{question.choice5}</Col>
                </Row>
              }
            </>
          }
        </Card>)
      }

      {assessmentId &&
      <Card>
        <Form form={questionForm}
              labelCol={{span: 6}}
              wrapperCol={{span: 18}}
              name="question_form"
              initialValues={{question_title: `Q${questions.length + 1}. `, type: 'objective', evaluation_score: 10}}
              onFinish={onQuestionFinish}>
          <Form.Item style={{marginBottom: '0.6rem'}}
                     name="question_title"
                     label="??????"
                     rules={[
                       {
                         required: true,
                         message: '????????? ???????????????.',
                       },
                     ]}
          >
            <Input placeholder="????????? ???????????????."/>
          </Form.Item>
          <Form.Item style={{marginBottom: '0.6rem'}}
                     name="evaluation_score"
                     label="??????"
                     rules={[
                       {
                         required: true,
                         message: '????????? ???????????????.',
                       },
                     ]}
          >
            <InputNumber placeholder="??????"/>
          </Form.Item>
          <Form.Item style={{marginBottom: '0.6rem'}}
                     name="type"
                     label="??????"
                     rules={[
                       {
                         required: true,
                         message: '????????? ???????????????.',
                       },
                     ]}
          >
            <Select placeholder="????????? ???????????????" onChange={onTypeChanged}>
              <Option value="objective">?????????</Option>
              <Option value="subjective">?????????</Option>
              <Option value="subjectiveDescription">?????????</Option>
            </Select>
          </Form.Item>
          <Form.Item style={{marginBottom: '0.6rem'}}
                     name="question_image"
                     label="?????????"
                     valuePropName="fileList"
                     getValueFromEvent={normFile}>
            <Upload
              name="image"
              action="https://ez-ask.com/api/image/upload"
              // onChange={onUploadChange}
              listType="picture"
              maxCount={1}
            >
              <Button icon={<UploadOutlined/>}>Click to Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item style={{marginBottom: '0.6rem'}}
                     name="content"
                     label="??????"
          >
            <Input.TextArea rows={3} placeholder="????????? ???????????????."/>
          </Form.Item>
          {
            type === 'objective' && <>
              <Form.Item name="answers" label="?????? ??????" style={{marginBottom: '0.3rem'}}>
                <Checkbox.Group>
                  <Checkbox value={1} style={{marginLeft: '1rem'}}>1</Checkbox>
                  <Checkbox value={2} style={{marginLeft: '1rem'}}>2</Checkbox>
                  <Checkbox value={3} style={{marginLeft: '1rem'}}>3</Checkbox>
                  <Checkbox value={4} style={{marginLeft: '1rem'}}>4</Checkbox>
                  <Checkbox value={5} style={{marginLeft: '1rem'}}>5</Checkbox>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item style={{marginBottom: '0.3rem'}} name="choice1" label="?????? 1">
                <Input placeholder="?????? 1"/>
              </Form.Item>
              <Form.Item style={{marginBottom: '0.3rem'}} name="choice2" label="?????? 2">
                <Input placeholder="?????? 2"/>
              </Form.Item>
              <Form.Item style={{marginBottom: '0.3rem'}} name="choice3" label="?????? 3">
                <Input placeholder="?????? 3"/>
              </Form.Item>
              <Form.Item style={{marginBottom: '0.3rem'}} name="choice4" label="?????? 4">
                <Input placeholder="?????? 4"/>
              </Form.Item>
              <Form.Item style={{marginBottom: '0.3rem'}} name="choice5" label="?????? 5">
                <Input placeholder="?????? 5"/>
              </Form.Item>
            </>
          }
          <Row justify="center">
            <Button type="primary" htmlType="submit">
              ??????
            </Button>
          </Row>
        </Form>
      </Card>
      }
    </div>
  );
};
