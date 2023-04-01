import { useEffect, useState } from 'react';
import { getAvailableModules } from '../api';

function AvailableModules() {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    async function fetchModules() {
      const availableModules = await getAvailableModules();
      setModules(availableModules);
    }
    fetchModules();
  }, []);

  return (
    <div className="centered settings-box">
      <h2>Available Modules</h2>
        {modules.map((module) => (
          <p key={module}>{module}</p>
        ))}
    </div>
  );
}

export default AvailableModules;
