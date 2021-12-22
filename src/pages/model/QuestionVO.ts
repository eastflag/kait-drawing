export class QuestionVO {
  id?: string;
  // num?: number;
  question_title?: string; // 문제 제목
  evaluation_score?: number; // 배점
  type?: string;  // objective: 객관식, subjective: 주관식
  question_image?: string; // 문제 이미지
  content?: string; // 문제 내용
  answers?: Array<string>; // 정답: 복수개 허용
  choice1?: string; // 보기1
  choice2?: string; // 보기2
  choice3?: string; // 보기3
  choice4?: string; // 보기4
  choice5?: string; // 보기5

  date?: string; // 날짜 YYYY-MM-DD
  grade?: string; // 학년
  chapter?: string; // 단원명
}
