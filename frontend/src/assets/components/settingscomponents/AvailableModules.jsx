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
    <div className='settings-box' id='modules'>
      <h2 className='settings-box'>Available Modules:</h2>
        {modules.map((module) => (
          <p key={module}>{module}</p>
        ))}
    </div>
  );
}

export default AvailableModules;
