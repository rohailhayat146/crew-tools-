
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat, Content } from "@google/genai";
import { Send, Menu, X, Plus, MessageSquare, History, Search, ArrowLeft } from 'lucide-react';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Message, ChatSessionRecord } from '../types';
import { WELCOME_MESSAGE } from '../constants';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SuggestedPrompts from './SuggestedPrompts';

interface ChatInterfaceProps {
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: WELCOME_MESSAGE }
  ]);
  const [chatHistory, setChatHistory] = useState<ChatSessionRecord[]>([]);
  const [input, setInput] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat session on mount
  useEffect(() => {
    setChatSession(createChatSession());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 120)}px`;
    }
  };

  const saveCurrentChat = useCallback(() => {
    // Only save if there's actual interaction (more than just welcome message)
    if (messages.length > 1) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      const title = firstUserMessage 
        ? (firstUserMessage.text.length > 30 ? firstUserMessage.text.substring(0, 30) + '...' : firstUserMessage.text)
        : 'New Strategy';

      const newHistoryItem: ChatSessionRecord = {
        id: Date.now().toString(),
        title,
        messages: [...messages],
        createdAt: Date.now(),
      };

      setChatHistory(prev => [newHistoryItem, ...prev]);
    }
  }, [messages]);

  const handleSend = useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !chatSession || isLoading) return;

    // Reset input
    setInput('');
    if (textAreaRef.current) textAreaRef.current.style.height = 'auto';

    // Add user message
    const userMessageId = Date.now().toString();
    setMessages(prev => [
      ...prev,
      { id: userMessageId, role: 'user', text: textToSend }
    ]);

    setIsLoading(true);

    try {
      const streamResult = await sendMessageStream(chatSession, textToSend);
      
      const modelMessageId = (Date.now() + 1).toString();
      let fullText = '';
      let lastUpdateTime = 0;
      
      // Initialize empty model message
      setMessages(prev => [
        ...prev,
        { id: modelMessageId, role: 'model', text: '', isStreaming: true }
      ]);

      for await (const chunk of streamResult) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          
          // Optimization: Throttle state updates to every 75ms to prevent UI lag on tablets/mobile
          const now = Date.now();
          if (now - lastUpdateTime > 75) {
             setMessages(prev => 
              prev.map(msg => 
                msg.id === modelMessageId 
                  ? { ...msg, text: fullText } 
                  : msg
              )
            );
            lastUpdateTime = now;
          }
        }
      }
      
      // Final update to ensure complete text and turn off streaming
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, text: fullText, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered an error. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [chatSession, input, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    saveCurrentChat();
    setChatSession(createChatSession());
    setMessages([{ id: Date.now().toString(), role: 'model', text: WELCOME_MESSAGE }]);
    setIsSidebarOpen(false);
  };

  const loadChatHistory = (record: ChatSessionRecord) => {
    if (messages.length > 1) {
       saveCurrentChat(); 
    }

    setMessages(record.messages);
    
    const historyContent: Content[] = record.messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

    setChatSession(createChatSession(historyContent));
    setIsSidebarOpen(false);
  };

  const filteredHistory = chatHistory.filter(session => 
    session.title.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 w-64 h-full bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
                <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500" title="Back to Menu">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                    SocialStrategist
                </h1>
            </div>
            <button 
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1 text-slate-500 hover:bg-slate-100 rounded"
            >
                <X size={20} />
            </button>
        </div>
        
        <div className="p-4">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl transition-colors shadow-sm font-medium"
          >
            <Plus size={18} />
            New Strategy
          </button>

          {/* Search History */}
          {chatHistory.length > 0 && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {chatHistory.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <History size={12} />
                Recent Strategies
              </div>
              <div className="space-y-1">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadChatHistory(item)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-100 transition-colors text-sm text-slate-600 truncate flex items-center gap-2"
                    >
                      <MessageSquare size={14} className="flex-shrink-0 text-slate-400" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-slate-400 italic px-2">No matching strategies</div>
                )}
              </div>
            </div>
          )}

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">About</div>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            I am a specialized AI designed to help you dominate social media. Ask me for content calendars, viral hooks, editing tools, or platform-specific advice.
          </p>
          
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Platforms</div>
          <div className="space-y-2">
            <div className="text-sm text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div> Instagram</div>
            <div className="text-sm text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> TikTok</div>
            <div className="text-sm text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-600"></div> YouTube</div>
            <div className="text-sm text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> LinkedIn</div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          Powered by Massab
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full w-full relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 bg-white border-b border-slate-200 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="mr-3 text-slate-600"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-slate-800">Chat</span>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-3xl lg:max-w-5xl mx-auto flex flex-col min-h-full">
            
            {/* Show suggested prompts only if there is just the welcome message */}
            {messages.length === 1 && (
               <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Social Media Mastery</h2>
                    <p className="text-slate-500">Choose a starting point or type your own question.</p>
                  </div>
                  <SuggestedPrompts onSelect={(prompt) => handleSend(prompt)} />
               </div>
            )}

            {/* Message List */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && <TypingIndicator />}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-3xl lg:max-w-5xl mx-auto relative">
            <textarea
              ref={textAreaRef}
              value={input}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              placeholder="Ask about content ideas, captions, or strategy..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none max-h-[120px] min-h-[50px] shadow-sm text-slate-800"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="text-center text-xs text-slate-400 mt-2">
            AI can make mistakes. Review generated strategies before posting.
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatInterface;
