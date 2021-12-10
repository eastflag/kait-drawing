import {AssessmentVO} from "./AssessmentVO";

export class UserAssessmentVO {
  id?: string;
  user_id?: string;
  assessment?: AssessmentVO;
  status?: ASSESSMENT_STATUS; // none, ongoing(작성중), submit(제출), finish(채점 완료)
}

export enum ASSESSMENT_STATUS {
  NONE,
  ONGOING,
  SUBMIT,
  FINISH
}
