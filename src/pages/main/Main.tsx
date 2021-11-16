import {Button, Layout, Row, Space} from "antd";
import {MyCanvas} from "./MyCanvas";
import React, {useCallback, useEffect, useState} from "react";
import {collection, getDocs, query, where } from "firebase/firestore";
import {firestore} from "../../firebase";
import { QuestionsVO } from "../model/QuestionsVO";

import styles from './Main.module.scss';

// es6 모듈 import 에러남
const Latex = require('react-latex');

export const Main: React.FC = () => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionsVO|null>(null);
  // 오늘 날짜의 문제 리스트를 가져온다. /questions/id/{date, content}
  const myEquation = '\\frac{1}{2} + \\frac{2}{3} + \\frac{3}{4} = ?';

  // 오늘 날짜의 정답 리스트를 가져온다. /users/id/questions/id/{answer}

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (currentPage === 0) {
      return;
    }
    setCurrentQuestion(questions[currentPage - 1]);
  }, [currentPage]);

  const init = useCallback(async () => {
    // 오늘 날짜의 모든 문제 리스트를 가져온다.
    const q = query(collection(firestore, "questions"), where("date", "==", "2021-11-16"));
    const querySnapshot = await getDocs(q);
    const tempQuestions: any = [];
    querySnapshot.forEach((doc) => {
      // data(), id로 다큐먼트 필드, id 조회
      tempQuestions.push(doc.data());
    });
    setQuestions(tempQuestions);
    console.log(tempQuestions);

    if (tempQuestions.length > 0) {
      setCurrentPage(1);
    }
  }, []);

  const saveAnswer = () => {

  }

  return (
    <div className={styles.container}>
      <div className={styles.header}></div>
      <div className={styles.body}>
        <MyCanvas></MyCanvas>
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
              <Button key={index} type={(index + 1) === currentPage ? 'primary' : 'ghost'} shape="circle"
                onClick={() => setCurrentPage(index + 1)}>{index + 1}</Button>
            ))
          }
        </Space>
        <Button type="primary" onClick={saveAnswer}>save</Button>
      </Row>
    </div>
  );
}