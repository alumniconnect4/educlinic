'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, RotateCcw } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Hello! I am Reyna, your AI Assistant. How can I help you?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const renderMessageText = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <div key={match.index} className="mt-2 mb-1">
          <Link
            href={match[2]}
            className="inline-block px-4 py-1.5 bg-[#cd2026] text-white text-[13px] font-semibold rounded-full hover:bg-[#a31519] transition-colors shadow-sm cursor-pointer"
          >
            {match[1]}
          </Link>
        </div>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowTooltip(false);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    const newUserMsg: Message = { id: Date.now(), text: userMessage, sender: 'user' };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ai/ask`, {
        message: userMessage
      });

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: response.data.reply, sender: 'bot' }
      ]);
    } catch (error) {
      console.error("AI API Error:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: 'AI assistant is not available, please try again later.', sender: 'bot' }
      ]);
    }
  };

  const handleReset = () => {
    setMessages([
      { id: 1, text: 'Hello! I am Reyna, your AI Assistant. How can I help you?', sender: 'bot' }
    ]);
  };

  return (
    <>
      <div
        className={`fixed bottom-0 right-4 sm:right-10 z-[60] flex flex-col w-[350px] h-[35rem] max-h-[85vh] bg-white rounded-t-2xl shadow-[0_-5px_25px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-gray-200 ${isOpen
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
          }`}
      >
        <div className="bg-black/90 text-white p-4 flex items-center justify-between shadow-sm z-10 border-b border-black/10">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden border-2 border-white/10">
                <Image src="/reyna.png" alt="Reyna" width={44} height={44} className="object-cover w-full h-full scale-[1.15]" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full shadow-sm"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-wide text-lg leading-none mb-1">Reyna</span>
              <span className="text-[10px] text-white/90 font-semibold tracking-widest uppercase opacity-90">AI ASSISTANT</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleReset} className="p-2 hover:bg-black/15 rounded-full transition-all duration-200 cursor-pointer" title="Reset Chat">
              <RotateCcw size={18} strokeWidth={2.5} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/15 rounded-full transition-all duration-200 cursor-pointer" title="Close">
              <X size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div
          className="flex-1 bg-[#f8f9fa] p-4 overflow-y-auto flex flex-col gap-4 relative"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex gap-2 max-w-[85%]">
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-white flex-shrink-0 flex items-center justify-center mt-1 shadow-sm overflow-hidden border border-gray-200">
                    <Image src="/reyna.png" alt="Reyna" width={28} height={28} className="object-cover w-full h-full scale-[1.15]" />
                  </div>
                )}
                <div
                  className={`p-3 text-[13.5px] shadow-sm leading-relaxed break-words ${msg.sender === 'user'
                    ? 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tr-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                    }`}
                >
                  {renderMessageText(msg.text)}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[85%]">
                <div className="w-7 h-7 bg-white rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm overflow-hidden border border-gray-200">
                  <Image src="/reyna.png" alt="Reyna" width={28} height={28} className="object-cover w-full h-full scale-[1.15]" />
                </div>
                <div className="p-4 shadow-sm bg-white border border-gray-100 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-10">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}



          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-10">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message here..."
            className="flex-1 text-sm outline-none px-3 py-2 text-gray-700 bg-gray-50 rounded-full border border-gray-200 focus:border-gray-300 focus:bg-white transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 transition-all ${inputValue.trim()
              ? 'bg-[#cd2026] text-white hover:bg-[#b01c20] cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Send size={15} className="ml-0.5" />
          </button>
        </div>
      </div>

      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-700 ${isOpen ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="relative">
          {!isOpen && showTooltip && (
            <div className="absolute bottom-[110%] right-0 mb-3 w-[240px] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-2xl p-3 pr-7 origin-bottom-right transition-all duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer z-20"
                aria-label="Close tooltip"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
              <p className="text-[13px] text-gray-600 leading-snug relative z-10">
                Hey! I am <span className="text-[#cd2026] font-bold">Reyna</span>... Your AI Assistant.
              </p>

              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45 rounded-sm"></div>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-[0_4px_15px_rgba(205,32,38,0.4)] transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden z-10 ${isOpen ? 'bg-gray-800 shadow-[0_4px_15px_rgba(0,0,0,0.2)]' : 'bg-white border-2 border-gray-100'
                }`}
              aria-label="Chatbot"
            >
              {isOpen ? (
                <X className="text-white w-6 h-6" strokeWidth={2.5} />
              ) : (
                <Image src="/reyna.png" alt="Reyna" fill className="object-cover scale-[1.15]" />
              )}
            </button>

            {!isOpen && (
              <div className="absolute top-0 right-0 w-4 h-4 z-20 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-white translate-x-[2px] translate-y-[2px]"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
