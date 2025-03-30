
import React, { useState, useRef, useEffect } from 'react';
import { Send, BarChart2, ThumbsUp, ThumbsDown, Plus, Search, Lightbulb, Mic } from 'lucide-react';
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
    
    // Add this chat to the sidebar history
    if ((window as any).addChatToHistory) {
      (window as any).addChatToHistory(input);
    }
    
    // Analyze query and determine appropriate agent type
    setTimeout(() => {
      let agentType: AgentType = currentAgent;
      const lowerCaseInput = input.toLowerCase();
      
      // Simple keyword-based agent routing
      if (lowerCaseInput.includes('clinical') || lowerCaseInput.includes('medical') || 
          lowerCaseInput.includes('health') || lowerCaseInput.includes('disease') || 
          lowerCaseInput.includes('treatment') || lowerCaseInput.includes('doctor')) {
        agentType = 'clinical';
      } else if (lowerCaseInput.includes('food') || lowerCaseInput.includes('agriculture') || 
                lowerCaseInput.includes('crop') || lowerCaseInput.includes('farm') || 
                lowerCaseInput.includes('nutrition') || lowerCaseInput.includes('hunger')) {
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
    const lowerCaseQuery = query.toLowerCase();
    
    switch(agentType) {
      case 'clinical':
        if (lowerCaseQuery.includes('covid') || lowerCaseQuery.includes('coronavirus')) {
          return "According to our clinical database, COVID-19 is caused by the SARS-CoV-2 virus. Symptoms can include fever, cough, and shortness of breath. Vaccination remains one of the most effective preventive measures.";
        } else if (lowerCaseQuery.includes('diabetes')) {
          return "Our medical research indicates that diabetes is a chronic condition affecting how your body processes blood sugar. There are two main types: Type 1 (where the body doesn't produce insulin) and Type 2 (where the body doesn't use insulin effectively).";
        } else if (lowerCaseQuery.includes('treatment') || lowerCaseQuery.includes('therapy')) {
          return "Medical treatments should always be prescribed by qualified healthcare professionals. Our clinical database can provide research-backed information on various treatment approaches, but this should not replace professional medical advice.";
        } else {
          return "Based on our clinical research database, I can provide evidence-based information on medical conditions, treatments, and health research. What specific medical topic would you like me to analyze?";
        }
        
      case 'food':
        if (lowerCaseQuery.includes('climate') || lowerCaseQuery.includes('warming')) {
          return "Climate change is significantly impacting global food security. Rising temperatures affect crop yields, while changing precipitation patterns disrupt traditional growing seasons. Our agricultural database shows that adaptive farming techniques like drought-resistant crops are becoming increasingly important.";
        } else if (lowerCaseQuery.includes('nutrition') || lowerCaseQuery.includes('diet')) {
          return "Nutritional security varies greatly across regions. Our food database indicates that balanced diets containing adequate proteins, carbohydrates, fats, and micronutrients are essential for human health, yet approximately 2 billion people lack regular access to safe, nutritious food.";
        } else if (lowerCaseQuery.includes('farm') || lowerCaseQuery.includes('agriculture')) {
          return "Sustainable farming practices are crucial for long-term food security. Our agricultural data shows that practices like crop rotation, minimal tillage, and integrated pest management can maintain soil health while increasing productivity over time.";
        } else {
          return "Our food security database contains information on global agriculture trends, nutrition, sustainable farming practices, and food distribution systems. What specific aspect of food security would you like to explore?";
        }
        
      default: // general agent
        if (lowerCaseQuery.includes('data') || lowerCaseQuery.includes('api')) {
          return "I can help you access and interpret various data APIs. Would you like to explore economic indicators like GDP, environmental data such as CO2 emissions, or perhaps agricultural land usage statistics? You can also switch to our specialized agents for more domain-specific assistance.";
        } else if (lowerCaseQuery.includes('help') || lowerCaseQuery.includes('can you')) {
          return "I'm your general assistant, able to help with a wide range of queries. For specialized information, I can route you to our Clinical agent for health-related questions or our Food Security agent for agricultural and nutrition topics. What would you like to know?";
        } else if (lowerCaseQuery.includes('agent') || lowerCaseQuery.includes('switch')) {
          return "You can switch between three specialized agents: the General agent (that's me) for broad topics, the Clinical agent for health and medical research, and the Food Security agent for agriculture and nutrition information. Just click on the agent buttons above or ask a question related to that domain.";
        } else {
          return "I'm your general web assistant. I can help you navigate various data sources, answer general questions, or connect you with our specialized agents for clinical or food security information. How can I assist you today?";
        }
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
              <BarChart2 className="w-5 h-5" />
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
