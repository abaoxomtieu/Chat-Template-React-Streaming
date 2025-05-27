import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ABAOXOMTIEU</h1>
            </div>
            <div className="flex items-center gap-4">
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
          <div className="flex justify-center gap-4">
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
              onClick={() => navigate("/assistants")}
              className="text-blue-600 hover:text-blue-700"
            >
              {t("landing.startJourney")}
            </Button>
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
                "Roboki has transformed how we handle customer support. The AI
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
              © 2024 Roboki. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
