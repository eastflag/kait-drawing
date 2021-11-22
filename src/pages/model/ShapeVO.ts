import {PointVO} from "./PointVO";
import {ShapeType} from "./ShapeType";

export class ShapeVO {
  public identifier?: number = 0;
  public pointList: PointVO[];
  public endTime?: number;

  constructor(public startTime?: number, public thickness?: number, public color?: string, public shapeType?: ShapeType) {
    this.pointList = [];
  }
}