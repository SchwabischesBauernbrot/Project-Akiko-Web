import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FrontNav from './assets/components/NavBar';
import Home from './pages';
import Chat from './pages/chat';
import Characters from './pages/characters';
import Settings from './pages/settings';
import DiscordBot from './pages/discordbot';
import AdvancedCharacter from './pages/advancedcharacter';
import { getAvailableModules } from './assets/components/api';
import 'tailwindcss/tailwind.css';

function App() {
  const [showNavBar, setShowNavBar] = useState(false);

  useEffect(() => {
    async function fetchModules() {
      await getAvailableModules();
    }
    fetchModules();
  }, []);

  return (
    <Router>
      <FrontNav showNavBar={showNavBar} setShowNavBar={setShowNavBar} />
      <main
        className="transition-all duration-100"
        style={{ paddingTop: showNavBar ? '.25rem' : '0' }} // Replace [max-height] with the maximum height of the NavBar
      >
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/discordbot" element={<DiscordBot />} />
          <Route path="/test" element={<test />} />
          <Route path="/advcharacter" element={<AdvancedCharacter />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
