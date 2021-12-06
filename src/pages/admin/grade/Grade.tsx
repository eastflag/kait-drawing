import React, {useCallback, useEffect, useState} from 'react';
import {Button, Popconfirm, Row, Space} from "antd";
import {collection, doc, getDoc, getDocs, query, where} from "firebase/firestore";
import {firestore} from "../../../firebase";
import {QuestionVO} from "../../model/QuestionVO";
import {UserVO} from "../../model/UserVO";
import {useSelector} from "react-redux";
import {GradeCanvas} from "./GradeCanvas";

import styles from "./Grade.module.scss";

// es6 모듈 import 에러남
const Latex = require('react-latex');

const Grade = ({match}: any) => {
  const user: UserVO = useSelector(({User}: any) => User);
  const [question, setQuestion] = useState<QuestionVO>({});
  const [userQuestion, setUserQuestion] = useState({});

  useEffect(() => {
    console.log(match.params);
    init();
  }, []);

  const init = useCallback(async () => {
    // match.params.id: question_id 정보를 가져온다.
    // question 정보를 가져온다.
    const question_id = match.params.id;
    const questionRef = doc(firestore, 'questions', question_id);
    let docSnap = await getDoc(questionRef);
    if (docSnap.exists()) {
      setQuestion({id: docSnap.id, ...docSnap.data()});
    }
    // user의 question 정보를가져온다.
    const userQuestionRef = doc(firestore, `/users/${user.uid}/user_questions`, question_id);
    docSnap = await getDoc(userQuestionRef);
    if (docSnap.exists()) {
      setUserQuestion({id: docSnap.id, ...docSnap.data()});
    }
  }, []);

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

      </Row>
    </div>
  );
};

export default Grade;
