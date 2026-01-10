
import React, { useState } from 'react';
import { supabase, updateUserApiKey } from './services/supabaseClient';
import { validateApiKey } from './services/geminiService';

// --- Icons ---
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 15L17.5 17.625l-.75-2.625a2.25 2.25 0 00-1.545-1.545L12.583 12.688l2.625-.75a2.25 2.25 0 001.545-1.545L17.5 7.765l.75 2.625a2.25 2.25 0 001.545 1.545l2.625.75-2.625.75a2.25 2.25 0 00-1.545 1.545zM15.545 15.545L14.75 18.17l-.75-2.625a2.25 2.25 0 00-1.545-1.545l-2.625-.75 2.625-.75a2.25 2.25 0 001.545-1.545l.75-2.625.75 2.625a2.25 2.25 0 001.545 1.545l2.625.75-2.625.75z" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774Magic" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const Login = ({ onLogin }: { onLogin: (key: string) => void }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isSignup) {
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        const isValidKey = await validateApiKey(apiKey);
        if (!isValidKey) throw new Error("Invalid Gemini API Key.");

        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { gemini_api_key: apiKey } }
        });

        if (authError) throw authError;
        setSuccessMsg("Account created! Logging you in...");
        if (data.session) {
          setIsExiting(true);
          setTimeout(() => onLogin(apiKey), 800);
        } else {
          setSuccessMsg("Account created! Please login.");
          setIsSignup(false);
        }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;

        const storedKey = data.user?.user_metadata?.gemini_api_key;
        if (storedKey) {
          if (rememberMe) localStorage.setItem('imaginarium_remember_me', 'true');
          setSuccessMsg("Login successful!");
          setIsExiting(true);
          setTimeout(() => onLogin(storedKey), 800);
        } else {
          const newKey = window.prompt("API Key required:");
          if (newKey && newKey.trim()) {
            await updateUserApiKey(newKey);
            setIsExiting(true);
            setTimeout(() => onLogin(newKey), 800);
          } else {
            throw new Error("API Key required.");
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 transition-all duration-1000 ${isExiting ? 'opacity-0 scale-105 filter blur-xl' : 'opacity-100 scale-100 filter blur-0'}`}>
      <div className="w-full max-w-md space-y-8 bg-gray-900/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all pb-10">
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 mb-4">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Imaginarium AI</h1>
          <p className="text-gray-400 text-sm">{isSignup ? "Crie sua conta" : "Bem-vindo de volta"}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5 relative z-10">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950/50 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide ml-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-10"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isSignup && (
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-600" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400 cursor-pointer">Lembrar de mim</label>
            </div>
          )}

          {isSignup && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-indigo-400 uppercase tracking-wide ml-1">Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value.trim())}
                className="w-full bg-gray-950/50 border border-indigo-500/30 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                placeholder="AIzaSy..."
                required
              />
            </div>
          )}

          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">{error}</div>}
          {successMsg && <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs text-center">{successMsg}</div>}

          <button type="submit" disabled={isLoading} className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg active:scale-95 transition-all">
            {isLoading ? 'Carregando...' : (isSignup ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <div className="text-center pt-2">
          <button onClick={() => { setIsSignup(!isSignup); setError(''); }} className="text-xs text-gray-400 hover:text-white transition-colors">
            {isSignup ? "Já tem uma conta? Entre aqui" : "Ainda não tem conta? Crie uma"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;