import React from 'react';
import { Message } from '../types';
import { User, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Simple formatter to handle bold text (**text**) and newlines
  const formatText = (text: string) => {
    return text.split('\n').map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIndex} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
          }
          return <span key={partIndex}>{part}</span>;
        })}
        {lineIndex < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        {/* Avatar */}
        <div 
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
            ${isUser ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-pink-500 to-orange-400 text-white shadow-lg'}`}
        >
          {isUser ? <User size={16} /> : <Sparkles size={16} />}
        </div>

        {/* Bubble */}
        <div
          className={`p-4 rounded-2xl shadow-sm border
            ${isUser 
              ? 'bg-indigo-600 text-white border-indigo-600 rounded-tr-none' 
              : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'}`}
        >
          <div className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${isUser ? 'text-indigo-50' : ''}`}>
             {isUser ? message.text : formatText(message.text)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;