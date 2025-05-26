import React from "react";
import { Button } from "antd";
import {
  RobotOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  MessageOutlined,
  ArrowRightOutlined,
  StarOutlined,
  TeamOutlined,
  FileTextOutlined,
  ApiOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";


const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <RobotOutlined className="text-3xl text-blue-500" />,
      title: "Custom AI Chatbot Creation",
      description: "Create your own AI chatbot with interactive prompt generation and intelligent information collection.",
    },
    {
      icon: <FileTextOutlined className="text-3xl text-blue-500" />,
      title: "RAG-based Processing",
      description: "Power your chatbot with document processing, intelligent retrieval, and context-aware responses.",
    },
    {
      icon: <ApiOutlined className="text-3xl text-blue-500" />,
      title: "Multiple AI Models",
      description: "Choose from various AI models including GPT-4 and Gemini for optimal performance.",
    },
  ];

  const capabilities = [
    {
      icon: <DatabaseOutlined className="text-2xl text-blue-500" />,
      title: "Document Processing",
      description: "Upload and process documents with automatic chunking and indexing for efficient retrieval.",
    },
    {
      icon: <MessageOutlined className="text-2xl text-blue-500" />,
      title: "Streaming Responses",
      description: "Experience real-time, streaming responses for a more engaging conversation.",
    },
    {
      icon: <ThunderboltOutlined className="text-2xl text-blue-500" />,
      title: "Intelligent Prompting",
      description: "Automatically generate and optimize prompts based on your specific requirements.",
    },
    {
      icon: <GlobalOutlined className="text-2xl text-blue-500" />,
      title: "Vector Storage",
      description: "Efficient document storage and retrieval using advanced vector technology.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "AI Developer",
      content: "This platform has revolutionized how we create and deploy AI chatbots. The RAG capabilities are particularly impressive!",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      name: "Michael Chen",
      role: "Tech Lead",
      content: "The custom chatbot creation process is intuitive and powerful. The streaming responses make for a great user experience.",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      name: "Emma Davis",
      role: "Product Manager",
      content: "The document processing and vector storage features have significantly improved our chatbot's response quality.",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Your Custom AI Chatbot
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Build powerful AI chatbots with RAG capabilities, document processing, and streaming responses.
              Created by ABAOXOMTIEU to revolutionize AI chatbot development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                type="primary"
                size="large"
                className="bg-blue-600 hover:bg-blue-700 border-none px-8 h-12 text-lg"
                onClick={() => navigate("/assistants")}
              >
                Get Started
                <ArrowRightOutlined className="ml-2" />
              </Button>
              <Button
                size="large"
                className="h-12 text-lg"
                onClick={() => navigate("/create-prompt")}
              >
                Create Custom Bot
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for AI Chatbot Development
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to create and deploy intelligent AI chatbots
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Capabilities
            </h2>
            <p className="text-xl text-gray-600">
              Take your AI chatbots to the next level with these powerful features
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((capability, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="mb-4">{capability.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {capability.title}
                </h3>
                <p className="text-gray-600 text-sm">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join developers who have transformed their AI chatbot development
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your AI Chatbot?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start creating your custom AI chatbot with our powerful platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="primary"
              size="large"
              className="bg-white text-blue-600 hover:bg-blue-50 border-none px-8 h-12 text-lg"
              onClick={() => navigate("/assistants")}
            >
              View Existing Bots
              <ArrowRightOutlined className="ml-2" />
            </Button>
            <Button
              type="primary"
              size="large"
              className="bg-blue-500 text-white hover:bg-blue-400 border-none px-8 h-12 text-lg"
              onClick={() => navigate("/create-prompt")}
            >
              Create New Bot
              <ArrowRightOutlined className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <p className="text-gray-400">
                Created by ABAOXOMTIEU, we're revolutionizing AI chatbot development with advanced features and powerful capabilities.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: contact@example.com</li>
                <li className="text-gray-400">GitHub: github.com/abaoxomtieu</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <TeamOutlined className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <StarOutlined className="text-xl" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 ABAOXOMTIEU. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 