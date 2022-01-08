import {Badge, Button, Calendar, Row, Table} from "antd";
import moment from "moment";
import React, {useCallback, useEffect, useState} from "react";
import {collection, getDocs, query, where} from "firebase/firestore";
import {firestore} from "../../firebase";
import {QuestionVO} from "../model/QuestionVO";
import {AssessmentVO} from "../model/AssessmentVO";
import {UserVO} from "../model/UserVO";
import {useDispatch, useSelector} from "react-redux";
import {ROUTES_PATH} from "../../routes";
import {setTitle} from "../../redux/reducers/CommonReducer";
import {ASSESSMENT_STATUS} from "../model/UserAssessmentVO";

interface Props {
  history: any;
}

export const Daily: React.FC<Props> = ({history}) => {
  const user: UserVO = useSelector(({User}: any) => User);
  const [assessments, setAssessments] = useState<AssessmentVO[]>([]);
  const [questions, setQuestions] = useState<QuestionVO[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTitle('문제풀이'));
    getAssessments();
  }, []);

  const columns = [
    {
      title: '학년',
      dataIndex: 'category',
      editable: false,
      key: 'category',
      render: (text: any) => (
        <span>{text}</span>
      )
    },
    {
      title: '단원',
      dataIndex: 'subCategory',
      editable: false,
      key: 'subCategory',
      render: (text: any) => (
        <span>{text}</span>
      )
    },
    {
      title: '제목',
      dataIndex: 'title',
      editable: false,
      key: 'title',
      render: (text: any) => (
        <span>{text}</span>
      )
    },
    {
      title: '',
      dataIndex: 'id',
      key: 'id',
      render: (text: any, record: any) => (
        <Row justify="end">
          <Button type="primary" ghost={!!record.status} onClick={() => history.push(`/user/study/${text}`)}>
            {!record.status && '문제풀이'}
            {record.status === ASSESSMENT_STATUS.ONGOING && '작성중'}
            {record.status === ASSESSMENT_STATUS.SUBMIT && '제출완료'}
            {record.status === ASSESSMENT_STATUS.FINISH && '채점완료'}
          </Button>
        </Row>
      )
    }
  ];

  const getAssessments = useCallback(async () => {
    // todo: user 정보를 매핑해서 Badge 상태를 표시.
    // todo: 달력 월별 이동시 새로운 상태 가져오기
    // 오늘 날짜의 모든 문제 리스트를 가져온다.
    const todayMonth = moment().format('YYYY-MM-');
    let q;
    if (user.grade) {
      q = query(collection(firestore, "assessments"), where("category", "==", user.grade));
    } else {
      q = query(collection(firestore, "assessments"));
    }

    const querySnapshot = await getDocs(q);
    const tempAssessments: any = [];
    querySnapshot.forEach((doc) => {
      // data(), id로 다큐먼트 필드, id 조회
      tempAssessments.push({id: doc.id, ...doc.data()});
    });
    setAssessments(tempAssessments);

    // user_assessments 정보를 가져와서 상태를 표시한다.
    // 사용자의 모든 문제 리스트를 가져온다.
    const userAssessmentsRef = collection(firestore, `/users/${user.uid}/user_assessments`);
    const userAssessmentsSnap = await getDocs(userAssessmentsRef);
    userAssessmentsSnap.forEach((doc) => {
      // doc.id (assessmentId) 를 찾아서 status 업데이트한다.
      const assessment = tempAssessments.find((item: any) => item.id === doc.id);
      assessment.status = doc.data().status;
    });
    setAssessments([...tempAssessments]);
  }, []);

  const onSelect = (value: any) => {
    const index = questions.findIndex(item => item.date === value.format('YYYY-MM-DD'));
    console.log(index);
    if (index >= 0) {
      history.push(`/study/${value.format('YYYY-MM-DD')}`);
    }
  }

  return (
    <div>
      <Table columns={columns} dataSource={assessments} pagination={false}
             rowKey={record => record.id || ''}></Table>
    </div>
  )
}
