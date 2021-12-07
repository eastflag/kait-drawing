import React, {useEffect, useState} from 'react';
import {collectionGroup, doc, getDoc, getDocs, query, where} from "firebase/firestore";
import {firestore} from "../../../firebase";
import {Button, List, Row, Table} from "antd";

const Student = ({history}: any) => {
  const [userQuestions, setUserQuestions] = useState([]);

  useEffect(() => {
    getHomeworkList();
  }, []);

  const columns = [
    {
      title: '목록',
      dataIndex: 'user_id',
      editable: false,
      key: 'user_id',
      render: (text: any, record: any) => (
        <span>{record.grade} - {record.chapter}</span>
      )
    },
    {
      title: '',
      dataIndex: 'question_id',
      key: 'edit',
      render: (text: any, record: any) => (
        <Row justify="end">
          <Button onClick={() => {
            history.push(`/admin/grade/${record.user_id}/${record.question_id}`);
          }}>채점</Button>
        </Row>
      )
    }
  ];

  const getHomeworkList = async () => {
    // collectionGroup 시 인덱스가 미리 생성되어야 한다.
    const q = query(collectionGroup(firestore, 'user_questions'), where('submit', '==', true));
    const querySnapshot = await getDocs(q);

    let tempQuestions: any = [];
    // todo: 컬렉션 부모의 다큐먼트 조회가 필요
    querySnapshot.forEach((doc) => {
      console.log('question_id: ', doc.id, '  user_id: ', doc.ref.parent.parent?.id);
      tempQuestions.push({question_id: doc.id, user_id: doc.ref.parent.parent?.id});
    });

    for (let q of tempQuestions) {
      const question = await getDoc(doc(firestore, 'questions', q.question_id));
      q.grade = question.data()?.grade;
      q.chapter = question.data()?.chapter;
      console.log(question.data());
    }
    setUserQuestions(tempQuestions);
  }

  return (
    <div>
      <Table columns={columns} dataSource={userQuestions} pagination={false}
             rowKey={record => record.user_id + record.question_id}></Table>
    </div>
  );
};

export default Student;
