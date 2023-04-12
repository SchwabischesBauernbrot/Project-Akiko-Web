import React, {useState, useEffect} from "react";
import { getCharacterImageUrl, fetchCharacter, updateAdvancedCharacter, fetchAdvancedCharacterEmotion } from "../assets/components/api";
import EmotionSprites from "../assets/components/advancedcharactercomponents/EmotionSprites";
import TextToSpeech from "../assets/components/advancedcharactercomponents/TextToSpeech";

const AdvancedCharacter = () => {
    const [character, setCharacter] = useState(null);
    const [characterAvatar, setCharacterAvatar] = useState(null);
    useEffect(() => {
        const fetchCharacterData = async () => {
            var selectedChar = localStorage.getItem('selectedCharacter');
            if (selectedChar) {
                console.log(selectedChar);
                selectedChar = await fetchCharacter(selectedChar);
                setCharacter(selectedChar); // set the state to the character object
                setCharacterAvatar(getCharacterImageUrl(selectedChar.avatar));
            }
        };
        fetchCharacterData();
    }, []);

    return (
        <div>
        {character && (
        <>
        <h1 className="settings-panel-header text-xl font-bold mb-4">{character === null ? 'Placeholder' : character.name} - Advanced Settings</h1>
        <div className="settings-panel">
            <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-12">
                <div>
                    <EmotionSprites character={character}/>
                </div>
                <div>
                    <TextToSpeech character={character}/>
                </div>
            </div>
        </div>
        </>
        )}
        </div>
    )
};
export default AdvancedCharacter;