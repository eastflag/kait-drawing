import React, {useEffect, useState} from 'react';
import {collection, collectionGroup, doc, getDoc, getDocs, query, where} from "firebase/firestore";
import {firestore} from "../../../firebase";
import {Button, List, Row, Space, Table} from "antd";
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
          <Space>
            <Button type="primary" ghost onClick={() => exportAssessmentToJson(record.user_id, record.id)}>data download</Button>
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
          </Space>
        </Row>
      )
    }
  ];

  const exportAssessmentToJson = async (user_id: string, assessment_id: string) => {
    const tempUserQuestions: any = [];
    const userQuestionsRef = query(collection(firestore, `/users/${user_id}/user_assessments/${assessment_id}/user_questions`));
    const userQuestionsSnap = await getDocs(userQuestionsRef);
    userQuestionsSnap.forEach(doc => {
      tempUserQuestions.push({id: doc.id, ...doc.data()});
    })
    const fileName = `${new Date().getTime()}.json`;
    const fileType = 'text/json';
    const blob = new Blob([JSON.stringify(tempUserQuestions)], { type: fileType });

    const a = document.createElement("a");
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  }

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
