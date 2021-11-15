import {Layout} from "antd";
import {MyCanvas} from "./MyCanvas";
import React from "react";

import styles from './Main.module.scss';

export const Main: React.FC = () => {

  return (
    <div className={styles.container}>
      <div className={styles.header}></div>
      <div className={styles.body}>
        <MyCanvas></MyCanvas>
        <div className={styles.question}>question</div>
      </div>
      <div className={styles.footer}></div>
    </div>
  );
}