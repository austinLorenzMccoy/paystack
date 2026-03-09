"use client";

import { useState, useEffect } from "react";
import { Search, Filter, TrendingUp, Star, Clock, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

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

interface TaskRequest {
  agentId: string;
  description: string;
  budget: number;
  deadline: number;
  requirements: string[];
}

export default function AgentMarketplace() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskBudget, setTaskBudget] = useState("");
  const [hiringLoading, setHiringLoading] = useState(false);

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

  const handleHireAgent = async (agent: Agent) => {
    if (!user) {
      alert("Please connect your wallet to hire agents");
      return;
    }

    if (!taskDescription || !taskBudget) {
      alert("Please provide task description and budget");
      return;
    }

    setHiringLoading(true);
    
    try {
      // Simulate hiring process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Successfully hired ${agent.name}! Task created with budget ${taskBudget} STX`);
      
      // Reset form
      setSelectedAgent(null);
      setTaskDescription("");
      setTaskBudget("");
      
    } catch (error) {
      console.error("Error hiring agent:", error);
      alert("Failed to hire agent. Please try again.");
    } finally {
      setHiringLoading(false);
    }
  };

  const getStatusColor = (available: boolean) => {
    return available ? "text-green-400" : "text-red-400";
  };

  const getStatusIcon = (available: boolean) => {
    return available ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Agent Marketplace</h1>
          <p className="text-gray-400 text-lg">
            Hire AI agents powered by x402 protocol for content creation, research, and optimization
          </p>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-orange-500 transition-colors cursor-pointer"
                onClick={() => setSelectedAgent(agent)}
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

                {/* Hire Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAgent(agent);
                  }}
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
            ))}
          </div>
        )}

        {/* Agent Detail Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedAgent.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-orange-400 capitalize">{selectedAgent.specialty}</span>
                      <div className={`flex items-center gap-1 ${getStatusColor(selectedAgent.available)}`}>
                        {getStatusIcon(selectedAgent.available)}
                        <span>{selectedAgent.available ? "Available" : "Busy"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">{selectedAgent.reputation}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Agent Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 rounded p-4">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <DollarSign className="w-5 h-5" />
                      <span className="font-bold text-lg">{selectedAgent.hourlyRate} STX</span>
                    </div>
                    <div className="text-sm text-gray-400">per hour</div>
                  </div>
                  <div className="bg-gray-800 rounded p-4">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-bold text-lg">{selectedAgent.successRate}%</span>
                    </div>
                    <div className="text-sm text-gray-400">success rate</div>
                  </div>
                  <div className="bg-gray-800 rounded p-4">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                      <Clock className="w-5 h-5" />
                      <span className="font-bold text-lg">{selectedAgent.totalEarnings} STX</span>
                    </div>
                    <div className="text-sm text-gray-400">total earned</div>
                  </div>
                </div>

                {/* Full Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">About</h3>
                  <p className="text-gray-300">{selectedAgent.description}</p>
                </div>

                {/* All Skills */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-gray-800 text-gray-300 text-sm rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hire Form */}
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Hire This Agent</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Task Description
                      </label>
                      <textarea
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Describe what you need this agent to do..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Budget (STX)
                      </label>
                      <input
                        type="number"
                        value={taskBudget}
                        onChange={(e) => setTaskBudget(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleHireAgent(selectedAgent)}
                        disabled={!selectedAgent.available || hiringLoading}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          selectedAgent.available && !hiringLoading
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {hiringLoading ? "Processing..." : `Hire for ${taskBudget || '0.00'} STX`}
                      </button>
                      <button
                        onClick={() => setSelectedAgent(null)}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
