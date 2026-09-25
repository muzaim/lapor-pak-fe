import React from 'react';
import { Shield } from 'lucide-react';
import { useMasterData } from '../context/MasterDataContext';

export default function LoadingOverlay({ 
  message = 'Memproses data...',
  backdrop = 'blank' // 'blank' (solid brand blue splash) or 'overlay' (frosted backdrop)
}) {
  const { appSettings } = useMasterData();
  const logoUrl = appSettings?.logo_url;
  const appName = appSettings?.app_name || 'Lapor Pak!';

  const backdropClasses = backdrop === 'overlay'
    ? 'bg-slate-950/75 backdrop-blur-md'
    : 'bg-sky-600'; // Brand blue background

  return (
    <div className={`fixed inset-0 z-[9999] ${backdropClasses} flex flex-col items-center justify-center transition-all duration-300 select-none`}>
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center">
        
        {/* Outer glowing pulsing ring */}
        <div className="absolute w-24 h-24 rounded-3xl bg-white/20 animate-ping"></div>

        {/* Logo Card with Database Logo */}
        <div className="relative w-24 h-24 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-2xl shadow-sky-900/30 p-3">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={appName} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Shield className="w-10 h-10 text-sky-600" />
            </div>
          )}
        </div>

        {/* Brand & Loading Info */}
        <div className="mt-6 space-y-2 text-white">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {appName}
          </h2>

          <div className="flex items-center justify-center gap-2 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce [animation-delay:0.4s]"></span>
          </div>

          <p className="text-xs font-semibold text-white/90 leading-relaxed px-4">
            {message}
          </p>
        </div>

        {/* Functional 1-Second Animated Progress Bar */}
        <div className="w-56 h-2 bg-white/25 rounded-full mt-6 overflow-hidden relative">
          <div 
            className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
            style={{
              animation: 'splashProgressBar 1s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
          />
        </div>

        <style>{`
          @keyframes splashProgressBar {
            0% { width: 0%; }
            35% { width: 45%; }
            70% { width: 80%; }
            100% { width: 100%; }
          }
        `}</style>

      </div>
    </div>
  );
}
