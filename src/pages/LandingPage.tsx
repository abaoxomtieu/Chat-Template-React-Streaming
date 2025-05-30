import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { PlusOutlined, FacebookOutlined, InstagramOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";

// AI Combat arena styles
const combatStyles = `
  @keyframes combat-glow {
    0%, 100% { 
      box-shadow: 
        0 0 20px rgba(255, 215, 0, 0.3),
        0 0 40px rgba(255, 69, 0, 0.2),
        0 0 60px rgba(139, 0, 255, 0.1);
    }
    50% { 
      box-shadow: 
        0 0 30px rgba(255, 215, 0, 0.5),
        0 0 60px rgba(255, 69, 0, 0.3),
        0 0 90px rgba(139, 0, 255, 0.2);
    }
  }
  
  @keyframes shake-combat {
    0%, 100% { transform: translateX(0) scale(1); }
    25% { transform: translateX(-2px) scale(1.02); }
    75% { transform: translateX(2px) scale(1.02); }
  }
  
  .combat-btn {
    animation: combat-glow 2s ease-in-out infinite;
  }
  
  .combat-btn:hover {
    animation: shake-combat 0.5s ease-in-out infinite;
  }
`;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Inject combat styles
  React.useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = combatStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="/src/assets/logo.png" 
                alt="ABAOXOMTIEU Logo" 
                className="h-12 w-12 rounded-full object-cover shadow-lg hover:scale-105 transition-transform duration-300"
              />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300">
                ABAOXOMTIEU
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.facebook.com/hotonbao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                >
                  <FacebookOutlined className="text-2xl" />
                </a>
                <a 
                  href="https://www.instagram.com/abaoxomtieu/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-800 transition-colors duration-300"
                >
                  <InstagramOutlined className="text-2xl" />
                </a>
                <a 
                  href="mailto:htbqn2003@gmail.com"
                  className="text-red-600 hover:text-red-800 transition-colors duration-300"
                >
                  <MailOutlined className="text-2xl" />
                </a>
                <a 
                  href="tel:0949800149"
                  className="text-green-600 hover:text-green-800 transition-colors duration-300"
                >
                  <PhoneOutlined className="text-2xl" />
                </a>
              </div>
              <LanguageSwitcher />
              <Button
                type="primary"
                onClick={() => navigate("/assistants")}
                className="bg-blue-600 hover:bg-blue-700 border-none"
              >
                {t("landing.getStarted")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t("landing.title")}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t("landing.description")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/assistants")}
              className="bg-blue-600 hover:bg-blue-700 border-none"
            >
              {t("landing.getStarted")}
            </Button>
            <Button
              type="default"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate("/create-prompt")}
              className="text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700"
            >
              {t("landing.createAssistant")}
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/ai-combat")}
              className="combat-btn text-white font-bold border-2 border-yellow-400 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all duration-300"
              style={{
                background: "linear-gradient(45deg, #ffd700, #ff4500, #8b00ff, #ffd700)",
                backgroundSize: "400% 400%",
                animation: "combat-glow 2s ease-in-out infinite",
              }}
            >
              ⚔️ {t("landing.aiCombat.enterArena")} 🏟️
            </Button>
          </div>
        </div>
      </div>

      {/* AI Combat Arena Section */}
      <div
        className="py-20 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 30% 70%, rgba(255, 69, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, 
              #0c0c0c 0%, 
              #1a1a2e 25%, 
              #16213e 75%, 
              #533483 100%
            )`,
        }}
      >
        {/* Floating combat elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-4xl animate-pulse">
            ⚔️
          </div>
          <div className="absolute top-20 right-20 text-3xl animate-bounce">
            🛡️
          </div>
          <div className="absolute bottom-20 left-20 text-4xl animate-pulse delay-500">
            ⚡
          </div>
          <div className="absolute bottom-10 right-10 text-5xl animate-spin">
            🏆
          </div>
          <div className="absolute top-1/2 left-5 text-2xl animate-pulse delay-700">
            🔥
          </div>
          <div className="absolute top-1/3 right-5 text-2xl animate-bounce delay-1000">
            💥
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-4 animate-pulse">
              ⚔️ {t("landing.aiCombat.title")} ⚔️
            </h2>
            <div className="text-3xl mb-6 animate-bounce">🏟️</div>
            <p className="text-xl text-yellow-300 font-semibold mb-4 max-w-4xl mx-auto">
              {t("landing.aiCombat.description")}
            </p>
            <p className="text-lg text-cyan-300 mb-8 max-w-3xl mx-auto">
              {t("landing.aiCombat.subtitle")}
            </p>

            <div className="flex justify-center items-center gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-2 animate-bounce">🤖</div>
                <p className="text-cyan-400 font-bold">{t("landing.aiCombat.leftFighter")}</p>
              </div>
              <div className="text-6xl font-bold text-yellow-400 animate-pulse">
                VS
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2 animate-bounce delay-300">🤖</div>
                <p className="text-red-400 font-bold">{t("landing.aiCombat.rightFighter")}</p>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/ai-combat")}
              className="combat-btn text-white font-bold border-2 border-yellow-400 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all duration-300"
              style={{
                background: "linear-gradient(45deg, #ffd700, #ff4500, #8b00ff, #ffd700)",
                backgroundSize: "400% 400%",
                animation: "combat-glow 2s ease-in-out infinite",
              }}
            >
              ⚔️ {t("landing.aiCombat.enterArena")} 🏟️
            </Button>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-cyan-400/30">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold text-cyan-300 mb-2">
                  {t("landing.aiCombat.features.chooseChampions")}
                </h3>
                <p className="text-gray-300 text-sm">
                  {t("landing.aiCombat.features.chooseChampionsDesc")}
                </p>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-red-400/30">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-lg font-bold text-red-300 mb-2">
                  {t("landing.aiCombat.features.realTimeCombat")}
                </h3>
                <p className="text-gray-300 text-sm">
                  {t("landing.aiCombat.features.realTimeCombatDesc")}
                </p>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-yellow-400/30">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="text-lg font-bold text-yellow-300 mb-2">
                  {t("landing.aiCombat.features.epicBattles")}
                </h3>
                <p className="text-gray-300 text-sm">
                  {t("landing.aiCombat.features.epicBattlesDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t("landing.features.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t("landing.features.customChatbot")}
              </h3>
              <p className="text-gray-600">
                {t("landing.features.customChatbotDesc")}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t("landing.features.ragProcessing")}
              </h3>
              <p className="text-gray-600">
                {t("landing.features.ragProcessingDesc")}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t("landing.features.multipleModels")}
              </h3>
              <p className="text-gray-600">
                {t("landing.features.multipleModelsDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t("landing.capabilities.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t("landing.capabilities.documentProcessing")}
              </h3>
              <p className="text-gray-600">
                {t("landing.capabilities.documentProcessingDesc")}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t("landing.capabilities.streamingResponses")}
              </h3>
              <p className="text-gray-600">
                {t("landing.capabilities.streamingResponsesDesc")}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t("landing.capabilities.intelligentPrompting")}
              </h3>
              <p className="text-gray-600">
                {t("landing.capabilities.intelligentPromptingDesc")}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t("landing.capabilities.vectorStorage")}
              </h3>
              <p className="text-gray-600">
                {t("landing.capabilities.vectorStorageDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {t("landing.testimonials.title")}
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            {t("landing.testimonials.subtitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-600 mb-4">
                "ABAOXOMTIEU has transformed how we handle customer support. The AI
                chatbot is incredibly efficient and accurate."
              </p>
              <p className="font-semibold text-gray-900">John Doe</p>
              <p className="text-gray-500">AI Developer</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-600 mb-4">
                "The RAG capabilities are impressive. Our team can now process
                documents much faster and more accurately."
              </p>
              <p className="font-semibold text-gray-900">Jane Smith</p>
              <p className="text-gray-500">Tech Lead</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-600 mb-4">
                "The multiple model support gives us flexibility to choose the
                best AI for our specific needs."
              </p>
              <p className="font-semibold text-gray-900">Mike Johnson</p>
              <p className="text-gray-500">Product Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Roboki
              </h3>
              <p className="text-gray-600">
                Building the future of AI-powered conversations
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500">
              © 2025 ABAOXOMTIEU. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
