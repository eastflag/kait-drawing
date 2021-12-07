import {Button, message, Popconfirm, Row, Space} from "antd";
import {MyCanvas} from "./MyCanvas";
import React, {useCallback, useEffect, useState} from "react";
import {collection, doc, getDoc, getDocs, query, setDoc, where} from "firebase/firestore";
import {firestore} from "../../firebase";
import { QuestionVO } from "../model/QuestionVO";

import styles from './Study.module.scss';
import {useSelector} from "react-redux";
import {UserVO} from "../model/UserVO";
import {ShapeVO} from "../model/ShapeVO";

// es6 모듈 import 에러남
const Latex = require('react-latex');

interface Props {
  match: any;
}

export const Study: React.FC<Props> = ({match}) => {
  const user: UserVO = useSelector(({User}: any) => User);

  const [questions, setQuestions] = useState<QuestionVO[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionVO>({});
  // 학생이 캔버스에 그리는 모든 드로잉 객체
  const [answer, setAnswer] = useState([]);
  // 학생이 그린 드로잉 제출 여부
  const [submit, setSubmit] = useState(false);
  // 선생님이 그린 드로잉 객체
  const [marks, setMarks] = useState([]);
  // 채점 점수
  const [score, setScore] = useState(0);

  useEffect(() => {
    console.log(match.params);
    init();
  }, []);

  useEffect(() => {
    if (currentPage === 0) {
      return;
    }
    setCurrentQuestion(questions[currentPage - 1]);

    // 사용자 drawing 정보를 가져온다.
    // /users/user_id/user_questions/questions_id/{answer, teacher_answer}
    getAnswer(currentPage - 1);
  }, [currentPage]);

  const init = useCallback(async () => {
    // match.params.date 문제 리스트를 가져온다.
    const today = match.params.date;
    const q = query(collection(firestore, "questions"), where("date", "==", today));
    const querySnapshot = await getDocs(q);
    const tempQuestions: any = [];
    querySnapshot.forEach((doc) => {
      // data(), id로 다큐먼트 필드, id 조회
      tempQuestions.push({id: doc.id, ...doc.data()});
    });
    setQuestions(tempQuestions);
    console.log(tempQuestions);

    if (tempQuestions.length > 0) {
      setCurrentPage(1);
    }
  }, []);

  const getAnswer = async (index: number) => {
    const ref = doc(firestore, `/users/${user.uid}/user_questions/${questions[index].id}`);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      console.log(docSnap.data().answer, docSnap.id);
      setAnswer(docSnap.data().answer);
      setSubmit(!!docSnap.data().submit);
      if (docSnap.data().marks) {
        setMarks(docSnap.data().marks);
      }
      if (docSnap.data().score) {
        setScore(docSnap.data().score);
      }
    } else {
      setAnswer([]);
      setSubmit(false)
    }
  }

  const saveAnswer = async () => {
    const ref = doc(firestore, `/users/${user.uid}/user_questions/${questions[currentPage - 1].id}`);
    await setDoc(ref, {
      answer: answer.map((item: ShapeVO) => ({...item, pointList: item.pointList.map(point => ({...point}))}))
    }, {merge: true});
    message.info('저장하였습니다.');
  }

  const submitAnswer = async () => {
    const ref = doc(firestore, `/users/${user.uid}/user_questions/${questions[currentPage - 1].id}`);
    await setDoc(ref, {
      answer: answer.map((item: ShapeVO) => ({...item, pointList: item.pointList.map(point => ({...point}))})),
      submit: true
    }, {merge: true});
    message.info('제출하였습니다.');
  }

  return (
    <div className={styles.container}>
      <Row className={styles.header} align="middle" justify="space-between">
        <Space></Space>
        <div>{currentQuestion?.grade} - {currentQuestion.chapter}</div>
      </Row>
      <div className={styles.body}>
        <MyCanvas answer={answer} setAnswer={setAnswer} marks={marks} submit={submit} saveAnswer={saveAnswer}></MyCanvas>
        <div className={styles.question}>
          {
            currentQuestion && <Latex displayMode={true}>{`\$\$${currentQuestion?.content}\$\$`}</Latex>
          }
        </div>
        <div className={styles.score}>
          {score} / 10
        </div>
      </div>
      <Row className={styles.footer} align="middle" justify="space-between">
        <Space align="center" >
          {
            questions.map((q, index) => (
              <Button key={index} type={(index + 1) === currentPage ? 'primary' : 'ghost'} shape="circle"
                onClick={() => setCurrentPage(index + 1)}>{index + 1}</Button>
            ))
          }
        </Space>
        <Space>
          <Button type="primary" ghost onClick={saveAnswer} disabled={submit}>저장</Button>
          <Popconfirm
            title={<div><p>제출하면 선생님 피드백을 받게 됩니다.</p><p>제출후 수정이 불가능합니다.</p><p>제출하시겠습니까?</p></div>}
            onConfirm={submitAnswer}
            okText="Yes"
            cancelText="No"
            disabled={submit}
          >
            <Button type="primary" disabled={submit}>제출</Button>
          </Popconfirm>
        </Space>
      </Row>
    </div>
  );
}
