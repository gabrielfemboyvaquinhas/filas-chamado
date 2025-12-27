
import React, { useState, useEffect } from 'react';
import { ServiceCategory, Token, TokenStatus, ServingStatus } from './types';
import Dashboard from './components/Dashboard';
import StaffPanel from './components/StaffPanel';
import CustomerPanel from './components/CustomerPanel';
import Header from './components/Header';
import { generateAIInsights } from './services/aiAssistant';
import { announceToken, playPriorityAlert } from './services/audioService';

const DEFAULT_STATIONS: ServingStatus[] = [
  { counterId: 1, currentToken: null, allowedCategories: [ServiceCategory.GENERAL, ServiceCategory.PRIORITY, ServiceCategory.BUSINESS] },
  { counterId: 2, currentToken: null, allowedCategories: [ServiceCategory.GENERAL, ServiceCategory.PRIORITY] },
  { counterId: 3, currentToken: null, allowedCategories: [ServiceCategory.GENERAL] },
];

const App: React.FC = () => {
  const [view, setView] = useState<'customer' | 'staff' | 'display'>('customer');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [servingStations, setServingStations] = useState<ServingStatus[]>(() => {
    const saved = localStorage.getItem('queueflow_stations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({ ...s, currentToken: null }));
      } catch (e) {
        return DEFAULT_STATIONS;
      }
    }
    return DEFAULT_STATIONS;
  });
  
  const [aiInsights, setAiInsights] = useState<{ recommendation: string; waitTime: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('queueflow_stations', JSON.stringify(servingStations));
  }, [servingStations]);

  const issueToken = (category: ServiceCategory) => {
    const prefix = category === ServiceCategory.PRIORITY ? 'P' : category === ServiceCategory.BUSINESS ? 'B' : 'G';
    const categoryTokens = tokens.filter(t => t.category === category);
    const nextNumber = categoryTokens.length + 1;
    
    const newToken: Token = {
      id: Math.random().toString(36).substr(2, 9),
      number: nextNumber,
      prefix,
      category,
      status: TokenStatus.WAITING,
      issuedAt: new Date(),
    };
    
    setTokens(prev => [...prev, newToken]);
  };

  const callNext = (counterId: number) => {
    const station = servingStations.find(s => s.counterId === counterId);
    if (!station) return;

    const waitingTokens = tokens.filter(t => 
      t.status === TokenStatus.WAITING && 
      station.allowedCategories.includes(t.category)
    );

    if (waitingTokens.length === 0) return;

    const now = new Date().getTime();
    const rankedTokens = waitingTokens.map(token => {
      const waitTimeSeconds = (now - token.issuedAt.getTime()) / 1000;
      let multiplier = 1.0;
      if (token.category === ServiceCategory.PRIORITY) multiplier = 2.5;
      if (token.category === ServiceCategory.BUSINESS) multiplier = 1.5;
      return { token, score: waitTimeSeconds * multiplier };
    });

    rankedTokens.sort((a, b) => b.score - a.score);
    const nextToken = rankedTokens[0].token;
      
    if (nextToken.category === ServiceCategory.PRIORITY) {
      playPriorityAlert();
    }

    announceToken(nextToken.prefix, nextToken.number, nextToken.category, counterId);

    setTokens(prev => prev.map(t => 
      t.id === nextToken.id ? { ...t, status: TokenStatus.SERVING, startedServingAt: new Date() } : t
    ));

    setServingStations(prev => prev.map(s => 
      s.counterId === counterId ? { ...s, currentToken: { ...nextToken, status: TokenStatus.SERVING, startedServingAt: new Date() } } : s
    ));
  };

  const handleRecall = (counterId: number) => {
    const station = servingStations.find(s => s.counterId === counterId);
    if (station && station.currentToken) {
      const token = station.currentToken;
      if (token.category === ServiceCategory.PRIORITY) {
        playPriorityAlert();
      }
      announceToken(token.prefix, token.number, token.category, counterId);
    }
  };

  const completeServing = (counterId: number) => {
    setServingStations(prev => prev.map(s => {
      if (s.counterId === counterId && s.currentToken) {
        const tokenId = s.currentToken.id;
        setTokens(tks => tks.map(t => t.id === tokenId ? { ...t, status: TokenStatus.COMPLETED, completedAt: new Date() } : t));
        return { ...s, currentToken: null };
      }
      return s;
    }));
  };

  const updateStations = (newStations: ServingStatus[]) => {
    setServingStations(newStations);
  };

  useEffect(() => {
    const analyze = async () => {
      if (tokens.length > 0) {
        const insights = await generateAIInsights(tokens);
        setAiInsights(insights);
      }
    };
    analyze();
    const interval = setInterval(analyze, 30000);
    return () => clearInterval(interval);
  }, [tokens]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfe]">
      <Header currentView={view} setView={setView} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        {view === 'customer' && (
          <CustomerPanel 
            onIssueToken={issueToken} 
            tokens={tokens} 
            aiInsights={aiInsights}
          />
        )}
        
        {view === 'staff' && (
          <StaffPanel 
            servingStations={servingStations}
            setServingStations={updateStations}
            tokens={tokens}
            onCallNext={callNext}
            onRecall={handleRecall}
            onComplete={completeServing}
            waitingCount={tokens.filter(t => t.status === TokenStatus.WAITING).length}
          />
        )}
        
        {view === 'display' && (
          <Dashboard 
            tokens={tokens} 
            servingStations={servingStations}
            aiInsights={aiInsights}
          />
        )}
      </main>

      <footer className="bg-white border-t p-6 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        &copy; 2024 QueueFlow AI System • Inteligência em Gestão de Filas
      </footer>
    </div>
  );
};

export default App;
