import { useEffect, useState } from 'react';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

const ApiStatus = () => {
  const [status, setStatus] = useState('online');
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch('/api/health', { 
          method: 'GET',
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        setStatus('online');
      } catch (error) {
        setStatus('offline');
      }
      
      setLastChecked(new Date());
    };
    
    // Check status immediately
    checkApiStatus();
    
    // Check every minute
    const intervalId = setInterval(checkApiStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (status === 'online') {
    return (
      <div className="flex items-center text-xs text-green-600" title="API is online">
        <FiWifi className="mr-1" />
        <span className="hidden md:inline">API Online</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-xs text-red-600" title="API is offline">
      <FiWifiOff className="mr-1" />
      <span className="hidden md:inline">API Offline</span>
    </div>
  );
};

export default ApiStatus;