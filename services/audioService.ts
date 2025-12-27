
export const playPriorityAlert = () => {
  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, context.currentTime); // A5
  oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.5); // A4
  
  gainNode.gain.setValueAtTime(0.3, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.5);
};

export const announceToken = (prefix: string, number: number, category: string, counterId: number) => {
  if (!('speechSynthesis' in window)) return;

  const formattedNumber = number.toString().padStart(3, '0');
  // Ajuste do texto para incluir categoria
  const text = `Senha ${prefix}, ${formattedNumber}, ${category}. Por favor, dirija-se ao balcão ${counterId}.`;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};
