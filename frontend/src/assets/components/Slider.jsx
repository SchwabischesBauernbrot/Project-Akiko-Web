import React, { useState, useRef, useEffect } from "react";
import "../css/Slider.css";

const Slider = () => {
  const [value, setValue] = useState(50);
  const sliderRef = useRef();
  const thumbRef = useRef();
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const { left: sliderLeft, width: sliderWidth } =
        sliderRef.current.getBoundingClientRect();
      const { width: thumbWidth } = thumbRef.current.getBoundingClientRect();
      let newValue = ((e.clientX - sliderLeft) / (sliderWidth - thumbWidth)) * 100;
      if (newValue < 0) newValue = 0;
      if (newValue > 100) newValue = 100;
      setValue(newValue);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
  };

  return (
    <div
      className="slider"
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
    <div><input className="slider__value" placeholder={value.toFixed(1)}></input></div>
      <div className="slider__thumb" ref={thumbRef} style={{ left: `${value}%` }}>
      
      </div>
      <div className="slider__track">
        <div className="slider__progress" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

export default Slider;
