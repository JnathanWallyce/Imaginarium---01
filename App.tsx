
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import ImaginariumCore from './ImaginariumCore';
import CreativeGeneratorApp from './creative-generator/CreativeGeneratorApp';

const App = () => {
    // Shared API Key state
    const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('imaginarium_api_key'));

    const handleLogin = (key: string) => {
        setApiKey(key);
        localStorage.setItem('imaginarium_api_key', key);
    };

    const handleLogout = () => {
        setApiKey(null);
        localStorage.removeItem('imaginarium_api_key');
        localStorage.removeItem('imaginarium_remember_me');
    };

    // Keep state in sync with localStorage for external changes (like our interval check)
    useEffect(() => {
        const interval = setInterval(() => {
            const key = localStorage.getItem('imaginarium_api_key');
            if (key !== apiKey) {
                setApiKey(key);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [apiKey]);

    return (
        <Router>
            <Routes>
                {/* 
                   ROOT NAVIGATION:
                   - Not Logged In -> Show Login Page.
                   - Logged In -> Show Dashboard (The 2 Posters).
                */}
                <Route path="/" element={
                    apiKey ? <Dashboard /> : <Login onLogin={handleLogin} />
                } />

                {/* 
                   DEDICATED APP ROUTES:
                   Accessible only if logged in.
                */}
                <Route path="/imaginarium" element={
                    apiKey ? <ImaginariumCore /> : <Navigate to="/" />
                } />

                <Route path="/creative-generator" element={
                    apiKey ? <CreativeGeneratorApp apiKey={apiKey} /> : <Navigate to="/" />
                } />

                {/* Catch all redirect to root */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;
