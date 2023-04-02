import React, { useState, useEffect, useRef } from "react";
import { fetchAdvancedCharacterEmotion } from "./api";

function Avatar({ selectedCharacter, emotion, position }) {
  const [currentAvatarImage, setCurrentAvatarImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [initialX, setInitialX] = useState(0);
  const [initialY, setInitialY] = useState(0);
  const [xOffset, setXOffset] = useState(0);
  const [yOffset, setYOffset] = useState(0);
  
  useEffect(() => {
    const findAvatar = async () => {
      const data = await fetchAdvancedCharacterEmotion(selectedCharacter, emotion);
      if (data !== null) {
        setCurrentAvatarImage(data);
      }
    };
    findAvatar();
  }, [selectedCharacter, emotion]);

  const avatarRef = useRef(null);
  let currentX;
  let currentY;

  const handleMouseDown = (e) => {
    setInitialX(e.clientX - xOffset);
    setInitialY(e.clientY - yOffset);

    if (e.target === avatarRef.current) {
      setIsDragging(true);
    }
  };

  const handleTouchStart = (e) => {
    setInitialX(e.touches[0].clientX - xOffset);
    setInitialY(e.touches[0].clientY - yOffset);

    if (e.target === avatarRef.current) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      setXOffset(currentX);
      setYOffset(currentY);

      setTranslate(currentX, currentY, avatarRef.current);
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;

      setXOffset(currentX);
      setYOffset(currentY);

      setTranslate(currentX, currentY, avatarRef.current);
    }
  };

  const setTranslate = (xPos, yPos, el) => {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  };

  return (
    <div>
      {currentAvatarImage && (
        <img
          id={position === 0 ? "model-right" : "model-left"}
          ref={avatarRef}
          draggable={false}
          src={currentAvatarImage}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        />
      )}
    </div>
  );
}

export default Avatar;
