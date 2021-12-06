export class UserQuestionVO {
  id?: string;
  answer?: any; // 학생이 그린 드로잉
  marks?: any; // 선생님이 그린 드로잉
  submit?: boolean; // 학생의 제출 여부
  grade?: boolean; // 선생님 채점 여부
  score?: number; // 채점 점수
}
