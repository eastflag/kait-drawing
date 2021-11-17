import {Badge, Calendar} from "antd";
import moment from "moment";
import {useCallback, useEffect, useState} from "react";
import {collection, getDocs, query, where} from "firebase/firestore";
import {firestore} from "../../firebase";
import {QuestionVO} from "../model/QuestionVO";

export const DailyStudy = () => {
  const [questions, setQuestions] = useState<QuestionVO[]>([]);

  useEffect(() => {
    init();
  }, []);

  const init = useCallback(async () => {
    // 오늘 날짜의 모든 문제 리스트를 가져온다.
    const todayMonth = moment().format('YYYY-MM-');
    const q = query(collection(firestore, "questions"), where("date", ">=", todayMonth + '01'), where("date", "<=", todayMonth + '31'));
    const querySnapshot = await getDocs(q);
    const tempQuestions: any = [];
    querySnapshot.forEach((doc) => {
      // data(), id로 다큐먼트 필드, id 조회
      tempQuestions.push({id: doc.id, ...doc.data()});
    });
    setQuestions(tempQuestions);
  }, []);

  const dateCellRender = (value: any) => {
    const listData = questions.filter(item => item.date === value.format('YYYY-MM-DD'));
    return <ul className="events">
      {listData.map((item: QuestionVO) => (
        <li key={item.id}>
          <Badge status="processing" text={item.chapter} />
        </li>
      ))}
    </ul>
  }

  const onSelect = (value: any) => {
    const index = questions.findIndex(item => item.date === value.format('YYYY-MM-DD'));
    console.log(index);
    if (index >= 0) {

    }
  }

  return <Calendar dateCellRender={dateCellRender} onSelect={onSelect}/>
}