import React, { useState, useRef, useEffect } from "react";
import "./Slider.css";

const IncSlider = ({ onChange }) => {
  const [value, setValue] = useState(12);
  const sliderRef = useRef();
  const thumbRef = useRef();
  const trackRef = useRef();
  const progressRef = useRef();
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const { left: sliderLeft, width: sliderWidth } = sliderRef.current.getBoundingClientRect();
      const { width: thumbWidth } = thumbRef.current.getBoundingClientRect();
      const { left: trackLeft, width: trackWidth } = trackRef.current.getBoundingClientRect();
      const mouseX = e.clientX - trackLeft - thumbWidth / 2;
      let newValue = Math.floor(mouseX / (trackWidth / 5)) * 2 + 12;
      if (newValue < 12) newValue = 12;
      if (newValue > 20) newValue = 20;
      setValue(newValue);
      progressRef.current.style.width = `${((newValue - 12) / 8) * 100}%`;
      onChange(newValue);
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
  }, [onChange]);

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  return (
    <div className="slider" ref={sliderRef} onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}>
      <div className="slider__thumb" ref={thumbRef} style={{ left: `${((value - 12) / 8) * 100}%` }}>
        <div className="slider__value">{value}</div>
      </div>
      <div className="slider__track" ref={trackRef}>
        <div className="slider__progress" ref={progressRef}></div>
      </div>
    </div>
  );
};

export default IncSlider;
