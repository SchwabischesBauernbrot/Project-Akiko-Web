import React, {useEffect, useState} from 'react';
import { fetchCharacters } from '../assets/components/api';
import ConversationSelectionMenu from '../assets/components/chatcomponents/ConversationSelectionMenu';

const Home = () => {
  const [characters, setCharacters] = useState([]);

  const fetchAndSetCharacters = async () => {
    try {
      try {
        const storedCharacters = localStorage.getItem('characters');
        setCharacters(JSON.parse(storedCharacters));
      } catch {
        console.log("No characters in local storage.");
      }
      const data = await fetchCharacters();
      setCharacters(data);
      localStorage.setItem('characters', JSON.stringify(data));
    } catch (error) {
      console.error(error);
      if(localStorage.getItem('characters') === null) {
        console.log("No characters in local storage.");
      }else{
        console.log("Characters loaded from local storage.");
        const storedCharacters = localStorage.getItem('characters');
        setCharacters(JSON.parse(storedCharacters));
      }
    }
  };

  useEffect(() => {
    document.title = 'Project Akiko - Home';
    fetchAndSetCharacters();
  }, []);
  return (
    <div>
      <h1 className='settings-panel-header'>Welcome to Project Akiko</h1>
      <div className='settings-panel'>
      <p>This is a work in progress.  Please check back later. To get started click the 'Characters' icon above</p> 
      </div>
      <ConversationSelectionMenu characters={characters}/>
    </div>
  );
};
  
export default Home;