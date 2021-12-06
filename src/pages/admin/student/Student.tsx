import React, {useEffect, useState} from 'react';
import {collectionGroup, getDocs, query, where} from "firebase/firestore";
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
      dataIndex: 'id',
      editable: false,
      key: 'id',
    },
    {
      title: '',
      dataIndex: 'id',
      key: 'edit',
      render: (id: any) => (
        <Row justify="end">
          <Button onClick={() => {
            history.push(`/admin/grade/${id}`);
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
      console.log(doc.data(), ' ', doc.ref.parent.parent);
      tempQuestions.push({id: doc.id, ...doc.data()});
    });
    setUserQuestions(tempQuestions);
  }

  return (
    <div>
      <Table columns={columns} dataSource={userQuestions} pagination={false}></Table>
    </div>
  );
};

export default Student;
