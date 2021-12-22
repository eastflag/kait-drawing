import {UserVO} from "../model/UserVO";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {Space, Radio, message, Layout} from "antd";
import {firestore} from "../../firebase";
import {doc, setDoc} from "firebase/firestore";
import {setUser} from "../../redux/reducers/UserReducer";
import {setLoading} from "../../redux/reducers/NotiReducer";

const gradeList = [
  '중1', '중2', '중3', '고1', '고2', '고3'
]

export const Setting = () => {
  const user: UserVO = useSelector(({User}: any) => User);
  const [grade, setGrade] = useState<string>();

  const dispatch = useDispatch();

  useEffect(() => {
    if (user.grade) {
      setGrade(user.grade);
    }
  }, []);

  const onChange = async (e: any) => {
    dispatch(setLoading(true));

    try {
      await setDoc(doc(firestore, `/users/${user.uid}`), {
        grade: e.target.value
      }, {merge: true});
      setGrade(e.target.value);
      const newUser = {...user};
      newUser.grade = e.target.value;
      dispatch(setUser(newUser));
      message.info('저장하였습니다.');
    } catch(e) {
      console.log(e);
    } finally {
      dispatch(setLoading(false));
    }
  }

  return (
    <Layout.Content style={{padding: '1.5rem'}}>
      <h4>학년 설정</h4>
      <Radio.Group onChange={onChange} value={grade}>
        <Space direction="vertical">
          {
            gradeList.map(item => <Radio key={item} value={item}>{item}</Radio>)
          }
        </Space>
      </Radio.Group>
    </Layout.Content>
  )
}
