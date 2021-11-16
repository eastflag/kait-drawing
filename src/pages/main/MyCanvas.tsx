import styles from './MyCanvas.module.scss';
import {useEffect, useRef, useState} from "react";
import {ShapeVO} from "../model/ShapeVO";
import {ShapeType} from "../model/ShapeType";
import {PointVO} from "../model/PointVO";

export const MyCanvas = () => {
  const wrapperRef = useRef<any>();
  const canvasRef = useRef<any>();
  const contextRef = useRef<any>();
  const isDrawingRef = useRef<boolean>(false);

  // 현재 그려지는 객체
  const [drObj, setDrObj] = useState<ShapeVO>(new ShapeVO());
  // 캔버스에 그려지는 모든 객체
  const [drList, setDrList] = useState<ShapeVO[]>([]);

  useEffect(() => {
    // We can't access the rendering context until the canvas is mounted to the DOM.
    // canvas 넓이와 높이를 부모에 fit하게 조정
    const myCanvas = canvasRef.current;
    myCanvas.width = document.getElementById('canvas-wrapper')?.clientWidth;
    myCanvas.height = document.getElementById('canvas-wrapper')?.clientHeight;
    contextRef.current = myCanvas.getContext("2d");
    contextRef.current.imageSmoothingEnabled = false;
  }, [])

  const handleMouseDown = (e: any) => {
    const {nativeEvent} = e;
    console.log('mouse down: ', nativeEvent.offsetX, ' ', nativeEvent.offsetY);
    isDrawingRef.current = true;

    // 저장
    const drObj = new ShapeVO(new Date().getTime(), 1, '#333333', ShapeType.POINT);
    drObj.pointList.push(new PointVO( nativeEvent.offsetX, nativeEvent.offsetY));
    setDrObj((prevDrObj: ShapeVO) => drObj);

    // 그리기
    contextRef.current.lineWidth = drObj.thickness;
    contextRef.current.strokeStyle = drObj.color;
    contextRef.current.beginPath();
    contextRef.current.moveTo(nativeEvent.offsetX, nativeEvent.offsetY);
  }

  const handleMouseMove = (e: any) => {
    if (!isDrawingRef.current) {
      return;
    }

    // 저장
    const {nativeEvent} = e;
    setDrObj((prevDrObj: ShapeVO) => {
      prevDrObj?.pointList.push(new PointVO(nativeEvent.offsetX, nativeEvent.offsetY));
      return prevDrObj;
    });

    // 그리기
    contextRef.current.lineTo(nativeEvent.offsetX, nativeEvent.offsetY);
    contextRef.current.stroke();
  }

  const handleMouseUp = (e: any) => {
    const {nativeEvent} = e;
    console.log('mouse up: ', nativeEvent.offsetX, ' ', nativeEvent.offsetY);
    // 저장
    setDrObj((prevDrObj: ShapeVO) => {
      prevDrObj?.pointList.push(new PointVO(nativeEvent.offsetX, nativeEvent.offsetY));
      prevDrObj.endTime = new Date().getTime();
      drList.push(prevDrObj);
      setDrList(drList);
      return prevDrObj;
    });
    // 초기화
    isDrawingRef.current = false;

    setTimeout(() => console.log(drList), 1000);

  }

  return (

    <div className={styles['canvas-wrapper']} ref={wrapperRef} id="canvas-wrapper">
      <canvas className={styles.canvas} ref={canvasRef} id="canvas"
        onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}></canvas>
    </div>
  );
}