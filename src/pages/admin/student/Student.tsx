import React, {useEffect} from 'react';
import {collectionGroup, getDocs, query, where} from "firebase/firestore";
import {firestore} from "../../../firebase";

const Student = () => {
  useEffect(() => {
    getHomeworkList();
  }, []);

  const getHomeworkList = async () => {
    // 오늘 날짜의 모든 문제 리스트를 가져온다.
    const q = query(collectionGroup(firestore, "questions"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      // data(), id로 다큐먼트 필드, id 조회
      console.log(doc.data());
    });
  }

  return (
    <div>
      student
    </div>
  );
};

export default Student;
