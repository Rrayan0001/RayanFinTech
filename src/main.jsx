import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import WelcomeAnimation from './components/WelcomeAnimation.jsx'
import './index.css'

function Root() {
  const [settings, setSettings] = useState(() => {
    return JSON.parse(localStorage.getItem("rayan_fint_settings") || "{}");
  });

  const [showWelcome, setShowWelcome] = useState(settings.showWelcome !== false);

  return (
    <>
      {showWelcome && (
        <WelcomeAnimation 
          onComplete={() => setShowWelcome(false)} 
          animationSpeed={settings.animationSpeed || 1} 
        />
      )}
      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
