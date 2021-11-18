import React from "react";
import styles from './MyCanvas.module.scss';
import {useEffect, useRef, useState} from "react";
import {ShapeVO} from "../model/ShapeVO";
import {ShapeType} from "../model/ShapeType";
import {PointVO} from "../model/PointVO";

interface Props {
  answer: any;
  setAnswer: any;
}

export const MyCanvas: React.FC<Props> = ({answer, setAnswer}) => {
  const wrapperRef = useRef<any>();
  const canvasRef = useRef<any>();
  const contextRef = useRef<any>();
  const isDrawingRef = useRef<boolean>(false);

  // 현재 그려지는 객체
  const [drObj, setDrObj] = useState<ShapeVO>(new ShapeVO());

  useEffect(() => {
    // We can't access the rendering context until the canvas is mounted to the DOM.
    // canvas 넓이와 높이를 부모에 fit하게 조정
    const myCanvas = canvasRef.current;
    myCanvas.width = document.getElementById('canvas-wrapper')?.clientWidth;
    myCanvas.height = document.getElementById('canvas-wrapper')?.clientHeight;
    contextRef.current = myCanvas.getContext("2d");
    contextRef.current.imageSmoothingEnabled = false;
  }, [])

  useEffect(() => {
    // 지우기
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    answer.forEach((item: ShapeVO) => {
      contextRef.current.lineWidth = item.thickness;
      contextRef.current.strokeStyle = item.color;
      let idx = 1;
      let point: PointVO;
      for (point of item.pointList) {
        if (idx === 1) {
          contextRef.current.beginPath();
          contextRef.current.moveTo(point.x, point.y);
        } else if (idx === item.pointList.length) {

        } else {
          contextRef.current.lineTo(point.x, point.y);
          contextRef.current.stroke();
        }
        ++idx;
      }
    });
  }, [answer]);

  const drawingStart = (x: number, y: number) => {
    isDrawingRef.current = true;

    // 저장
    const drObj = new ShapeVO(new Date().getTime(), 1, '#333333', ShapeType.POINT);
    drObj.pointList.push(new PointVO(x, y));
    setDrObj((prevDrObj: ShapeVO) => drObj);

    // 그리기
    contextRef.current.lineWidth = drObj.thickness;
    contextRef.current.strokeStyle = drObj.color;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  }

  const drawingMove = (x: number, y: number) => {
    if (!isDrawingRef.current) {
      return;
    }

    // 저장
    setDrObj((prevDrObj: ShapeVO) => {
      prevDrObj?.pointList.push(new PointVO(x, y));
      return prevDrObj;
    });

    // 그리기
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  }

  const drawingEnd = () => {
    // 저장
    setDrObj((prevDrObj: ShapeVO) => {
      // prevDrObj?.pointList.push(new PointVO(x, y));
      prevDrObj.endTime = new Date().getTime();
      answer.push(prevDrObj);
      setAnswer(answer);
      return prevDrObj;
    });
    // 초기화
    isDrawingRef.current = false;
  }

  const handleMouseDown = (e: any) => {
    const {nativeEvent} = e;
    console.log('mouse down: ', nativeEvent.offsetX, ' ', nativeEvent.offsetY);
    drawingStart(nativeEvent.offsetX, nativeEvent.offsetY);
  }

  const handleTouchStart = (e: any) => {
    console.log('touchStart: ', e);
    const rect = e.target.getBoundingClientRect();
    drawingStart(e.targetTouches[0].pageX - rect.left, e.targetTouches[0].pageY - rect.top);
  }

  const handleMouseMove = (e: any) => {
    const {nativeEvent} = e;
    drawingMove(nativeEvent.offsetX, nativeEvent.offsetY);
  }

  const handleTouchMove = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    drawingMove(e.targetTouches[0].pageX - rect.left, e.targetTouches[0].pageY - rect.top);
  }

  const handleMouseUp = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const {nativeEvent} = e;
    console.log('touchMove: ', e);
    drawingEnd();
  }

  const handleTouchEnd = (e: any) => {
    const {nativeEvent} = e;
    console.log('touchEnd: ', e);
    drawingEnd();
  }

  return (
    <div className={styles['canvas-wrapper']} ref={wrapperRef} id="canvas-wrapper">
      <canvas className={styles.canvas} ref={canvasRef} id="canvas"
        onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}></canvas>
    </div>
  );
}