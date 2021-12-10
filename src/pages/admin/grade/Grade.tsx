import React, {useCallback, useEffect, useState} from 'react';
import {Button, message, Popconfirm, Rate, Row, Space} from "antd";
import {collection, doc, getDoc, getDocs, query, setDoc, where} from "firebase/firestore";
import {firestore} from "../../../firebase";
import {QuestionVO} from "../../model/QuestionVO";
import {GradeCanvas} from "./GradeCanvas";

import styles from "./Grade.module.scss";
import {ShapeVO} from "../../model/ShapeVO";
import {AssessmentVO} from "../../model/AssessmentVO";
import {ASSESSMENT_STATUS} from "../../model/UserAssessmentVO";
import {UserQuestionVO} from "../../model/UserQuestionVO";

// es6 모듈 import 에러남
const Latex = require('react-latex');

const Grade = ({match}: any) => {
  const [assessment, setAssessment] = useState<AssessmentVO>();
  const [questions, setQuestions] = useState<QuestionVO[]>([]);
  const [userQuestions, setUserQuestions] = useState<UserQuestionVO[]>([]);
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
    init();
  }, []);

  useEffect(() => {
    if (currentIndex === -1) {
      return;
    }
    setCurrentQuestion(questions[currentIndex]);

    // 사용자 정보를 세팅.
    setAnswers(userQuestions[currentIndex].answers);
    if (userQuestions[currentIndex].marks) {
      setMarks(userQuestions[currentIndex].marks);
    } else {
      setMarks([]);
    }
    if (userQuestions[currentIndex]?.score) {
      setScore(userQuestions[currentIndex]?.score || 0);
    } else {
      setScore(0);
    }
  }, [currentIndex]);

  const init = useCallback(async () => {
    const user_id = match.params.user_id;
    const assessment_id = match.params.assessment_id;
    // userAssessment 정보를 가져온다.
    const userAssessmentSnap = await getDoc(doc(firestore, `/users/${user_id}/user_assessments/${assessment_id}`));
    setAssessment({id: userAssessmentSnap.id, ...userAssessmentSnap.data()?.assessment});
    setStatus(userAssessmentSnap.data()?.status);
    // userQuestions 정보를 가져온다.
    const tempQuestions: any = [];
    const tempUserQuestions: any = [];
    const userQuestionsRef = collection(firestore, `/users/${user_id}/user_assessments/${assessment_id}/user_questions`);
    const userQuestionsSnap = await getDocs(userQuestionsRef);
    userQuestionsSnap.forEach(doc => {
      tempQuestions.push({id: doc.id, ...doc.data().question});
      tempUserQuestions.push({id: doc.id, ...doc.data()});
    })
    setQuestions(tempQuestions);
    setUserQuestions(tempUserQuestions);

    if (tempQuestions.length > 0) {
      setCurrentIndex(0);
    }
  }, []);

  const saveMarks = async () => {
    if (score === 0) {
      message.error('score를 입력하세요.');
      return;
    }
    const user_id = match.params.user_id;
    const assessment_id = match.params.assessment_id;
    const userQuestionRef = doc(firestore, `users/${user_id}/user_assessments/${assessment_id}/user_questions/${userQuestions[currentIndex].id}`);
    await setDoc(userQuestionRef, {
      // 파이어스토어 저장시 객체를 json으로 변환해야 함.
      marks: marks.map((item: ShapeVO) => ({...item, pointList: item.pointList.map(point => ({...point}))})),
      score: score
    }, {merge: true});
    // 로컬에 저장한다. 파이어스토어를 다시 조회하지 않아도 된다.
    userQuestions[currentIndex].marks = marks;
    userQuestions[currentIndex].score = score;
    message.info('저장하였습니다.');
  }

  const submitAssessment = async () => {
    // 채점이 될된게 있는지 체크한다.
    const questionIndex = userQuestions.findIndex(userQuestion => !userQuestion.score || userQuestion.score === 0);

    if (questionIndex > -1) {
      message.error(`${questionIndex + 1}번 문제 채점이 되지 않았습니다.`);
      return;
    }

    const user_id = match.params.user_id;
    const assessment_id = match.params.assessment_id;

    const userAssessmentRef = doc(firestore, `/users/${user_id}/user_assessments/${assessment_id}`);
    await setDoc(userAssessmentRef, {
      status: ASSESSMENT_STATUS.FINISH
    }, {merge: true});
    setStatus(ASSESSMENT_STATUS.FINISH);
    message.info('채점완료 하였습니다.');
  }

  return (
    <div className={styles.container}>
      <Row className={styles.header} align="middle" justify="space-between">
        <div>{assessment?.grade} - {currentQuestion.chapter}</div>
        <Button type="primary" onClick={submitAssessment}>채점완료</Button>
      </Row>
      <div className={styles.body}>
        <GradeCanvas answers={answers} marks={marks}></GradeCanvas>
        <div className={styles.question}>
          {
            currentQuestion && <Latex displayMode={true}>{`\$\$${currentQuestion?.content}\$\$`}</Latex>
          }
        </div>
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
          <Rate count={10} value={score} onChange={(v) => setScore(v)} />
          <span>{score} / 10</span>
        </Space>
        <Button type="primary" ghost onClick={saveMarks}>저장</Button>
      </Row>
    </div>
  );
};

export default Grade;
