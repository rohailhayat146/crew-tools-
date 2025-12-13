import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex space-x-1 items-center p-2 bg-slate-100 rounded-2xl w-fit ml-2 mt-2">
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
    </div>
  );
};

export default TypingIndicator;