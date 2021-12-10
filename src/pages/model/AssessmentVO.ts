export class AssessmentVO {
  id?: string;
  date?: string; // 날짜 YYYY-MM-DD
  grade?: string; // 학년
  title?: string; // 제목
  status?: string; // none, ongoing(작성중), submit(제출), finish(채점 완료)
}
