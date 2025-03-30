
import React, { useState, useRef, useEffect } from 'react';
import { Send, PresentationChart, ThumbsUp, ThumbsDown, Plus, Search, Lightbulb, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AgentHeader from './AgentHeader';
import MessageItem from './MessageItem';

type AgentType = 'general' | 'clinical' | 'food';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  agentType: AgentType;
  timestamp: Date;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      agentType: currentAgent,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate agent response based on the message content
    setTimeout(() => {
      let agentType: AgentType = currentAgent;
      
      // Simple keyword-based agent routing
      if (input.toLowerCase().includes('clinical') || input.toLowerCase().includes('medical') || input.toLowerCase().includes('health')) {
        agentType = 'clinical';
      } else if (input.toLowerCase().includes('food') || input.toLowerCase().includes('agriculture') || input.toLowerCase().includes('crop')) {
        agentType = 'food';
      }
      
      if (agentType !== currentAgent) {
        setCurrentAgent(agentType);
        toast({
          title: "Agent Changed",
          description: `Your query was routed to the ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} agent`,
        });
      }
      
      const responseContent = getAgentResponse(agentType, input);
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'agent',
        agentType: agentType,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAgentResponse = (agentType: AgentType, query: string): string => {
    switch(agentType) {
      case 'clinical':
        return "Based on our clinical database, I can provide you with research-backed information. What specific medical information are you looking for?";
      case 'food':
        return "Our food security database indicates various trends in global agriculture and food resources. How can I help with your specific inquiry about food security?";
      default:
        return "I'm the general web agent. I can help you with a wide range of queries or route you to our specialized agents. What would you like to know?";
    }
  };

  const changeAgent = (type: AgentType) => {
    if (type !== currentAgent) {
      setCurrentAgent(type);
      toast({
        title: "Agent Changed",
        description: `Switched to the ${type.charAt(0).toUpperCase() + type.slice(1)} agent`,
      });
      
      const systemMessage: Message = {
        id: Date.now().toString(),
        content: `You are now chatting with the ${type.charAt(0).toUpperCase() + type.slice(1)} agent. How can I help you?`,
        sender: 'agent',
        agentType: type,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AgentHeader currentAgent={currentAgent} onChangeAgent={changeAgent} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-2xl mb-4">Ask anything</div>
            <div className="text-sm">Get started by asking a question</div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="message-container agent-message agent-message-general">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything"
            className="pr-32 py-6 rounded-full border"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <Button type="button" size="icon" variant="ghost" className="rounded-full">
              <Plus className="w-5 h-5" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="rounded-full">
              <Search className="w-5 h-5" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="rounded-full">
              <Lightbulb className="w-5 h-5" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="rounded-full">
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
      
      {messages.length > 0 && (
        <div className="p-4 flex justify-end border-t">
          <div className="flex space-x-2">
            <Button variant="outline" size="icon">
              <PresentationChart className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon">
              <ThumbsUp className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon">
              <ThumbsDown className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
