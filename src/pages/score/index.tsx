import {UserVO} from "../model/UserVO";
import {useDispatch, useSelector} from "react-redux";
import React, {useCallback, useEffect, useState} from "react";
import {Button, Row, Table} from "antd";
import {collection, doc, getDoc, getDocs, query, where} from "firebase/firestore";
import {firestore} from "../../firebase";
import {ASSESSMENT_STATUS, UserAssessmentVO} from "../model/UserAssessmentVO";
import {setTitle} from "../../redux/reducers/CommonReducer";

export const ScoreIndex = ({history}: any) => {
  const user: UserVO = useSelector(({User}: any) => User);
  const [assessments, setAssessments] = useState<UserAssessmentVO[]>([]);
  
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTitle('채점결과'));
    getUserAssessments();
  }, []);

  const columns = [
    {
      title: '학년',
      dataIndex: 'assessment',
      editable: false,
      key: 'category',
      render: (assessment: any) => (
        <span>{assessment.category}</span>
      )
    },
    {
      title: '단원',
      dataIndex: 'assessment',
      editable: false,
      key: 'assessment.subCategory',
      render: (assessment: any) => (
        <span>{assessment.subCategory}</span>
      )
    },
    {
      title: '제목',
      dataIndex: 'assessment',
      editable: false,
      key: 'assessment.title',
      render: (assessment: any) => (
        <span>{assessment.title}</span>
      )
    },
    {
      title: '',
      dataIndex: 'id',
      key: 'id',
      render: (text: any, record: any) => (
        <Row justify="end">
          <Button type="primary" ghost onClick={() => history.push(`/user/study/${text}`)}>
            {record.status === ASSESSMENT_STATUS.ONGOING && '작성중'}
            {record.status === ASSESSMENT_STATUS.SUBMIT && '제출완료'}
            {record.status === ASSESSMENT_STATUS.FINISH && '채점완료'}
          </Button>
        </Row>
      )
    }
  ];

  const getUserAssessments = useCallback(async () => {
    // 사용자의 모든 문제 리스트를 가져온다.
    const userAssessmentsRef = collection(firestore, `/users/${user.uid}/user_assessments`);
    const userAssessmentsSnap = await getDocs(userAssessmentsRef);
    const tempAssessments: any = [];
    userAssessmentsSnap.forEach((doc) => {
      // data(), id로 다큐먼트 필드, id 조회
      tempAssessments.push({id: doc.id, ...doc.data()});
    });
    setAssessments(tempAssessments);
    console.log(tempAssessments);
  }, []);

  return (
    <div>
      <Table columns={columns} dataSource={assessments} pagination={false}
             rowKey={record => record.id || ''}></Table>
    </div>
  )
}
