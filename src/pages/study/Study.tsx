import {Button, message, Popconfirm, Row, Space} from "antd";
import {MyCanvas} from "./MyCanvas";
import React, {useCallback, useEffect, useState} from "react";
import {collection, doc, getDoc, getDocs, setDoc} from "firebase/firestore";
import {firestore} from "../../firebase";
import {QuestionVO} from "../model/QuestionVO";

import styles from './Study.module.scss';
import {useSelector} from "react-redux";
import {UserVO} from "../model/UserVO";
import {ShapeVO} from "../model/ShapeVO";
import {AssessmentVO} from "../model/AssessmentVO";
import {ASSESSMENT_STATUS} from "../model/UserAssessmentVO";

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

  useEffect(() => {
    console.log(match.params);
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
    // UserAssessment: status 가져오기
    const userAssessmentRef = await getDoc(doc(firestore, `/users/${user.uid}/user_assessments/${match.params.id}`));
    if (userAssessmentRef.exists()) {
      setStatus(userAssessmentRef.data().status);
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
    } else {
      setAnswers([]);
      setMarks([]);
      setScore(0);
    }
  }

  const saveAnswers = async () => {
    const userQuestionRef = doc(firestore, `/users/${user.uid}/user_assessments/${match.params.id}/user_questions/${questions[currentIndex].id}`);
    await setDoc(userQuestionRef, {
      question: currentQuestion,
      answers: answers.map((item: ShapeVO) => ({...item, pointList: item.pointList.map(point => ({...point}))}))
    }, {merge: true});
    message.info('저장하였습니다.');
  }

  const submitAnswers = async () => {
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
        <Space></Space>
        <div>{assessment?.grade} - {currentQuestion.chapter}</div>
      </Row>
      <div className={styles.body}>
        <MyCanvas answers={answers} setAnswers={setAnswers} marks={marks} saveAnswers={saveAnswers}
                  submit={status === ASSESSMENT_STATUS.SUBMIT || status === ASSESSMENT_STATUS.FINISH}></MyCanvas>
        <div className={styles.question}>
          {
            currentQuestion && <Latex displayMode={true}>{`\$\$${currentQuestion?.content}\$\$`}</Latex>
          }
        </div>
        {
          score > 0 &&
            <div className={styles.score}>
              {score} / 10
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
          <Button type="primary" ghost onClick={saveAnswers}
                  disabled={status === ASSESSMENT_STATUS.SUBMIT || status === ASSESSMENT_STATUS.FINISH}>저장</Button>
          <Popconfirm
            title={<div><p>제출하면 선생님 피드백을 받게 됩니다.</p><p>제출후 수정이 불가능합니다.</p><p>제출하시겠습니까?</p></div>}
            onConfirm={submitAnswers}
            okText="Yes"
            cancelText="No"
            disabled={status === ASSESSMENT_STATUS.SUBMIT || status === ASSESSMENT_STATUS.FINISH}
          >
            <Button type="primary" disabled={status === ASSESSMENT_STATUS.SUBMIT || status === ASSESSMENT_STATUS.FINISH}>제출</Button>
          </Popconfirm>
        </Space>
      </Row>
    </div>
  );
}
