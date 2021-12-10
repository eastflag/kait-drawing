import {QuestionVO} from "./QuestionVO";

export class UserQuestionVO {
  id?: string;
  question?: QuestionVO;
  answers?: any; // 학생이 그린 드로잉
  marks?: any; // 선생님이 그린 드로잉
  score?: number; // 채점 점수
}
