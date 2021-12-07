import React, {useCallback, useEffect, useState} from 'react';
import {Button, message, Popconfirm, Rate, Row, Space} from "antd";
import {collection, doc, getDoc, getDocs, query, setDoc, where} from "firebase/firestore";
import {firestore} from "../../../firebase";
import {QuestionVO} from "../../model/QuestionVO";
import {GradeCanvas} from "./GradeCanvas";

import styles from "./Grade.module.scss";
import {ShapeVO} from "../../model/ShapeVO";

// es6 모듈 import 에러남
const Latex = require('react-latex');

const Grade = ({match}: any) => {
  const [question, setQuestion] = useState<QuestionVO>({});
  const [userQuestion, setUserQuestion] = useState<any>({});
  const [score, setScore] = useState(0);

  useEffect(() => {
    init();
  }, []);

  const init = useCallback(async () => {
    // match.params.id: question_id 정보를 가져온다.
    // question 정보를 가져온다.
    const user_id = match.params.user_id;
    const question_id = match.params.question_id;
    const questionRef = doc(firestore, 'questions', question_id);
    let docSnap = await getDoc(questionRef);
    if (docSnap.exists()) {
      setQuestion({id: docSnap.id, ...docSnap.data()});
    }
    // user의 question 정보를가져온다.
    // console.log(`users/${user.uid}/user_questions`);
    const userQuestionRef = doc(firestore, `users/${user_id}/user_questions`, question_id);
    docSnap = await getDoc(userQuestionRef);
    if (docSnap.exists()) {
      if (docSnap.data().score) {
        setScore(docSnap.data().score);
      }
      let tempQuestion: any = {id: docSnap.id, ...docSnap.data()};
      if (!docSnap.data().marks) {
        tempQuestion.marks = [];
      }
      setUserQuestion(tempQuestion);
    }
  }, []);

  const submitMark = async () => {
    if (score === 0) {
      message.error('score를 입력하세요.');
      return;
    }
    const user_id = match.params.user_id;
    const question_id = match.params.question_id;
    const userQuestionRef = doc(firestore, `users/${user_id}/user_questions`, question_id);
    await setDoc(userQuestionRef, {
      // 파이어스토어 저장시 객체를 json으로 변환해야 함.
      marks: userQuestion?.marks.map((item: ShapeVO) => ({...item, pointList: item.pointList.map(point => ({...point}))})),
      grade: true,
      score: score
    }, {merge: true});
    message.info('저장하였습니다.');
  }

  return (
    <div className={styles.container}>
      <Row className={styles.header} align="middle" justify="space-between">
        <Space></Space>
        <div>{question?.grade} - {question.chapter}</div>
      </Row>
      <div className={styles.body}>
        <GradeCanvas userQuestion={userQuestion}></GradeCanvas>
        <div className={styles.question}>
          {
            question && <Latex displayMode={true}>{`\$\$${question?.content}\$\$`}</Latex>
          }
        </div>
      </div>
      <Row className={styles.footer} align="middle" justify="space-between">
        <Space>
          <Rate count={10} value={score} onChange={(v) => setScore(v)} />
          <span>{score} / 10</span>
        </Space>
        <Button type="primary" ghost onClick={submitMark}>저장</Button>
      </Row>
    </div>
  );
};

export default Grade;
