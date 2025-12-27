
import React, { useState, useEffect } from 'react';
import { ServingStatus, Token, TokenStatus, ServiceCategory } from '../types';

interface StaffPanelProps {
  servingStations: ServingStatus[];
  setServingStations: (stations: ServingStatus[]) => void;
  tokens: Token[];
  onCallNext: (counterId: number) => void;
  onRecall: (counterId: number) => void;
  onComplete: (counterId: number) => void;
  waitingCount: number;
}

const StaffPanel: React.FC<StaffPanelProps> = ({ servingStations, setServingStations, tokens, onCallNext, onRecall, onComplete, waitingCount }) => {
  const [now, setNow] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [confirmCallId, setConfirmCallId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const completedTokens = tokens
    .filter(t => t.status === TokenStatus.COMPLETED)
    .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
    .slice(0, 5);

  const calculateScore = (token: Token) => {
    const waitTimeSeconds = (now.getTime() - token.issuedAt.getTime()) / 1000;
    let multiplier = 1.0;
    if (token.category === ServiceCategory.PRIORITY) multiplier = 2.5;
    if (token.category === ServiceCategory.BUSINESS) multiplier = 1.5;
    return Math.floor(waitTimeSeconds * multiplier);
  };

  const waitingList = tokens
    .filter(t => t.status === TokenStatus.WAITING)
    .map(t => ({ ...t, score: calculateScore(t) }))
    .sort((a, b) => b.score - a.score);

  const calculateDuration = (start?: Date, end?: Date) => {
    if (!start || !end) return '---';
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  const toggleCategory = (counterId: number, category: ServiceCategory) => {
    const updated = servingStations.map(s => {
      if (s.counterId === counterId) {
        const categories = s.allowedCategories.includes(category)
          ? s.allowedCategories.filter(c => c !== category)
          : [...s.allowedCategories, category];
        return { ...s, allowedCategories: categories };
      }
      return s;
    });
    setServingStations(updated);
  };

  const addCounter = () => {
    const nextId = servingStations.length > 0 
      ? Math.max(...servingStations.map(s => s.counterId)) + 1 
      : 1;
    setServingStations([...servingStations, { 
      counterId: nextId, 
      currentToken: null, 
      allowedCategories: [ServiceCategory.GENERAL, ServiceCategory.PRIORITY, ServiceCategory.BUSINESS] 
    }]);
  };

  const removeCounter = (id: number) => {
    if (servingStations.length <= 1) return;
    setServingStations(servingStations.filter(s => s.counterId !== id));
  };

  const getStatusInfo = (station: ServingStatus) => {
    if (!station.currentToken) return { label: 'Livre', color: 'text-green-500', bg: 'bg-green-50', icon: 'fa-check-circle' };
    if (station.currentToken.category === ServiceCategory.PRIORITY) 
      return { label: 'Prioritário em Atendimento', color: 'text-orange-600', bg: 'bg-orange-100', icon: 'fa-star' };
    return { label: 'Atendendo', color: 'text-blue-600', bg: 'bg-blue-50', icon: 'fa-user' };
  };

  const handleConfirmCall = () => {
    if (confirmCallId !== null) {
      onCallNext(confirmCallId);
      setConfirmCallId(null);
    }
  };

  return (
    <div className="relative space-y-8 max-w-6xl mx-auto animate-fadeIn min-h-screen pb-20">
      {/* Imagem de fundo sutil */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-5 mix-blend-multiply z-[-1]"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>

      {/* Modal de Confirmação */}
      {confirmCallId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border-4 border-indigo-600 animate-bounceIn">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                <i className="fas fa-bullhorn"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">Confirmar Chamada?</h3>
                <p className="text-gray-500 mt-2 font-medium">Você está prestes a chamar o próximo token para o <strong>Balcão {confirmCallId}</strong>.</p>
              </div>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={handleConfirmCall}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  SIM, CHAMAR AGORA
                </button>
                <button 
                  onClick={() => setConfirmCallId(null)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold py-3 rounded-2xl transition-all"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Console de Operação</h2>
          <p className="text-gray-500 font-medium">Controle avançado de fluxo e produtividade.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all flex items-center space-x-2 shadow-sm border-2 ${
              showSettings ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-100 hover:border-indigo-200'
            }`}
          >
            <i className={`fas ${showSettings ? 'fa-times' : 'fa-cog'} text-sm`}></i>
            <span>{showSettings ? 'Fechar Ajustes' : 'Configurações'}</span>
          </button>

          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border flex items-center space-x-4">
            <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-100">
              <i className="fas fa-users-viewfinder text-xl"></i>
            </div>
            <div>
              <span className="block text-2xl font-black text-gray-900 leading-none">{waitingCount}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fila de Espera</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configurações */}
      {showSettings && (
        <div className="bg-white border-2 border-indigo-100 rounded-[2.5rem] p-8 animate-slideDown shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <i className="fas fa-tools text-8xl"></i>
          </div>
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight">Painel de Configurações</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Personalize sua infraestrutura de atendimento</p>
            </div>
            <button 
              onClick={addCounter}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-3 px-6 rounded-2xl flex items-center space-x-2 shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95"
            >
              <i className="fas fa-plus-circle"></i>
              <span>Novo Balcão</span>
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {servingStations.map(s => (
              <div key={s.counterId} className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm group hover:border-indigo-300 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border text-indigo-600 font-black text-xs">
                      {s.counterId}
                    </div>
                    <span className="text-sm font-black text-gray-700">BALCÃO {s.counterId}</span>
                  </div>
                  <button 
                    onClick={() => removeCounter(s.counterId)} 
                    className="text-gray-300 hover:text-red-500 transition-all transform hover:scale-110"
                    title="Remover Balcão"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Categorias Designadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(ServiceCategory).map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(s.counterId, cat)}
                        className={`text-[9px] font-black px-3 py-1.5 rounded-xl transition-all border-2 ${
                          s.allowedCategories.includes(cat) 
                            ? 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-50 shadow-md' 
                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Balcões */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {servingStations.map((station) => {
          const status = getStatusInfo(station);
          const isPriority = station.currentToken?.category === ServiceCategory.PRIORITY;
          
          return (
            <div 
              key={station.counterId} 
              className={`bg-white rounded-[3rem] shadow-sm border-2 flex flex-col group transition-all duration-700 relative ${
                isPriority ? 'border-orange-400 ring-[12px] ring-orange-50/50 animate-pulse-priority' : 'border-gray-100 hover:border-indigo-100'
              }`}
            >
              <div className="px-8 py-5 border-b flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${isPriority ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>
                    {station.counterId}
                  </div>
                  <h3 className="font-black text-gray-800 uppercase tracking-widest text-[10px]">Balcão Operacional</h3>
                </div>
                <div className="flex items-center space-x-2">
                   <div className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${status.bg} ${status.color}`}>
                     {status.label}
                   </div>
                   <span className={`w-3 h-3 rounded-full ${station.currentToken ? 'bg-green-500 animate-pulse' : 'bg-gray-200'}`}></span>
                </div>
              </div>
              
              <div className="flex-1 p-10 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                {station.currentToken ? (
                  <div className="text-center space-y-3 animate-bounceIn relative z-10">
                    <div className="text-8xl font-black text-gray-900 tracking-tighter leading-none drop-shadow-sm">
                      {station.currentToken.prefix}{station.currentToken.number.toString().padStart(3, '0')}
                    </div>
                    <div className={`text-xs font-black px-6 py-2 rounded-2xl inline-block uppercase tracking-widest shadow-sm ${
                      isPriority ? 'bg-orange-600 text-white' : 'bg-indigo-900 text-white'
                    }`}>
                      {station.currentToken.category}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4 opacity-20 py-10 transition-opacity group-hover:opacity-40">
                    <i className="fas fa-user-clock text-7xl text-gray-400"></i>
                    <p className="text-xs font-black uppercase tracking-widest">Aguardando Comando</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50/50 border-t flex flex-col space-y-3">
                {station.currentToken ? (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onComplete(station.counterId)}
                      className="flex-[2] bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border-2 border-indigo-600 font-black py-4 rounded-[1.5rem] transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2"
                    >
                      <i className="fas fa-check-circle"></i>
                      <span>CONCLUIR</span>
                    </button>
                    <button 
                      onClick={() => onRecall(station.counterId)}
                      title="Chamar novamente por voz"
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black py-4 rounded-[1.5rem] transition-all flex items-center justify-center"
                    >
                      <i className="fas fa-redo-alt"></i>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmCallId(station.counterId)}
                    disabled={waitingCount === 0}
                    className={`w-full font-black py-5 rounded-[1.5rem] transition-all shadow-xl flex items-center justify-center space-x-2 active:scale-95 ${
                      waitingCount > 0 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:-translate-y-1' 
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none border border-gray-200'
                    }`}
                  >
                    <i className={`fas ${waitingCount > 0 ? 'fa-bullhorn animate-pulse' : 'fa-ban'} mr-2`}></i>
                    <span>CHAMAR PRÓXIMO</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Listas e Histórico */}
      <div className="grid lg:grid-cols-2 gap-8 pt-10">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b flex items-center justify-between bg-gray-50/80">
            <h3 className="font-black text-gray-800 uppercase tracking-tighter text-sm flex items-center">
              <i className="fas fa-robot mr-3 text-indigo-600"></i>Ranking Adaptativo AI
            </h3>
          </div>
          <div className="divide-y overflow-y-auto max-h-[450px]">
            {waitingList.map((token) => (
              <div key={token.id} className="p-5 flex items-center justify-between hover:bg-indigo-50/30 transition-colors">
                <div className="flex items-center space-x-6">
                   <div className="text-4xl font-black text-gray-900 tracking-tighter">{token.prefix}{token.number.toString().padStart(3, '0')}</div>
                   <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase ${
                      token.category === ServiceCategory.PRIORITY ? 'bg-orange-500 text-white' : 'bg-gray-800 text-white'
                   }`}>{token.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-indigo-600">{token.score}</div>
                  <div className="text-[9px] text-gray-400 uppercase font-black">Score</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b flex items-center justify-between bg-indigo-900 text-white font-black uppercase tracking-widest text-xs">
            Log de Performance Staff
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b">
                <tr>
                  <th className="px-8 py-5">Token</th>
                  <th className="px-8 py-5 text-right">Duração</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {completedTokens.map(token => (
                  <tr key={token.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-black text-gray-800">{token.prefix}{token.number.toString().padStart(3, '0')}</td>
                    <td className="px-8 py-5 text-right font-black text-indigo-600">
                      {calculateDuration(token.startedServingAt, token.completedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 0.8; }
          70% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes pulse-priority {
          0%, 100% { border-color: rgba(234, 88, 12, 0.4); }
          50% { border-color: rgba(234, 88, 12, 1); transform: scale(1.005); }
        }
        .animate-pulse-priority {
          animation: pulse-priority 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default StaffPanel;
