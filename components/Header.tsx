
import React from 'react';

interface HeaderProps {
  currentView: string;
  setView: (view: 'customer' | 'staff' | 'display') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-layer-group text-xl"></i>
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">Queue<span className="text-indigo-600">Flow</span> AI</span>
        </div>
        
        <div className="hidden md:flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('customer')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'customer' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="fas fa-user-plus mr-2"></i>Totem Cliente
          </button>
          <button 
            onClick={() => setView('staff')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'staff' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="fas fa-user-tie mr-2"></i>Painel Staff
          </button>
          <button 
            onClick={() => setView('display')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'display' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="fas fa-tv mr-2"></i>Monitor Público
          </button>
        </div>

        {/* Mobile simple icons */}
        <div className="flex md:hidden space-x-4">
          <button onClick={() => setView('customer')} className={currentView === 'customer' ? 'text-indigo-600' : 'text-gray-400'}>
            <i className="fas fa-user-plus"></i>
          </button>
          <button onClick={() => setView('staff')} className={currentView === 'staff' ? 'text-indigo-600' : 'text-gray-400'}>
            <i className="fas fa-user-tie"></i>
          </button>
          <button onClick={() => setView('display')} className={currentView === 'display' ? 'text-indigo-600' : 'text-gray-400'}>
            <i className="fas fa-tv"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
