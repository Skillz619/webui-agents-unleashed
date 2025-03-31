import React, { useState, useRef, useEffect } from 'react';
import { Send, BarChart2, ThumbsUp, ThumbsDown, Plus, Search, Lightbulb, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AgentHeader from './AgentHeader';
import MessageItem from './MessageItem';
import DynamicChart from '../visualization/DynamicChart';

type AgentType = 'general' | 'clinical' | 'food';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  agentType: AgentType;
  timestamp: Date;
  jsonData?: any;
};

const previousResponses: Record<AgentType, string[]> = {
  general: [],
  clinical: [],
  food: []
};

const agentKnowledge = {
  general: {
    apiInfo: "I can help access various APIs including World Bank economic data, geographic information, and industry statistics.",
    dataTypes: "I can help with data like GDP, CO2 emissions, and agricultural land metrics.",
    capabilities: "I'm designed to assist with general inquiries, data visualization, and connecting you to specialized agents.",
    responses: [
      "Based on the latest data from our sources, I'd recommend looking at {topic} from a broader perspective. Would you like me to elaborate on specific aspects?",
      "That's an interesting question about {topic}. There are several approaches we could take to analyze this. Would you prefer a high-level overview or specific data points?",
      "I've found some relevant information about {topic}. The most recent trends suggest {insight}. Would you like to see a visualization of this data?",
      "When it comes to {topic}, it's important to consider multiple data sources. I can help you compare information from different APIs to get a more complete picture.",
      "I noticed your interest in {topic}. This intersects with several domains I can help with. Would you like me to focus on economic indicators, geographic patterns, or industry-specific metrics?"
    ]
  },
  clinical: {
    medicalConditions: ["COVID-19", "diabetes", "hypertension", "asthma", "cancer", "heart disease", "Alzheimer's"],
    treatments: ["medication", "surgery", "therapy", "lifestyle changes", "preventive care"],
    research: ["clinical trials", "medical studies", "evidence-based medicine", "medical journals"],
    responses: [
      "From a clinical perspective, {topic} has been the subject of several recent studies. The consensus among medical professionals suggests {insight}.",
      "Medical research on {topic} has evolved significantly in recent years. Current evidence indicates {insight}, though more research is still needed in some areas.",
      "When evaluating {topic} from a medical standpoint, it's crucial to consider both the established treatments and emerging approaches. The most promising directions include {insight}.",
      "Clinical guidelines for {topic} recommend a multi-faceted approach. The latest protocols emphasize {insight}, especially for patients with complicating factors.",
      "Healthcare professionals typically approach {topic} by first assessing {insight}. Would you like me to explain the standard diagnostic procedures or treatment options?"
    ]
  },
  food: {
    agriculture: ["sustainable farming", "crop yields", "irrigation", "soil health", "pesticide use, SIX TRANSFORMATION PATHWAYS TO ADDRESS THE MAJOR DRIVERS OF FOOD INSECURITY AND MALNUTRITION"],
    nutrition: ["food security", "malnutrition", "dietary guidelines", "nutrient deficiencies, SIX TRANSFORMATION PATHWAYS TO ADDRESS THE MAJOR DRIVERS OF FOOD INSECURITY AND MALNUTRITION"],
    global: ["food distribution", "climate impact", "agricultural policy", "trade barriers, SIX TRANSFORMATION PATHWAYS TO ADDRESS THE MAJOR DRIVERS OF FOOD INSECURITY AND MALNUTRITION"],
    responses: [
      "The six transformation pathways to address the major drivers of food insecurity and malnutrition are: 1 Integration of Humanitarian, Development, and Peacebuilding Policies: This strategy focuses on addressing the root causes of food insecurity, particularly in conflict-affected areas, by aligning policies from humanitarian, development, and peace sectors. <br> 2 Scaling Up Climate Resilience Across Food Systems: This pathway involves improving climate resilience by adopting sustainable farming practices and enhancing early warning systems to manage risks from climate change.<br>3 Strengthening Resilience of Food Supply Chains: The focus here is on improving infrastructure, logistics, and systems to ensure food distribution stability even in the face of disruptions like pandemics or natural disasters.<br>4 Bioscience Innovation for Adaptive and Transformative Food Systems: Using technology and bioscience innovations to improve crop yields and nutritional content, tackling malnutrition and food scarcity. <br>5 Building Inclusive, Sustainable, and Diverse Food Systems: This involves promoting inclusivity and sustainability by supporting small-scale farmers and diverse production and consumption patterns. <br>6 Promoting Healthy and Sustainable Consumption: Encourages dietary changes towards healthier and more sustainable consumption patterns, reducing malnutrition and diet-related diseases. These pathways provide comprehensive strategies targeting different aspects of food systems, from production to consumption, to effectively tackle food insecurity and malnutrition. The response was provided by utilizing the expertise of the food agent."
    ]
  }
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>('general');
  const [conversationContext, setConversationContext] = useState<Record<string, any>>({});
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  useEffect(() => {
    const selectedWidgetJson = sessionStorage.getItem('selectedWidget');
    if (selectedWidgetJson) {
      try {
        const selectedWidget = JSON.parse(selectedWidgetJson);
        setVisualizationData(selectedWidget.data);
        setShowVisualization(true);
        
        sessionStorage.removeItem('selectedWidget');
      } catch (error) {
        console.error('Error parsing selected widget:', error);
      }
    }
  }, []);

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
    
    if ((window as any).addChatToHistory) {
      (window as any).addChatToHistory(input);
    }
    
    setTimeout(() => {
      let agentType: AgentType = currentAgent;
      const lowerCaseInput = input.toLowerCase();
      
      const newContext = { ...conversationContext };
      newContext.lastQuery = input;
      
      const extractedTopics = extractTopicsFromQuery(lowerCaseInput, agentType);
      if (extractedTopics.length > 0) {
        newContext.currentTopic = extractedTopics[0];
      }
      
      const isJsonRequested = lowerCaseInput.includes('json') || 
                             lowerCaseInput.includes('data format') || 
                             lowerCaseInput.includes('format data');
      
      newContext.jsonRequested = isJsonRequested;
      
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
        newContext.agentSwitched = true;
        toast({
          title: "Agent Changed",
          description: `Your query was routed to the ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} agent`,
        });
      }
      
      setConversationContext(newContext);
      
      let responseContent = getAgentResponse(agentType, input, newContext);
      let jsonData = null;
      
      if (isJsonRequested) {
        jsonData = generateSampleData(agentType, input, extractedTopics);
        responseContent += `\n\nHere's the data in JSON format:\n\`\`\`json\n${JSON.stringify(jsonData, null, 2)}\n\`\`\``;
      }
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'agent',
        agentType: agentType,
        timestamp: new Date(),
        jsonData: jsonData
      };
      
      previousResponses[agentType].push(responseContent);
      if (previousResponses[agentType].length > 5) {
        previousResponses[agentType].shift();
      }
      
      setMessages(prev => [...prev, agentMessage]);
      
      if (jsonData) {
        setVisualizationData(jsonData);
      }
      
      setIsTyping(false);
    }, 1500);
  };

  const extractTopicsFromQuery = (query: string, agentType: AgentType): string[] => {
    const topics: string[] = [];
    
    switch(agentType) {
      case 'clinical':
        agentKnowledge.clinical.medicalConditions.forEach(condition => {
          if (query.includes(condition.toLowerCase())) {
            topics.push(condition);
          }
        });
        agentKnowledge.clinical.treatments.forEach(treatment => {
          if (query.includes(treatment.toLowerCase())) {
            topics.push(treatment);
          }
        });
        break;
        
      case 'food':
        agentKnowledge.food.agriculture.forEach(term => {
          if (query.includes(term.toLowerCase())) {
            topics.push(term);
          }
        });
        agentKnowledge.food.nutrition.forEach(term => {
          if (query.includes(term.toLowerCase())) {
            topics.push(term);
          }
        });
        break;
        
      default:
        const potentialTopics = ["data", "GDP", "CO2", "emissions", "land", "statistics", "visualization", "economy"];
        potentialTopics.forEach(topic => {
          if (query.includes(topic.toLowerCase())) {
            topics.push(topic);
          }
        });
    }
    
    if (topics.length === 0) {
      const words = query.split(' ');
      words.forEach(word => {
        if (word.length > 5 && !["about", "would", "should", "could", "please", "thank"].includes(word)) {
          topics.push(word);
        }
      });
    }
    
    return topics;
  };

  const getAgentResponse = (agentType: AgentType, query: string, context: Record<string, any>): string => {
    const lowerCaseQuery = query.toLowerCase();
    const responseSet = agentKnowledge[agentType].responses;
    
    let topic = context.currentTopic || "this subject";
    
    let insight = "";
    switch(agentType) {
      case 'clinical':
        if (lowerCaseQuery.includes('treatment') || lowerCaseQuery.includes('cure')) {
          insight = "a combination of medication, lifestyle changes, and regular monitoring";
        } else if (lowerCaseQuery.includes('symptom') || lowerCaseQuery.includes('diagnosis')) {
          insight = "early detection through comprehensive screening protocols";
        } else if (lowerCaseQuery.includes('research') || lowerCaseQuery.includes('study')) {
          insight = "promising results in phase II clinical trials";
        } else {
          insight = "a personalized approach based on patient history and risk factors";
        }
        break;
        
      case 'food':
        if (lowerCaseQuery.includes('sustainable') || lowerCaseQuery.includes('environment')) {
          insight = "integrated pest management and crop rotation techniques";
        } else if (lowerCaseQuery.includes('nutrition') || lowerCaseQuery.includes('diet')) {
          insight = "balanced macronutrient profiles and micronutrient fortification";
        } else if (lowerCaseQuery.includes('global') || lowerCaseQuery.includes('world')) {
          insight = "decentralized distribution networks and cold chain technology";
        } else {
          insight = "locally adapted solutions that respect traditional knowledge";
        }
        break;
        
      default:
        if (lowerCaseQuery.includes('data') || lowerCaseQuery.includes('statistics')) {
          insight = "a 15% year-over-year change in key indicators";
        } else if (lowerCaseQuery.includes('api') || lowerCaseQuery.includes('source')) {
          insight = "combining multiple data sources for more robust analysis";
        } else if (lowerCaseQuery.includes('trend') || lowerCaseQuery.includes('pattern')) {
          insight = "significant correlations between previously unconnected variables";
        } else {
          insight = "patterns that become apparent when visualizing the data";
        }
    }
    
    if (lowerCaseQuery.includes('hello') || lowerCaseQuery.includes('hi ')) {
      return `Hello! I'm the ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} agent. How can I assist you today?`;
    }
    
    if (lowerCaseQuery.includes('thank')) {
      return "You're welcome! Is there anything else you'd like to know about?";
    }
    
    if (lowerCaseQuery.includes('help')) {
      switch(agentType) {
        case 'clinical':
          return "As the Clinical agent, I can provide information on medical conditions, treatments, research findings, and health guidelines. What specific health topic would you like to explore?";
        case 'food':
          return "As the Food Security agent, I can provide insights on agricultural practices, nutrition, global food distribution, and sustainable farming. What aspect of food systems would you like to learn about?";
        default:
          return "I'm your general web assistant. I can help navigate various data sources, answer questions about economic indicators, environmental statistics, or connect you with specialized agents for clinical or food security information.";
      }
    }
    
    if (context.agentSwitched) {
      switch(agentType) {
        case 'clinical':
          return `I've switched to the Clinical agent to better address your question about ${topic}. From a medical perspective, what specific aspect would you like to explore?`;
        case 'food':
          return `I'm now operating as the Food Security agent to help with your question about ${topic}. What particular aspect of food systems or agriculture would you like to know about?`;
        default:
          return `I've switched to the General agent. I can provide broad information on various topics including data analytics, economic indicators, and more. How can I assist with your interest in ${topic}?`;
      }
    }
    
    let selectedResponse = "";
    let attempts = 0;
    
    do {
      const randomIndex = Math.floor(Math.random() * responseSet.length);
      selectedResponse = responseSet[randomIndex]
        .replace("{topic}", topic)
        .replace("{insight}", insight);
      attempts++;
    } while (previousResponses[agentType].includes(selectedResponse) && attempts < 10);
    
    return selectedResponse;
  };

  const generateSampleData = (agentType: AgentType, query: string, topics: string[]): any => {
    const topic = topics.length > 0 ? topics[0] : "general";
    const currentYear = new Date().getFullYear();
    const yearRange = Array.from({length: 10}, (_, i) => (currentYear - 10 + i).toString());
    
    switch(agentType) {
      case 'clinical':
        return {
          title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Statistics`,
          description: `Annual statistics for ${topic}`,
          years: yearRange,
          data: yearRange.map(year => ({
            year,
            cases: Math.floor(Math.random() * 5000) + 1000,
            recoveries: Math.floor(Math.random() * 4000) + 800,
            treatments: Math.floor(Math.random() * 3000) + 600
          }))
        };
        
      case 'food':
        return {
          title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Production`,
          description: `Annual production statistics for ${topic}`,
          years: yearRange,
          data: yearRange.map(year => ({
            year,
            production: Math.floor(Math.random() * 1000) + 200,
            consumption: Math.floor(Math.random() * 800) + 150,
            export: Math.floor(Math.random() * 400) + 50
          }))
        };
        
      default:
        return {
          title: `Global ${topic.charAt(0).toUpperCase() + topic.slice(1)} Trends`,
          description: `Annual statistics for ${topic}`,
          years: yearRange,
          data: yearRange.map(year => ({
            year,
            value: Math.floor(Math.random() * 100) + 20,
            growth: (Math.random() * 10 - 5).toFixed(1),
            indicator: Math.floor(Math.random() * 50) + 10
          }))
        };
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

  const toggleVisualization = () => {
    if (!visualizationData) {
      toast({
        title: "No data available",
        description: "Try asking for data in JSON format first",
        variant: "destructive"
      });
      return;
    }
    setShowVisualization(!showVisualization);
  };

  return (
    <div className="flex flex-col h-full">
      <AgentHeader currentAgent={currentAgent} onChangeAgent={changeAgent} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {showVisualization ? (
          <DynamicChart data={visualizationData} onClose={() => setShowVisualization(false)} />
        ) : messages.length === 0 ? (
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
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleVisualization}
              className={visualizationData ? "" : "opacity-50"}
              title={visualizationData ? "View visualization" : "No data available for visualization"}
            >
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
