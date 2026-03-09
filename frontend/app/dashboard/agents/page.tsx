"use client";

import { useEffect, useState } from "react";
import { Bot, TrendingUp, DollarSign, Clock, Star, CheckCircle, AlertCircle, Search, Filter } from "lucide-react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  specialty: string;
  reputation: number;
  hourlyRate: number;
  totalEarnings: number;
  successRate: number;
  available: boolean;
  description: string;
  skills: string[];
}

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

function AgentCard({ agent, onSelect }: AgentCardProps) {
  const getStatusColor = (available: boolean) => {
    return available ? "text-green-400" : "text-red-400";
  };

  const getStatusIcon = (available: boolean) => {
    return available ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-orange-500 transition-colors cursor-pointer"
      onClick={() => onSelect(agent)}
    >
      {/* Agent Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-orange-400 capitalize">{agent.specialty}</span>
            <div className={`flex items-center gap-1 ${getStatusColor(agent.available)}`}>
              {getStatusIcon(agent.available)}
              <span className="text-xs">
                {agent.available ? "Available" : "Busy"}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{agent.reputation}</span>
          </div>
          <div className="text-xs text-gray-400">reputation</div>
        </div>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 rounded p-3">
          <div className="flex items-center gap-2 text-green-400">
            <DollarSign className="w-4 h-4" />
            <span className="font-bold">{agent.hourlyRate} STX</span>
          </div>
          <div className="text-xs text-gray-400">per hour</div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="flex items-center gap-2 text-blue-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-bold">{agent.successRate}%</span>
          </div>
          <div className="text-xs text-gray-400">success rate</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {agent.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {agent.skills.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
          >
            {skill}
          </span>
        ))}
        {agent.skills.length > 3 && (
          <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
            +{agent.skills.length - 3} more
          </span>
        )}
      </div>

      {/* View Button */}
      <button
        disabled={!agent.available}
        className={`w-full py-2 rounded-lg font-medium transition-colors ${
          agent.available
            ? "bg-orange-500 hover:bg-orange-600 text-white"
            : "bg-gray-800 text-gray-500 cursor-not-allowed"
        }`}
      >
        {agent.available ? "View Details" : "Unavailable"}
      </button>
    </div>
  );
}

export default function DashboardAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const specialties = [
    "all",
    "research",
    "writing", 
    "analysis",
    "optimization",
    "content-creation",
    "data-analysis"
  ];

  const placeholderAgents: Agent[] = [
    {
      id: "1",
      name: "ResearchGPT",
      specialty: "research",
      reputation: 4.8,
      hourlyRate: 0.05,
      totalEarnings: 1250,
      successRate: 96,
      available: true,
      description: "Specialized in market research, trend analysis, and data gathering for creators",
      skills: ["Market Research", "Data Analysis", "Trend Identification", "Competitive Analysis"]
    },
    {
      id: "2", 
      name: "ContentWriter Pro",
      specialty: "writing",
      reputation: 4.9,
      hourlyRate: 0.04,
      totalEarnings: 2100,
      successRate: 98,
      available: true,
      description: "Professional content creation for articles, scripts, and social media",
      skills: ["Article Writing", "Script Writing", "SEO Optimization", "Social Media Content"]
    },
    {
      id: "3",
      name: "DataAnalyzer X",
      specialty: "analysis", 
      reputation: 4.7,
      hourlyRate: 0.06,
      totalEarnings: 980,
      successRate: 94,
      available: true,
      description: "Advanced data analysis and financial modeling for creator businesses",
      skills: ["Financial Analysis", "Data Modeling", "Performance Analytics", "Revenue Optimization"]
    },
    {
      id: "4",
      name: "GrowthOptimizer",
      specialty: "optimization",
      reputation: 4.6,
      hourlyRate: 0.045,
      totalEarnings: 1560,
      successRate: 95,
      available: false,
      description: "A/B testing, conversion optimization, and growth strategies",
      skills: ["A/B Testing", "Conversion Optimization", "Growth Hacking", "User Analytics"]
    }
  ];

  useEffect(() => {
    // Simulate loading agents
    setTimeout(() => {
      setAgents(placeholderAgents);
      setFilteredAgents(placeholderAgents);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = agents;

    // Filter by specialty
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(agent => agent.specialty === selectedSpecialty);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredAgents(filtered);
  }, [agents, searchTerm, selectedSpecialty]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Agent Marketplace</h1>
        <p className="text-gray-400">
          Hire AI agents powered by x402 protocol for content creation, research, and optimization
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Bot className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{filteredAgents.length}</div>
              <div className="text-sm text-gray-400">Available Agents</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {filteredAgents.filter(a => a.available).length}
              </div>
              <div className="text-sm text-gray-400">Ready to Work</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">4.7</div>
              <div className="text-sm text-gray-400">Avg Reputation</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">96%</div>
              <div className="text-sm text-gray-400">Avg Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents, skills, or specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
        >
          {specialties.map(specialty => (
            <option key={specialty} value={specialty}>
              {specialty === "all" ? "All Specialties" : specialty.charAt(0).toUpperCase() + specialty.slice(1)}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-center bg-gray-900 border border-gray-800 rounded-lg">
          <Filter className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-gray-400">
            {filteredAgents.length} agents found
          </span>
        </div>
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading agents...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onSelect={setSelectedAgent}
            />
          ))}
        </div>
      )}

      {/* Link to Full Marketplace */}
      <div className="text-center py-8">
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
        >
          <Bot className="w-5 h-5" />
          View Full Agent Marketplace
        </Link>
      </div>
    </div>
  );
}
