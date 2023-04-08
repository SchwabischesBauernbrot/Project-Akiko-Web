import React, { useState, useEffect } from "react";
import { fetchAdvancedCharacterEmotions, fetchAdvancedCharacterEmotion, saveAdvancedCharacterEmotion, deleteAdvancedCharacterEmotion } from '../api';
import { FiImage } from "react-icons/fi";
import { capitalizeFirstLetter } from "../miscfunctions";

const EmotionSprites = ({ character }) => {
    const possibleEmotions = [
        'default',
        'admiration', 
        'amusement', 
        'anger', 
        'annoyance', 
        'approval', 
        'caring', 
        'confusion', 
        'curiosity',  
        'desire', 
        'disappointment', 
        'disapproval', 
        'disgust', 
        'embarrassment', 
        'excitement', 
        'fear', 
        'gratitude', 
        'grief', 
        'joy', 
        'love', 
        'nervousness', 
        'neutral', 
        'optimism', 
        'pride', 
        'realization', 
        'relief', 
        'remorse', 
        'sadness', 
        'surprise',
    ];
    const [sprites, setSprites] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const availableEmotions = await fetchAdvancedCharacterEmotions(character);
            const spritePromises = availableEmotions.map(async emotion => {
                const sprite = await fetchAdvancedCharacterEmotion(character, emotion);
                return { [emotion]: sprite };
            });
            const fetchedSprites = await Promise.all(spritePromises);
            const sprites = possibleEmotions.reduce((acc, emotion) => {
                const fetchedSprite = fetchedSprites.find(sprite => sprite[emotion]);
                return { ...acc, [emotion]: fetchedSprite ? fetchedSprite[emotion] : null };
            }, {});
            setSprites(sprites);
        };
        fetchData();
    }, [character]);

    const handleFileUpload = async (emotion, e) => {
        const file = e.target.files[0];
        if (file) {
            const spritePath = await saveAdvancedCharacterEmotion(character, emotion, file);
            setSprites({ ...sprites, [emotion]: spritePath });
        }
    };

    const handleDelete = async (emotion) => {
        const response = await deleteAdvancedCharacterEmotion(character, emotion);
        if (response.success) {
            setSprites({ ...sprites, [emotion]: null });
        } else {
            console.error(response.failure);
        }
    };

    
    return (
        <div className="flex flex-col items-center mt-6" id="emotion-sprites">
            <h1 className="text-xl font-bold">Emotion Sprites</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-6">
                {possibleEmotions.map(emotion => (
                    <div key={emotion} className="bg-selected p-4 rounded-lg shadow-md flex-row justify-center">
                        <div className="flex flex-col items-center">
                            <div className="text-base font-bold mb-2 text-center">{capitalizeFirstLetter(emotion)}</div>
                            <div className="h-42 w-32 bg-selected-bb-color mb-4 flex items-center justify-center rounded-lg overflow-hidden">
                                {sprites[emotion] ? <img src={sprites[emotion]} alt={`${emotion} sprite`} /> : <FiImage className="w-24 h-24 text-selected-text"/>}
                            </div>
                            <div className="flex">
                                <input
                                    type="file"
                                    className="hidden"
                                    id={`upload-${emotion}`}
                                    onChange={(e) => handleFileUpload(emotion, e)}
                                />
                                <label htmlFor={`upload-${emotion}`} className="text-selected-text bg-selected w-1/2 h-full p-2 rounded-lg shadow-md backdrop-blur-md border-none outline-none justify-center cursor-pointer hover:bg-blue-600">Upload</label>
                                <button
                                    onClick={() => handleDelete(emotion)}
                                    className="text-selected-text bg-selected w-1/2 h-full p-2 rounded-lg shadow-md backdrop-blur-md border-none outline-none justify-center cursor-pointer hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmotionSprites;
