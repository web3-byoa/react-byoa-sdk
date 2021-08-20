import React, { useState } from "react";

// @ts-expect-error
export default function DragMove(props) {
  const {
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onDragMove,
    children,
    style,
    className
  } = props;

  const [isDragging, setIsDragging] = useState(false);

  // @ts-expect-error
  const handlePointerDown = (e) => {
    setIsDragging(true);

    onPointerDown(e);
  };

  // @ts-expect-error
  const handlePointerUp = (e) => {
    setIsDragging(false);

    onPointerUp(e);
  };

  // @ts-expect-error
  const handlePointerMove = (e) => {
    if (isDragging) onDragMove(e);

    onPointerMove(e);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}

DragMove.defaultProps = {
  onPointerDown: () => {},
  onPointerUp: () => {},
  onPointerMove: () => {}
};
