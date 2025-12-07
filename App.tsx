import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CameraCapture from './components/CameraCapture';
import Processing from './components/Processing';
import ResultsView from './components/ResultsView';
import HistoryView from './components/HistoryView';
import OfflineManager from './components/OfflineManager';
import Onboarding from './components/Onboarding';
import Home from './components/Home';
import { AppState, HistoryItem, Language } from './types';
import { analyzeDocument } from './services/geminiService';
import { saveToHistory, getHistory } from './services/storageService';

const App: React.FC = () => {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [state, setState] = useState<AppState>({
    view: 'home',
    step: 'capture',
    image: null,
    selectedLanguage: { code: 'es', name: 'Spanish', nativeName: 'Español' }, // Default placeholder
    result: null,
    error: null,
    showOfflineManager: false,
  });

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  const handleOnboardingComplete = (lang: Language) => {
      setState(prev => ({ ...prev, selectedLanguage: lang }));
      setHasOnboarded(true);
  };

  const handleCapture = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      setState(prev => ({ 
        ...prev, 
        step: 'processing', 
        image: base64,
        error: null,
        view: 'home'
      }));

      try {
        const result = await analyzeDocument(base64, state.selectedLanguage);
        
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          image: base64,
          result: result,
          language: state.selectedLanguage
        };
        
        saveToHistory(newItem);
        setHistoryItems(getHistory());

        setState(prev => ({
          ...prev,
          step: 'results',
          result: result
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          step: 'capture',
          error: error.message
        }));
        alert("Error: " + error.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setState(prev => ({
      ...prev,
      step: 'capture',
      image: null,
      result: null,
      error: null
    }));
  };

  // Main Render Logic
  
  if (!hasOnboarded) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="h-screen bg-navy-900 font-sans text-cream-50 overflow-hidden flex flex-col">
      
      {state.view !== 'history' && state.step !== 'results' && state.step !== 'capture' && (
        <Header 
          currentView={state.view}
          onHomeClick={() => setState(prev => ({ ...prev, view: 'home', step: 'capture' }))}
          onHistoryClick={() => setState(prev => ({ ...prev, view: 'history' }))}
          onSettingsClick={() => setState(prev => ({ ...prev, showOfflineManager: true }))}
        />
      )}
      
      <main className="flex-1 w-full relative h-full">
        {state.view === 'history' ? (
          <HistoryView 
            items={historyItems} 
            onSelect={(item) => setState(prev => ({
              ...prev,
              view: 'home',
              step: 'results',
              image: item.image,
              result: item.result,
              selectedLanguage: item.language
            }))}
            onBack={() => setState(prev => ({ ...prev, view: 'home' }))}
          />
        ) : (
          <>
            {/* Logic for Home vs Capture vs Results */}
            {state.step === 'capture' && (
                <StatefulHome 
                   userName="Maria" 
                   language={state.selectedLanguage}
                   onCapture={handleCapture}
                />
            )}

            {state.step === 'processing' && (
              <Processing />
            )}

            {state.step === 'results' && state.result && state.image && (
              <ResultsView 
                result={state.result}
                imageSrc={state.image}
                onRetake={handleRetake}
              />
            )}
          </>
        )}
      </main>

      <OfflineManager 
        isOpen={state.showOfflineManager} 
        onClose={() => setState(prev => ({ ...prev, showOfflineManager: false }))} 
      />
    </div>
  );
};

// Internal wrapper to handle the Home -> Camera transition within the 'capture' step
const StatefulHome: React.FC<{
    userName: string;
    language: Language;
    onCapture: (f: File) => void;
}> = ({ userName, language, onCapture }) => {
    const [showCamera, setShowCamera] = useState(false);

    if (showCamera) {
        return (
            <CameraCapture 
                onCapture={onCapture}
                onCancel={() => setShowCamera(false)}
                selectedLanguage={language}
            />
        );
    }

    return (
        <Home 
            userName={userName}
            language={language}
            onStartCapture={() => setShowCamera(true)}
        />
    );
}

export default App;