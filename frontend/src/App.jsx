import { useEffect } from 'react';
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
  useEffect(() => {
    async function fetchModules() {
      await getAvailableModules();
    }
    fetchModules();
  }, []);

  return (
    <Router>
      <FrontNav />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/discordbot" element={<DiscordBot />} />
        <Route path="/test" element={<test />} />
        <Route path="/advcharacter" element={<AdvancedCharacter />} />
      </Routes>
    </Router>
  );
}

export default App;
