
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ImaginariumCore from './ImaginariumCore';
import CreativeGeneratorApp from './creative-generator/CreativeGeneratorApp';

const CreativeGeneratorWrapper = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedKey = localStorage.getItem('imaginarium_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        } else {
            // If local storage is empty, check if remember me is set?
            // ImaginariumCore handles auth logic. If we are here, we expect a key.
            // If not, redirect home which will show AuthScreen.
            // We can't easily access Auth state from here without context, so simple check:
            navigate('/');
        }
    }, [navigate]);

    if (!apiKey) return null;

    return (
        <div className="relative">
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 z-50 px-4 py-2 bg-black/50 text-white font-bold text-xs rounded-lg backdrop-blur-md border border-white/10 hover:bg-black/70 flex items-center gap-2 transition-all hover:pl-3"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Dashboard
            </button>
            <CreativeGeneratorApp apiKey={apiKey} />
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ImaginariumCore />} />
                <Route path="/creative-generator" element={<CreativeGeneratorWrapper />} />
            </Routes>
        </Router>
    );
};

export default App;
