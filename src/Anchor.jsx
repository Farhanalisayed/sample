import React, { useRef } from "react";
import { Circle } from "react-konva";

const dragBounds = (ref) => {
  if (ref.current !== null) {
    return ref.current.getAbsolutePosition();
  }
  return {
    x: 0,
    y: 0
  };
}

const Anchor = ({ x, y, id, onDragMove, onDragEnd, onDragStart }) => {
  const anchor = useRef(null);
  return (
    <Circle
      x={x}
      y={y}
      radius={5}
      fill="black"
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      onDragMove={(e) => onDragMove(e, id)}
      onDragEnd={(e) => onDragEnd(e, id)}
      dragBoundFunc={() => dragBounds(anchor)}
      perfectDrawEnabled={false}
      ref={anchor}
    />
  );
}
export default Anchor