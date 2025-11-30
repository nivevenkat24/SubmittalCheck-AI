import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Minimize2, Maximize2, Globe, ExternalLink } from 'lucide-react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { startChatSession } from '../services/geminiService';

interface ChatWidgetProps {
  fileData: string;
  mimeType: string;
}

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

interface Message {
  role: 'user' | 'model';
  text: string;
  groundingChunks?: GroundingChunk[];
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ fileData, mimeType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I've analyzed the full document (including technical data sheets). I can also search the web to verify product availability. Ask me about specific details or pages (e.g., \"Did you read page 15?\")." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fileData && mimeType && !chatRef.current) {
      try {
        chatRef.current = startChatSession(fileData, mimeType);
      } catch (error) {
        console.error("Failed to initialize chat", error);
      }
    }
  }, [fileData, mimeType]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatRef.current || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMsg });
      
      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: result.text || "No response text.",
        groundingChunks: groundingChunks
      }]);
      
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-600 hover:bg-brand-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-105 z-50 flex items-center gap-2"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="font-medium pr-1">Ask AI</span>
      </button>
    );
  }

  return (
    <div className={`fixed right-4 md:right-6 bg-white rounded-t-xl md:rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 transition-all duration-300 flex flex-col
      ${isMinimized ? 'bottom-0 w-72 h-14' : 'bottom-0 md:bottom-6 w-full md:w-[400px] h-[80vh] md:h-[600px]'}
    `}>
      {/* Header */}
      <div className="bg-slate-900 text-white p-3 px-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2" onClick={() => setIsMinimized(!isMinimized)}>
          <MessageSquare className="h-5 w-5 text-brand-400" />
          <h3 className="font-semibold text-sm">Submittal Q&A Agent</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`
                  max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}
                `}>
                  {msg.text}
                </div>
                
                {/* Grounding Sources Display */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-2 max-w-[85%] bg-slate-100 rounded-lg p-2 text-xs border border-slate-200">
                    <div className="flex items-center gap-1 text-slate-500 font-semibold mb-1">
                      <Globe className="h-3 w-3" />
                      <span>Sources Checked:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingChunks.map((chunk, i) => {
                        if (!chunk.web?.uri) return null;
                        return (
                          <a 
                            key={i} 
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-brand-600 hover:underline bg-white px-2 py-1 rounded border border-slate-200 truncate max-w-[200px]"
                          >
                            <span className="truncate">{chunk.web.title || "Source"}</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-brand-600 animate-spin" />
                  <span className="text-xs text-slate-500">Agent is researching...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Verify specs, discontinued products..."
                className="w-full bg-slate-100 text-slate-900 placeholder-slate-500 border-0 rounded-full py-3 pl-4 pr-12 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-sm"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-2 bg-brand-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};