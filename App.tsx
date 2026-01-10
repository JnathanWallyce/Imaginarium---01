
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ImaginariumCore from './ImaginariumCore';
import CreativeGeneratorApp from './creative-generator/CreativeGeneratorApp';
import Dashboard from './Dashboard';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const storedKey = localStorage.getItem('imaginarium_api_key');
            if (storedKey) {
                setApiKey(storedKey);
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    if (isLoading) return null;

    // If no API key, let ImaginariumCore handle Auth (it already has AuthScreen logic internal to it)
    // However, for Dashboard and Creative Generator, we might want to redirect to / if no key
    // Actually, ImaginariumCore is the "Auth Portal" right now. Let's make it the root for Auth.

    return <>{children}</>;
};

const CreativeGeneratorWrapper = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedKey = localStorage.getItem('imaginarium_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        } else {
            navigate('/');
        }
    }, [navigate]);

    if (!apiKey) return null;

    return (
        <div className="relative h-screen overflow-hidden">
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 z-50 px-4 py-2 bg-black/50 text-white font-bold text-xs rounded-lg backdrop-blur-md border border-white/10 hover:bg-black/70 flex items-center gap-2 transition-all hover:pl-3 group"
            >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Voltar ao Menu
            </button>
            <CreativeGeneratorApp apiKey={apiKey} />
        </div>
    );
};

const ImaginariumWrapper = () => {
    const navigate = useNavigate();
    return (
        <div className="relative h-screen overflow-hidden">
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 z-50 px-4 py-2 bg-black/50 text-white font-bold text-xs rounded-lg backdrop-blur-md border border-white/10 hover:bg-black/70 flex items-center gap-2 transition-all hover:pl-3 group"
            >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Voltar ao Menu
            </button>
            <ImaginariumCore />
        </div>
    );
}

const App = () => {
    const [hasKey, setHasKey] = useState(!!localStorage.getItem('imaginarium_api_key'));

    // Check for key changes (simple polling or custom event could be better, but for now this works)
    useEffect(() => {
        const interval = setInterval(() => {
            const key = localStorage.getItem('imaginarium_api_key');
            setHasKey(!!key);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Router>
            <Routes>
                {/* 
                  Logic: 
                  If not logged in, ImaginariumCore renders AuthScreen. 
                  So we can use ImaginariumCore as the entry point if no key.
                  If logged in, we show Dashboard at /.
                */}
                <Route path="/" element={hasKey ? <Dashboard /> : <ImaginariumCore />} />
                <Route path="/imaginarium" element={<ImaginariumWrapper />} />
                <Route path="/creative-generator" element={<CreativeGeneratorWrapper />} />
            </Routes>
        </Router>
    );
};

export default App;
