
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const apps = [
        {
            id: 'imaginarium',
            name: 'Imaginarium',
            description: 'Gerador de Imagens AI',
            image: '/dashboard/imaginarium.png',
            path: '/imaginarium',
            color: 'from-purple-600 to-indigo-600'
        },
        {
            id: 'criativos',
            name: 'Gerador de Criativos',
            description: 'Ads & Marketing Studio',
            image: '/dashboard/criativos.png',
            path: '/creative-generator',
            color: 'from-blue-600 to-cyan-500'
        }
    ];

    return (
        <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center font-sans">
            <div className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Quem está criando hoje?</h1>
                <p className="text-gray-400 text-lg">Selecione uma ferramenta para começar</p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 px-4 max-w-6xl">
                {apps.map((app) => (
                    <div
                        key={app.id}
                        onClick={() => navigate(app.path)}
                        className="group relative cursor-pointer flex flex-col items-center transition-all duration-300"
                    >
                        {/* Poster Tile */}
                        <div className="relative w-48 h-72 md:w-60 md:h-96 rounded-md overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-105 group-hover:ring-4 group-hover:ring-white/80">
                            <img
                                src={app.image}
                                alt={app.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            {/* Play Button Icon on Hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black">
                                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* App Details */}
                        <div className="mt-6 text-center transform transition-all duration-300 group-hover:translate-y-[-10px]">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-300 group-hover:text-white transition-colors">
                                {app.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                {app.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Exit */}
            <div className="mt-20">
                <button
                    onClick={() => {
                        localStorage.removeItem('imaginarium_api_key');
                        window.location.reload();
                    }}
                    className="px-6 py-2 border-2 border-gray-600 text-gray-400 hover:text-white hover:border-white transition-all rounded font-medium uppercase tracking-widest text-xs"
                >
                    Sair da Conta
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
