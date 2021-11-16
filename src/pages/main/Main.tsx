import {Layout} from "antd";
import {MyCanvas} from "./MyCanvas";
import React from "react";

import styles from './Main.module.scss';
// es6 모듈 import 에러남
const Latex = require('react-latex');

export const Main: React.FC = () => {
  // 오늘 날짜의 문제 리스트를 가져온다. /questions/id/{date, content}
  const myEquation = '\\frac{1}{2} + \\frac{2}{3} + \\frac{3}{4} = ?';

  // 오늘 날짜의 정답 리스트를 가져온다. /users/id/questions/id/{answer}


  return (
    <div className={styles.container}>
      <div className={styles.header}></div>
      <div className={styles.body}>
        <MyCanvas></MyCanvas>
        <div className={styles.question}>
          <Latex displayMode={true}>{`\$\$${myEquation}\$\$`}</Latex>
        </div>
      </div>
      <div className={styles.footer}></div>
    </div>
  );
}