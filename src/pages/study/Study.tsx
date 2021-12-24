import {Avatar, Badge, Button, Input, message, Popconfirm, Popover, Row, Space} from "antd";
import {MyCanvas} from "./MyCanvas";
import React, {useCallback, useEffect, useState} from "react";
import {collection, doc, getDoc, getDocs, setDoc} from "firebase/firestore";
import {firestore} from "../../firebase";
import {QuestionVO} from "../model/QuestionVO";

import styles from './Study.module.scss';
import {useDispatch, useSelector} from "react-redux";
import {UserVO} from "../model/UserVO";
import {ShapeVO} from "../model/ShapeVO";
import {AssessmentVO} from "../model/AssessmentVO";
import {ASSESSMENT_STATUS} from "../model/UserAssessmentVO";
import {Checkbox} from "antd-mobile";
import {setTitle} from "../../redux/reducers/CommonReducer";
import {UserOutlined} from "@ant-design/icons";

// es6 모듈 import 에러남
const Latex = require('react-latex');

interface Props {
  match: any;
}

export const Study: React.FC<Props> = ({match}) => {
  const user: UserVO = useSelector(({User}: any) => User);

  const [assessment, setAssessment] = useState<AssessmentVO>();
  const [questions, setQuestions] = useState<QuestionVO[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionVO>({});
  // UserAssessment: 상태 정보
  const [status, setStatus] = useState<ASSESSMENT_STATUS>(ASSESSMENT_STATUS.NONE);
  // UserQuestions: 학생이 캔버스에 그리는 모든 드로잉 객체
  const [answers, setAnswers] = useState([]);
  // UserQuestions: 선생님이 그린 드로잉 객체
  const [marks, setMarks] = useState([]);
  // UserQuestions: 채점 점수
  const [score, setScore] = useState(0);
  // 사용자가 선택한 객관식 답안들
  const [objectAnswers, setObjectAnswers] = useState<any>([]);
  // 선생님 코멘트
  const [comment, setComment] = useState<any>();

  const dispatch = useDispatch();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (currentIndex === -1) {
      return;
    }
    setCurrentQuestion(questions[currentIndex]);

    // 사용자 drawing 정보를 가져온다.
    // /users/user_id/user_questions/questions_id/{answers, teacher_answer}
    getUserQuestion(currentIndex);
  }, [currentIndex]);

  const init = useCallback(async () => {
    const assessment_id = match.params.id;
    // assessment 가져오기
    const assessmentSnap = await getDoc(doc(firestore, 'assessments', assessment_id));
    setAssessment({id: assessmentSnap.id, ...assessmentSnap.data()});

    dispatch(setTitle(`${assessmentSnap.data()?.category} > ${assessmentSnap.data()?.subCategory} > ${assessmentSnap.data()?.title}`));

    // UserAssessment: status 가져오기
    const userAssessmentSnap = await getDoc(doc(firestore, `/users/${user.uid}/user_assessments/${assessment_id}`));
    if (userAssessmentSnap.exists()) {
      setStatus(userAssessmentSnap.data().status);
    }

    // 문제 리스트를 가져오기
    const querySnapshot = await getDocs(collection(firestore, `assessments/${assessment_id}/questions`));
    const tempQuestions: any = [];
    querySnapshot.forEach((doc) => {
      // data(), id로 다큐먼트 필드, id 조회
      tempQuestions.push({id: doc.id, ...doc.data()});
    });
    setQuestions(tempQuestions);
    console.log(tempQuestions);

    if (tempQuestions.length > 0) {
      setCurrentIndex(0);
    }
  }, []);

  const getUserQuestion = async (index: number) => {
    const userQuestionRef = doc(firestore, `/users/${user.uid}/user_assessments/${match.params.id}/user_questions/${questions[index].id}`);
    const userQuestionSnap = await getDoc(userQuestionRef);
    if (userQuestionSnap.exists()) {
      // 데이터가 있다면 answers는 반드시 존재한다.
      setAnswers(userQuestionSnap.data().answers);
      if (userQuestionSnap.data().marks) {
        setMarks(userQuestionSnap.data().marks);
      } else {
        setMarks([]);
      }
      if (userQuestionSnap.data().score) {
        setScore(userQuestionSnap.data().score);
      } else {
        setScore(0);
      }
      if (userQuestionSnap.data().objectAnswers) {
        setObjectAnswers(userQuestionSnap.data().objectAnswers);
      } else {
        setObjectAnswers([]);
      }
      if (userQuestionSnap.data().comment) {
        setComment(userQuestionSnap.data().comment);
      } else {
        setComment('');
      }
    } else {
      setAnswers([]);
      setMarks([]);
      setScore(0);
      setObjectAnswers([]);
    }
  }

  const saveAnswers = async () => {
    console.log(objectAnswers);
    const userQuestionRef = doc(firestore, `/users/${user.uid}/user_assessments/${match.params.id}/user_questions/${questions[currentIndex].id}`);
    await setDoc(userQuestionRef, {
      question: currentQuestion,
      objectAnswers: objectAnswers,
      answers: answers.map((item: ShapeVO) => ({...item, pointList: item.pointList.map(point => ({...point}))}))
    }, {merge: true});
    message.info('저장하였습니다.');
  }

  const submitAssessment = async () => {
    const userAssessmentRef = doc(firestore, `/users/${user.uid}/user_assessments/${match.params.id}`);
    await setDoc(userAssessmentRef, {
      assessment: assessment,
      status: ASSESSMENT_STATUS.SUBMIT
    }, {merge: true});
    setStatus(ASSESSMENT_STATUS.SUBMIT);
    message.info('제출하였습니다.');
  }

  return (
    <div className={styles.container}>
      <Row className={styles.header} align="middle" justify="space-between">
        <div>{currentQuestion?.question_title} {`(${currentQuestion.evaluation_score} 점)`}</div>
        <Space>
          {
            status === ASSESSMENT_STATUS.FINISH &&
              <div className={styles.score}>
                {score} / 10
              </div>
          }
          {
            (status === ASSESSMENT_STATUS.NONE || status === ASSESSMENT_STATUS.ONGOING) &&
              <Popconfirm
                title={<div><p>제출하면 선생님 피드백을 받게 됩니다.</p><p>제출후 수정이 불가능합니다.</p><p>제출하시겠습니까?</p></div>}
                onConfirm={submitAssessment}
                okText="Yes"
                cancelText="No">
                <Button type="primary">제출</Button>
              </Popconfirm>
          }
        </Space>
      </Row>
      <div className={styles.body}>
        {
          currentQuestion?.question_image &&
            <div className={styles.back} style={{backgroundImage: `url('${currentQuestion.question_image}')`}}></div>
        }
        {
          currentQuestion.content &&
            <div className={styles.question}>
              <Latex displayMode={true}>{`\$\$${currentQuestion?.content}\$\$`}</Latex>
            </div>
        }
        <MyCanvas answers={answers} setAnswers={setAnswers} marks={marks} saveAnswers={saveAnswers}
                  submit={status === ASSESSMENT_STATUS.SUBMIT || status === ASSESSMENT_STATUS.FINISH}></MyCanvas>
        {
          currentQuestion.type === 'objective' &&
            <div className={styles.choices}>
              <Checkbox.Group value={objectAnswers} onChange={(checkedValues: any) => setObjectAnswers(checkedValues)}>
                <Space direction='vertical'>
                  <Checkbox value={1} style={{marginLeft: '1rem'}}>{currentQuestion.choice1}</Checkbox>
                  { currentQuestion.choice2 && <Checkbox value={2} style={{marginLeft: '1rem'}}>{currentQuestion.choice2}</Checkbox> }
                  { currentQuestion.choice3 && <Checkbox value={3} style={{marginLeft: '1rem'}}>{currentQuestion.choice3}</Checkbox> }
                  { currentQuestion.choice4 && <Checkbox value={4} style={{marginLeft: '1rem'}}>{currentQuestion.choice4}</Checkbox> }
                  { currentQuestion.choice5 && <Checkbox value={5} style={{marginLeft: '1rem'}}>{currentQuestion.choice5}</Checkbox> }
                </Space>
              </Checkbox.Group>
            </div>
        }
      </div>
      <Row className={styles.footer} align="middle" justify="space-between">
        <Space align="center" >
          {
            questions.map((q, index) => (
              <Button key={index} type={(index) === currentIndex ? 'primary' : 'ghost'} shape="circle"
                onClick={() => setCurrentIndex(index)}>{index + 1}</Button>
            ))
          }
        </Space>
        <Space>
          {
            status === ASSESSMENT_STATUS.FINISH &&
              <Popover content={<div>{comment}</div>}
                       title="comment" trigger="click">
                <Badge count={comment ? 1 : ''}>
                  <Avatar icon={<UserOutlined />} style={{cursor: 'pointer'}}></Avatar>
                </Badge>
              </Popover>
          }
          {
            (status === ASSESSMENT_STATUS.NONE || status === ASSESSMENT_STATUS.ONGOING) &&
              <Button type="primary" ghost onClick={saveAnswers}>저장</Button>
          }
        </Space>
      </Row>
    </div>
  );
}
