
import React, { useEffect, useRef } from 'react';
import { ServiceCategory, Token, TokenStatus } from '../types';

interface CustomerPanelProps {
  onIssueToken: (category: ServiceCategory) => void;
  tokens: Token[];
  aiInsights: { recommendation: string; waitTime: number } | null;
}

const CustomerPanel: React.FC<CustomerPanelProps> = ({ onIssueToken, tokens, aiInsights }) => {
  const lastToken = tokens[tokens.length - 1];
  const lastPrintedTokenId = useRef<string | null>(null);
  const waitingTokens = tokens.filter(t => t.status === TokenStatus.WAITING);
  
  const dynamicWait = Math.max(1, Math.ceil((waitingTokens.length * 4) / 3));

  // Efeito para disparar a impressão automática assim que uma nova senha surgir
  useEffect(() => {
    if (lastToken && lastToken.id !== lastPrintedTokenId.current) {
      lastPrintedTokenId.current = lastToken.id;
      
      // Pequeno atraso para garantir que o DOM renderizou o componente da senha antes de imprimir
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [lastToken]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn print:m-0 print:p-0">
      <div className="text-center space-y-3 print:hidden">
        <div className="inline-block bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Atendimento Inteligente</div>
        <h1 className="text-4xl font-black text-gray-900 sm:text-5xl">Como podemos ajudar?</h1>
        <p className="text-lg text-gray-400 max-w-lg mx-auto font-medium leading-tight">Escolha uma categoria abaixo para retirar sua senha eletrônica.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 print:hidden">
        {Object.values(ServiceCategory).map((cat) => (
          <button
            key={cat}
            onClick={() => onIssueToken(cat)}
            className="group relative bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-500 transform hover:-translate-y-2 flex flex-col items-center text-center space-y-6"
          >
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl shadow-lg transition-all duration-500 group-hover:rotate-12 ${
              cat === ServiceCategory.PRIORITY ? 'bg-orange-500 text-white' : 
              cat === ServiceCategory.BUSINESS ? 'bg-indigo-600 text-white' : 
              'bg-blue-600 text-white'
            }`}>
              <i className={`fas ${
                cat === ServiceCategory.PRIORITY ? 'fa-star' : 
                cat === ServiceCategory.BUSINESS ? 'fa-building' : 
                'fa-user-group'
              }`}></i>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{cat}</h3>
              <p className="text-xs text-gray-400 font-bold uppercase mt-2 opacity-60">
                {cat === ServiceCategory.PRIORITY ? 'Preferencial' : 
                 cat === ServiceCategory.BUSINESS ? 'Corporate' : 
                 'Público Geral'}
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-2 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              Emitir Ticket
            </div>
          </button>
        ))}
      </div>

      {lastToken && (
        <div className="bg-white border-4 border-indigo-600 rounded-[3rem] p-12 max-w-sm mx-auto text-center shadow-2xl relative overflow-hidden animate-bounceIn print:border-2 print:rounded-none print:shadow-none print:p-4 print:max-w-full print:w-64 print:border-black">
          <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600 print:hidden"></div>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 block print:text-black">Sua Senha</span>
          <div className="my-6">
            <h2 className="text-8xl font-black text-gray-900 tracking-tighter leading-none print:text-6xl">{lastToken.prefix}{lastToken.number.toString().padStart(3, '0')}</h2>
            <p className="text-sm font-black text-gray-400 mt-4 uppercase tracking-widest bg-gray-100 py-2 rounded-xl inline-block px-6 print:bg-white print:border print:border-black print:text-black">{lastToken.category}</p>
          </div>
          <div className="text-xs text-gray-400 font-bold border-t border-gray-100 pt-6 mt-6 print:text-black print:border-black">
            EMITIDO ÀS {new Date(lastToken.issuedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            <div className="hidden print:block text-[8px] mt-2">QueueFlow AI • Qualidade em Atendimento</div>
          </div>
          
          <button 
            onClick={handlePrint}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-2xl shadow-lg flex items-center justify-center space-x-2 w-full transition-all print:hidden"
          >
            <i className="fas fa-print"></i>
            <span>IMPRIMIR NOVAMENTE</span>
          </button>
          
          <div className="mt-4 flex items-center justify-center text-indigo-400 animate-pulse font-bold text-[10px] uppercase tracking-widest print:hidden">
             <i className="fas fa-magic mr-2"></i> IMPRIMINDO AUTOMATICAMENTE...
          </div>
        </div>
      )}

      {/* Estimativa de Tempo */}
      <div className="grid md:grid-cols-2 gap-6 print:hidden">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 flex items-center space-x-6 shadow-sm">
            <div className="bg-indigo-50 text-indigo-600 p-5 rounded-2xl">
              <i className="fas fa-hourglass-half text-2xl"></i>
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Espera Estimada</h4>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-gray-900">{dynamicWait}</span>
                <span className="text-sm font-bold text-gray-500">minutos</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 flex items-center space-x-6 shadow-sm">
            <div className="bg-orange-50 text-orange-600 p-5 rounded-2xl">
              <i className="fas fa-users text-2xl"></i>
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Pessoas na Fila</h4>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-gray-900">{waitingTokens.length}</span>
                <span className="text-sm font-bold text-gray-500">aguardando</span>
              </div>
            </div>
          </div>
      </div>
      
      {aiInsights && !lastToken && (
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex items-start space-x-6 shadow-2xl relative overflow-hidden group print:hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <i className="fas fa-robot text-9xl"></i>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
            <i className="fas fa-brain text-2xl"></i>
          </div>
          <div className="flex-1 space-y-2 relative z-10">
            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-200">Previsão Analítica AI</h4>
            <p className="text-xl font-medium leading-snug">
              {aiInsights.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPanel;
