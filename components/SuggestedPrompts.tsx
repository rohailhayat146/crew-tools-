import React from 'react';
import { SuggestedPrompt } from '../types';
import { Instagram, Youtube, Film, ArrowRight } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts: SuggestedPrompt[] = [
  {
    title: 'Instagram Strategy',
    prompt: 'Draft a high-engagement Instagram caption for a travel photo in Bali, incorporating storytelling elements and strategic hashtags.',
    icon: <Instagram size={20} className="text-pink-700" />,
    color: 'text-pink-950',
    bgColor: 'bg-pink-100',
    cardBg: 'bg-gradient-to-br from-pink-200 to-rose-200',
    borderColor: 'border-pink-400'
  },
  {
    title: 'TikTok Viral Hooks',
    prompt: 'Generate 3 high-retention viral hooks for a TikTok video about budget-friendly grocery shopping that capture attention in the first 2 seconds.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-cyan-800"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
    color: 'text-slate-900',
    bgColor: 'bg-cyan-100',
    cardBg: 'bg-gradient-to-br from-cyan-200 to-slate-300',
    borderColor: 'border-cyan-500'
  },
  {
    title: 'YouTube Growth',
    prompt: 'Develop a structured 2-week content calendar for a tech review channel focused on maximizing viewer retention and click-through rates.',
    icon: <Youtube size={20} className="text-red-700" />,
    color: 'text-red-950',
    bgColor: 'bg-red-100',
    cardBg: 'bg-gradient-to-br from-red-200 to-orange-200',
    borderColor: 'border-red-400'
  },
  {
    title: 'Editing Workflow',
    prompt: 'Recommend professional-grade mobile video editing workflows and apps for creating high-quality Reels and TikTok content.',
    icon: <Film size={20} className="text-indigo-700" />,
    color: 'text-indigo-950',
    bgColor: 'bg-indigo-100',
    cardBg: 'bg-gradient-to-br from-indigo-200 to-purple-200',
    borderColor: 'border-indigo-400'
  },
];

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-3xl lg:max-w-5xl mx-auto mt-8 mb-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(p.prompt)}
            className={`group relative flex flex-col p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border ${p.cardBg || 'bg-white'} ${p.borderColor || 'border-slate-200'}`}
          >
            <div className="flex items-center justify-between w-full mb-4">
              <div className={`p-3 rounded-full ${p.bgColor || 'bg-slate-50'} shadow-sm transition-transform duration-300 group-hover:scale-110 border border-white/50`}>
                {p.icon}
              </div>
              <ArrowRight size={18} className={`${p.color} opacity-60 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300`} />
            </div>
            
            <div>
              <h3 className={`font-bold text-base mb-2 ${p.color || 'text-slate-800'}`}>
                {p.title}
              </h3>
              <p className={`text-sm leading-relaxed opacity-90 font-medium ${p.color}`}>
                {p.prompt}
              </p>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-b-2xl"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;