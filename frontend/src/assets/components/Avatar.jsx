import React, { useState, useEffect, useRef } from "react";
import { fetchAdvancedCharacterDefault } from "./api";
function Avatar ({selectedCharacter, emotion}){
  const [currentAvatarImage, setCurrentAvatarImage] = useState(null)
  useEffect(() => {
    const findAvatar = async () =>{
      const data = await fetchAdvancedCharacterDefault(selectedCharacter);
      console.log(data)
      if(data !== null){
        setCurrentAvatarImage(data);
      }
    }    
    findAvatar();
  }, [selectedCharacter]);

  return (
    <div>
    {currentAvatarImage && (
      <img id='model' src={currentAvatarImage}/>
    )}
    </div>
  )
}
export default Avatar