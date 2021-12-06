export class UserQuestionVO {
  id?: string;
  answer?: []; // 학생이 그린 드로잉
  grade?: []; // 선생님이 그린 드로잉
  submit?: boolean; // 학생의 제출 여부
  score?: number; // 채점 점수
}
