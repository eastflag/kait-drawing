import {PointVO} from "./PointVO";
import {ShapeType} from "./ShapeType";

export class ShapeVO {
  public identifier?: number = -1; // 멀티 터치를 지원하기 위한 임시 필드
  public pointList: PointVO[];
  public endTime?: number;

  constructor(public startTime?: number, public thickness?: number, public color?: string, public shapeType?: ShapeType) {
    this.pointList = [];
  }
}
