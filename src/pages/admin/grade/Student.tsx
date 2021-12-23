import React, {useEffect, useState} from 'react';
import {collectionGroup, doc, getDoc, getDocs, query, where} from "firebase/firestore";
import {firestore} from "../../../firebase";
import {Button, List, Row, Table} from "antd";
import {ASSESSMENT_STATUS, UserAssessmentVO} from "../../model/UserAssessmentVO";

const Student = ({history}: any) => {
  const [userAssessments, setUserAssessments] = useState<UserAssessmentVO[]>([]);

  useEffect(() => {
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
      key: 'subCategory',
      render: (assessment: any) => (
        <span>{assessment.subCategory}</span>
      )
    },
    {
      title: '제목',
      dataIndex: 'assessment',
      editable: false,
      key: 'title',
      render: (assessment: any) => (
        <span>{assessment.title}</span>
      )
    },
    {
      title: '',
      dataIndex: 'status',
      key: 'status',
      render: (text: any, record: any) => (
        <Row justify="end">
          {
            text === ASSESSMENT_STATUS.SUBMIT &&
              <Button type="primary" onClick={() => {
                history.push(`/admin/grade/${record.user_id}/${record.id}`);
              }}>채점</Button>
          }
          {
            text === ASSESSMENT_STATUS.FINISH &&
              <Button type="primary" ghost onClick={() => {
                history.push(`/admin/grade/${record.user_id}/${record.id}`);
              }}>완료</Button>
          }
        </Row>
      )
    }
  ];

  const getUserAssessments = async () => {
    // collectionGroup 시 인덱스가 미리 생성되어야 한다.
    const q = query(collectionGroup(firestore, 'user_assessments'));
    const userAssessmentsSnapshot = await getDocs(q);

    let tempUserAssessments: UserAssessmentVO[] = [];
    // todo: 컬렉션 부모의 다큐먼트 조회가 필요
    userAssessmentsSnapshot.forEach((doc) => {
      tempUserAssessments.push({id: doc.id, ...doc.data(), user_id: doc.ref.parent.parent?.id});
    });

    setUserAssessments(tempUserAssessments);
  }

  return (
    <div>
      <Table columns={columns} dataSource={userAssessments} pagination={false}
             rowKey={record => record.id || ''}></Table>
    </div>
  );
};

export default Student;
