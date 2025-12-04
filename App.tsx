import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState, Entity } from './types';
import { generateDialogue } from './services/geminiService';
import { Play, Settings, BookOpen, Loader2 } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentDialog, setCurrentDialog] = useState<{ speaker: string; text: string; loading: boolean } | null>(null);
  const [dialogHistory, setDialogHistory] = useState<{ speaker: string; text: string }[]>([]);

  const startGame = () => setGameState(GameState.PLAYING);

  const handleInteraction = async (entity: Entity) => {
    if (gameState !== GameState.PLAYING) return;
    
    setGameState(GameState.DIALOG);
    setCurrentDialog({ speaker: entity.name, text: "", loading: true });
    
    // Initial greeting or AI generation
    const response = await generateDialogue(
      entity.name,
      entity.dialogueContext || "A generic villager.",
      "Hello!",
      dialogHistory
    );

    setCurrentDialog({ speaker: entity.name, text: response, loading: false });
    setDialogHistory(prev => [...prev, { speaker: entity.name, text: response }]);
  };

  const closeDialog = () => {
    setCurrentDialog(null);
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="w-full h-screen bg-black relative">
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState}
        onInteract={handleInteraction}
      />

      {/* Main Menu Overlay */}
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-600 mb-2 font-serif tracking-tight">
              Aetheria
            </h1>
            <p className="text-gray-400 mb-12 text-lg">The Lost Chronicles • Tech Demo</p>
            
            <div className="space-y-4">
              <button 
                onClick={startGame}
                className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-95"
              >
                <Play className="w-5 h-5" /> Start Adventure
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="py-3 bg-gray-800 text-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700">
                  <Settings className="w-4 h-4" /> Options
                </button>
                <button className="py-3 bg-gray-800 text-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700">
                  <BookOpen className="w-4 h-4" /> Credits
                </button>
              </div>
            </div>

            <p className="mt-8 text-xs text-gray-600">
              Powered by React, Canvas, & Gemini AI
            </p>
          </div>
        </div>
      )}

      {/* Dialog Overlay */}
      {gameState === GameState.DIALOG && currentDialog && (
        <div className="absolute inset-x-0 bottom-0 z-40 p-4 md:p-8 flex justify-center">
          <div className="bg-gray-900/95 backdrop-blur border border-gray-700 p-6 rounded-2xl w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-10">
            <h3 className="text-purple-400 font-bold text-lg mb-2 flex items-center justify-between">
              {currentDialog.speaker}
              {currentDialog.loading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
            </h3>
            
            <div className="text-gray-100 text-lg leading-relaxed min-h-[3rem]">
               {currentDialog.loading ? (
                 <span className="animate-pulse text-gray-500">Thinking...</span>
               ) : (
                 currentDialog.text
               )}
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                onClick={closeDialog}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}