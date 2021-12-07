import React from "react";
import styles from './MyCanvas.module.scss';
import {useEffect, useRef, useState} from "react";
import {ShapeVO} from "../model/ShapeVO";
import {ShapeType} from "../model/ShapeType";
import {PointVO} from "../model/PointVO";
import _ from "lodash";
import {message} from "antd";
import classNames from "classnames";

interface Props {
  answer: any;
  setAnswer: any;
  marks: any;
  submit: boolean;
  saveAnswer: any;
}

export const MyCanvas: React.FC<Props> = ({answer, setAnswer, marks, submit, saveAnswer}) => {
  const wrapperRef = useRef<any>();
  const canvasRef = useRef<any>();
  const contextRef = useRef<any>();

  // 싱글 터치: 현재 그려지는 객체
  let drObj: any = null;
  // 멀티 터치: 현재 그려지는 객체 리스트 (멀티 터치 지원)
  const drList: ShapeVO[] = [];

  useEffect(() => {
    // We can't access the rendering context until the canvas is mounted to the DOM.
    // canvas 넓이와 높이를 부모에 fit하게 조정
    const myCanvas = canvasRef.current;
    myCanvas.width = document.getElementById('canvas-wrapper')?.clientWidth;
    myCanvas.height = document.getElementById('canvas-wrapper')?.clientHeight;
    contextRef.current = myCanvas.getContext("2d");
    contextRef.current.imageSmoothingEnabled = false;

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    }
  }, []);

  const resizeCanvas = () => {
    canvasRef.current.width = document.getElementById('canvas-wrapper')?.clientWidth;
    canvasRef.current.height = document.getElementById('canvas-wrapper')?.clientHeight;
  }

  useEffect(() => {
    // 지우기
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    answer.forEach((item: ShapeVO) => {
      if (item.pointList.length >= 2) {
        for (let i = 1; i < item.pointList.length; ++i) {
          contextRef.current.beginPath();
          contextRef.current.lineWidth = item.thickness;
          contextRef.current.strokeStyle = item.color;
          contextRef.current.moveTo(item.pointList[i-1].x, item.pointList[i-1].y);
          contextRef.current.lineTo(item.pointList[i].x, item.pointList[i].y);
          contextRef.current.stroke();
        }
      }
    });
  }, [answer]);

  useEffect(() => {
    marks.forEach((item: ShapeVO) => {
      if (item.pointList.length >= 2) {
        for (let i = 1; i < item.pointList.length; ++i) {
          contextRef.current.beginPath();
          contextRef.current.lineWidth = item.thickness;
          contextRef.current.strokeStyle = item.color;
          contextRef.current.moveTo(item.pointList[i-1].x, item.pointList[i-1].y);
          contextRef.current.lineTo(item.pointList[i].x, item.pointList[i].y);
          contextRef.current.stroke();
        }
      }
    });
  }, [marks])

  const drawingStart = (x: number, y: number) => {
    // 저장
    drObj = new ShapeVO(new Date().getTime(), 1, '#333333', ShapeType.POINT);
    drObj.pointList.push(new PointVO(x, y));
  }

  const drawingMove = (x: number, y: number) => {
    if (!drObj) {
      return;
    }

    // 저장
    drObj.pointList.push(new PointVO(x, y));
    // 그리기 현재 포인트와 이전 포인트 사이를 라인으로 그린다.
    const length = drObj.pointList.length;
    contextRef.current.beginPath();
    contextRef.current.moveTo(drObj.pointList[length - 2].x, drObj.pointList[length - 2].y);
    contextRef.current.lineTo(drObj.pointList[length - 1].x, drObj.pointList[length - 1].y);
    contextRef.current.lineWidth = 1;
    contextRef.current.stroke();
  }

  // todo: debounce가 제대로 적용되지 않는다.
  const debounceSave = _.debounce(saveAnswer, 3000);

  const drawingEnd = () => {
    // 저장
    drObj.endTime = new Date().getTime();
    answer.push(drObj);
    setAnswer(answer);
    // 초기화
    drObj = null;
    // 저장
    // debounceSave();
  }

  const handleMouseDown = (e: any) => {
    const {nativeEvent} = e;
    drawingStart(nativeEvent.offsetX, nativeEvent.offsetY);
  }

  const handleMouseMove = (e: any) => {
    const {nativeEvent} = e;
    drawingMove(nativeEvent.offsetX, nativeEvent.offsetY);
  }

  const handleMouseUp = (e: any) => {
    drawingEnd();
  }

  const handleTouchStart = (e: any) => {
    e.preventDefault();
    const touches = e.changedTouches;

    const rect = e.target.getBoundingClientRect();
    // drawingStart(e.targetTouches[0].pageX - rect.left, e.targetTouches[0].pageY - rect.top);

    for (let i = 0; i < touches.length; i++) {
      let touch = touches[i];

      // palm rejection
      if (touch.radiusX < 0.01) {
        // 저장
        const drObj = new ShapeVO(new Date().getTime(), 1, '#333333', ShapeType.POINT);
        drObj.pointList.push(new PointVO(touch.pageX - rect.left, touch.pageY - rect.top));
        drObj.identifier = touch.identifier;
        drList.push(drObj);
      }
    }
    return false;
  }

  const handleTouchMove = (e: any) => {
    e.preventDefault();
    const touches = e.changedTouches;
    const rect = e.target.getBoundingClientRect();

    for (let i = 0; i < touches.length; i++) {
      let touch = touches[i];
      let currentTouchIndex = drList.findIndex(item => item.identifier === touch.identifier);

      if (currentTouchIndex >= 0) {
        // 저장
        const currentTouch = drList[currentTouchIndex];
        currentTouch.pointList.push(new PointVO(touch.pageX - rect.left, touch.pageY - rect.top));

        // 그리기 현재 포인트와 이전 포인트 사이를 라인으로 그린다.
        const length = currentTouch.pointList.length;
        contextRef.current.beginPath();
        contextRef.current.moveTo(currentTouch.pointList[length - 2].x, currentTouch.pointList[length - 2].y);
        contextRef.current.lineTo(currentTouch.pointList[length - 1].x, currentTouch.pointList[length - 1].y);
        contextRef.current.lineWidth = 1;
        contextRef.current.stroke();
      }
    }
    return false;
  }

  const handleTouchEnd = (e: any) => {
    e.preventDefault();
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      let touch = touches[i];
      let currentTouchIndex = drList.findIndex(item => item.identifier === touch.identifier);
      if (currentTouchIndex >= 0) {
        // 저장
        const currentTouch = drList[currentTouchIndex];
        currentTouch.endTime = new Date().getTime();
        answer.push(currentTouch);
        setAnswer(answer);
        // debounceSave();
        // 목록에서 삭제
        drList.splice(currentTouchIndex, 1);
      }
    }
    return false;
  }

  return (
    <div className={styles['canvas-wrapper']} ref={wrapperRef} id="canvas-wrapper">
      <canvas className={classNames(styles.canvas, {[styles.disabled]: submit})} ref={canvasRef} id="canvas"
        onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      ></canvas>
    </div>
  );
}
