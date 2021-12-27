import React, {useCallback, useEffect, useState} from 'react';
import {Avatar, Badge, Button, Input, InputNumber, message, Popconfirm, Popover, Rate, Row, Space} from "antd";
import {collection, doc, getDoc, getDocs, orderBy, query, setDoc, where} from "firebase/firestore";
import {firestore} from "../../../firebase";
import {QuestionVO} from "../../model/QuestionVO";
import {GradeCanvas} from "./GradeCanvas";
import {ShapeVO} from "../../model/ShapeVO";
import {AssessmentVO} from "../../model/AssessmentVO";
import {ASSESSMENT_STATUS} from "../../model/UserAssessmentVO";
import {UserQuestionVO} from "../../model/UserQuestionVO";
import {CommentOutlined, FormOutlined, UserOutlined} from "@ant-design/icons";
import {Checkbox} from "antd-mobile";
import {isSameArray} from "../../../utils/commonUtils";
import _ from 'lodash';

import styles from "./Grade.module.scss";

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
  // 사용자가 선택한 객관식 답안들
  const [objectAnswers, setObjectAnswers] = useState<any>([]);
  // 선생님 코멘트
  const [comment, setComment] = useState<string>();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (currentIndex === -1) {
      return;
    }
    setCurrentQuestion(questions[currentIndex]);

    // 사용자 정보를 세팅.
    if (userQuestions[currentIndex].answers) {
      setAnswers(userQuestions[currentIndex].answers);
    } else {
      setAnswers([]);
    }
    if (userQuestions[currentIndex].marks) {
      setMarks(userQuestions[currentIndex].marks);
    } else {
      setMarks([]);
    }
    if (userQuestions[currentIndex]?.objectAnswers) {
      setObjectAnswers(userQuestions[currentIndex]?.objectAnswers);
    } else {
      setObjectAnswers([]);
    }
    if (userQuestions[currentIndex]?.comment) {
      setComment(userQuestions[currentIndex]?.comment);
    } else {
      setComment('');
    }
    if (userQuestions[currentIndex]?.score) {
      setScore(userQuestions[currentIndex]?.score || 0);
    } else {
      // 객관식 자동 채점
      if (questions[currentIndex].type === 'objective') {
        if (isSameArray(questions[currentIndex].answers, objectAnswers)) {
          setScore(questions[currentIndex].evaluation_score || 0);
        } else {
          setScore(0);
        }
      } else {
        setScore(0);
      }
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
    const userQuestionsRef = query(collection(firestore, `/users/${user_id}/user_assessments/${assessment_id}/user_questions`));
    const userQuestionsSnap = await getDocs(userQuestionsRef);
    userQuestionsSnap.forEach(doc => {
      tempQuestions.push({id: doc.id, ...doc.data().question});
      tempUserQuestions.push({id: doc.id, ...doc.data()});
    })
    // questions, userQuestions 문제제목으로 정렬하기
    setQuestions(_.sortBy(tempQuestions, 'question_title'));
    setUserQuestions(_.sortBy(tempUserQuestions, 'question.question_title'));

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
      score: score,
      comment: comment || ''
    }, {merge: true});
    // 로컬에 저장한다. 파이어스토어를 다시 조회하지 않아도 된다.
    userQuestions[currentIndex].marks = marks;
    userQuestions[currentIndex].score = score;
    userQuestions[currentIndex].comment = comment;
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
        <div>{currentQuestion?.question_title} {`(${currentQuestion.evaluation_score} 점)`}</div>
        <Button type="primary" onClick={submitAssessment}>채점완료</Button>
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
        <GradeCanvas answers={answers} marks={marks}></GradeCanvas>
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
          <span><InputNumber style={{width: '3.5rem'}} value={score} onChange={(value: any) => setScore(value)} />/{currentQuestion.evaluation_score}</span>
          <Popover content={<Input.TextArea rows={3} value={comment} onChange={(e: any) => setComment(e.target.value)} />}
                   title="comment" trigger="click">
            <Badge count={comment ? 1 : ''}>
              <Avatar icon={<UserOutlined />} style={{cursor: 'pointer'}}></Avatar>
            </Badge>
          </Popover>
          <Button type="primary" ghost onClick={saveMarks}>저장</Button>
        </Space>
      </Row>
    </div>
  );
};

export default Grade;
