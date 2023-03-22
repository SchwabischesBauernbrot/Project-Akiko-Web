import React, { useState, useEffect, useRef } from "react";
import { fetchAdvancedCharacterEmotion } from "./Api";
function Avatar ({selectedCharacter, emotion}){
  const [currentAvatarImage, setCurrentAvatarImage] = useState(null)
  useEffect(() => {
    const findAvatar = async () =>{
      const data = await fetchAdvancedCharacterEmotion(selectedCharacter, emotion);
      console.log(data)
      if(data !== null){
        setCurrentAvatarImage(data);
      }
    }    
    findAvatar();
  }, [selectedCharacter, emotion]);

  return (
    <div>
    {currentAvatarImage && (
      <img id='model' src={currentAvatarImage}/>
    )}
    </div>
  )
}
export default Avatar