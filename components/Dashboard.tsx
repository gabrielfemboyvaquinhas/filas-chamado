
import React from 'react';
import { ServingStatus, Token, TokenStatus } from '../types';
import CounterStatusDisplay from './CounterStatusDisplay';

interface DashboardProps {
  tokens: Token[];
  servingStations: ServingStatus[];
  aiInsights: { recommendation: string; waitTime: number } | null;
}

const Dashboard: React.FC<DashboardProps> = ({ tokens, servingStations, aiInsights }) => {
  const lastCalled = servingStations
    .filter(s => s.currentToken !== null)
    .sort((a, b) => (b.currentToken?.startedServingAt?.getTime() || 0) - (a.currentToken?.startedServingAt?.getTime() || 0))[0];

  const recentHistory = tokens
    .filter(t => t.status === TokenStatus.COMPLETED || t.status === TokenStatus.SERVING)
    .sort((a, b) => (b.startedServingAt?.getTime() || 0) - (a.startedServingAt?.getTime() || 0))
    .slice(0, 10);

  return (
    <div className="grid lg:grid-cols-4 gap-8 h-full max-w-7xl mx-auto animate-fadeIn">
      {/* Painel Principal */}
      <div className="lg:col-span-3 space-y-8">
        <div className="bg-indigo-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between border-4 border-white">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-800 rounded-full opacity-30 animate-pulse"></div>
          
          <div className="relative z-10 text-center md:text-left">
            <span className="bg-indigo-700/50 px-4 py-1 rounded-full text-indigo-200 font-bold uppercase tracking-widest text-[10px] border border-indigo-600">Última Chamada</span>
            <div className="text-[14rem] font-black leading-none my-2 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] tracking-tighter">
              {lastCalled?.currentToken ? 
                `${lastCalled.currentToken.prefix}${lastCalled.currentToken.number.toString().padStart(3, '0')}` : 
                '---'
              }
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-4">
              <div className="bg-white text-indigo-900 px-8 py-3 rounded-2xl font-black text-2xl shadow-xl flex items-center">
                <i className="fas fa-desktop mr-3 opacity-30"></i>
                BALCÃO {lastCalled?.counterId || '?'}
              </div>
              {lastCalled?.currentToken?.category === 'Prioritário' && (
                <div className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold shadow-xl flex items-center animate-bounce">
                  <i className="fas fa-star mr-2"></i> PRIORIDADE
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex relative z-10 flex-col items-center">
             <div className="w-32 h-32 bg-indigo-800/50 rounded-full flex items-center justify-center border-4 border-indigo-700">
                <i className="fas fa-bullhorn text-5xl text-indigo-300 animate-pulse"></i>
             </div>
             <p className="mt-4 text-indigo-300 font-bold text-sm tracking-widest">OUÇA O SINAL</p>
          </div>
        </div>

        {/* Grid de Balcões */}
        <div className="grid md:grid-cols-3 gap-6">
          {servingStations.map(station => (
             <CounterStatusDisplay 
               key={station.counterId} 
               station={station} 
               isLastCalled={lastCalled?.counterId === station.counterId}
             />
          ))}
        </div>
      </div>

      {/* Barra Lateral */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-5 py-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-800 uppercase tracking-tighter flex items-center text-sm">
              <i className="fas fa-history mr-2 text-indigo-500"></i>Monitor de Fila
            </h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">HISTÓRICO</span>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {recentHistory.map((t, idx) => (
              <div key={t.id} className={`p-4 flex items-center justify-between transition-colors ${idx === 0 ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}>
                <div>
                  <span className="font-black text-xl text-gray-800">{t.prefix}{t.number.toString().padStart(3, '0')}</span>
                  <div className="flex items-center space-x-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${t.status === TokenStatus.SERVING ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{t.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-600 block">BALCÃO {servingStations.find(s => s.currentToken?.id === t.id)?.counterId || '---'}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{t.startedServingAt?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            ))}
            {recentHistory.length === 0 && (
              <div className="p-10 text-center text-gray-300 italic text-sm">Aguardando atendimentos...</div>
            )}
          </div>
        </div>

        {aiInsights && (
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group">
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-2 rounded-lg"><i className="fas fa-microchip"></i></div>
                <h4 className="font-bold text-xs uppercase tracking-widest">Status da Operação</h4>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black">{aiInsights.waitTime}</span>
                <span className="text-sm font-medium text-indigo-200">min. de espera</span>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed border-t border-indigo-500/30 pt-4 italic">
                {aiInsights.recommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
