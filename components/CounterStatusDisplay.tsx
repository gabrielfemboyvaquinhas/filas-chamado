
import React from 'react';
import { ServingStatus } from '../types';

interface CounterStatusDisplayProps {
  station: ServingStatus;
  isLastCalled: boolean;
}

const CounterStatusDisplay: React.FC<CounterStatusDisplayProps> = ({ station, isLastCalled }) => {
  const token = station.currentToken;

  return (
    <div className={`relative bg-white rounded-3xl p-6 shadow-sm border-2 transition-all duration-500 transform ${
      isLastCalled ? 'border-indigo-500 scale-105 shadow-indigo-100' : 'border-transparent hover:border-gray-100'
    }`}>
      {isLastCalled && (
        <div className="absolute -top-3 -right-3 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-tighter animate-bounce">
          Chamando
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className={`text-xs font-bold uppercase tracking-widest ${isLastCalled ? 'text-indigo-600' : 'text-gray-400'}`}>
          Balcão {station.counterId}
        </div>
        
        <div className={`text-5xl font-black transition-colors ${token ? 'text-gray-900' : 'text-gray-200'}`}>
          {token ? `${token.prefix}${token.number.toString().padStart(3, '0')}` : '---'}
        </div>

        <div className="w-full pt-2">
          {token ? (
            <div className={`text-center py-1 rounded-lg text-[10px] font-bold uppercase ${
              token.category === 'Prioritário' ? 'bg-orange-100 text-orange-700' : 
              token.category === 'Empresarial' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-50 text-blue-600'
            }`}>
              {token.category}
            </div>
          ) : (
            <div className="text-center py-1 text-[10px] font-medium text-gray-300 uppercase tracking-widest">
              Livre
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounterStatusDisplay;
