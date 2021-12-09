import {Badge, Calendar} from "antd";
import moment from "moment";
import React, {useCallback, useEffect, useState} from "react";
import {collection, getDocs, query, where} from "firebase/firestore";
import {firestore} from "../../firebase";
import {QuestionVO} from "../model/QuestionVO";
import {AssessmentVO} from "../model/AssessmentVO";

interface Props {
  history: any;
}

export const Daily: React.FC<Props> = ({history}) => {
  const [assessments, setAssessments] = useState<AssessmentVO[]>([]);
  const [questions, setQuestions] = useState<QuestionVO[]>([]);

  useEffect(() => {
    getAssessments();
  }, []);

  const getAssessments = useCallback(async () => {
    // todo: user 정보를 매핑해서 Badge 상태를 표시.
    // todo: 달력 월별 이동시 새로운 상태 가져오기
    // 오늘 날짜의 모든 문제 리스트를 가져온다.
    const todayMonth = moment().format('YYYY-MM-');
    const q = query(collection(firestore, "assessments"), where("date", ">=", todayMonth + '01'), where("date", "<=", todayMonth + '31'));
    const querySnapshot = await getDocs(q);
    const tempAssessments: any = [];
    querySnapshot.forEach((doc) => {
      // data(), id로 다큐먼트 필드, id 조회
      tempAssessments.push({id: doc.id, ...doc.data()});
    });
    setAssessments(tempAssessments);
  }, []);

  const dateCellRender = (value: any) => {
    // none: warning, processing: processing, submit: success, done: error
    const listData = assessments.filter(item => item.date === value.format('YYYY-MM-DD'));
    return <ul className="events">
      {listData.map((item: AssessmentVO) => (
        <li key={item.id} onClick={() => history.push(`/user/study/${item.id}`)}>
          <Badge status="default" text={item.grade} />
        </li>
      ))}
    </ul>
  }

  const onSelect = (value: any) => {
    const index = questions.findIndex(item => item.date === value.format('YYYY-MM-DD'));
    console.log(index);
    if (index >= 0) {
      history.push(`/study/${value.format('YYYY-MM-DD')}`);
    }
  }

  return <Calendar dateCellRender={dateCellRender} /*onSelect={onSelect}*//>
}
