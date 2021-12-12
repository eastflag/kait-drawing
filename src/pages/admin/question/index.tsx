import React, {useEffect, useState} from 'react';
import {collection, collectionGroup, doc, getDoc, getDocs, query, where} from "firebase/firestore";
import {firestore} from "../../../firebase";
import {Button, List, Row, Table} from "antd";
import {ASSESSMENT_STATUS, UserAssessmentVO} from "../../model/UserAssessmentVO";
import {AssessmentVO} from "../../model/AssessmentVO";
import {ROUTES_PATH} from "../../../routes";

const QuestionIndex = ({history}: any) => {
  const [assessments, setAssessments] = useState<UserAssessmentVO[]>([]);

  useEffect(() => {
    getAssessments();
  }, []);

  const columns = [
    {
      title: '날짜',
      dataIndex: 'date',
      editable: false,
      key: 'date',
      render: (text: any) => (
        <span>{text}</span>
      )
    },
    {
      title: '학년',
      dataIndex: 'grade',
      editable: false,
      key: 'grade',
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
      dataIndex: 'status',
      key: 'status',
      render: (text: any, record: any) => (
        <Row justify="end">
          <Button type="primary" ghost>수정</Button>
        </Row>
      )
    }
  ];

  const getAssessments = async () => {
    // collectionGroup 시 인덱스가 미리 생성되어야 한다.
    const q = query(collection(firestore, 'assessments'));
    const querySnapshot = await getDocs(q);

    let tempAssessments: AssessmentVO[] = [];
    // todo: 컬렉션 부모의 다큐먼트 조회가 필요
    querySnapshot.forEach((doc) => {
      tempAssessments.push({id: doc.id, ...doc.data()});
    });

    setAssessments(tempAssessments);
    console.log(tempAssessments);
  }

  return (
    <div>
      <Row justify="end" style={{padding: '0.5rem'}}>
        <Button onClick={() => history.push(ROUTES_PATH.AdminQuestionRegister)}>문제등록</Button>
      </Row>
      <Table columns={columns} dataSource={assessments} pagination={false}
             rowKey={record => record.id || ''}></Table>
    </div>
  );
};

export default QuestionIndex;
