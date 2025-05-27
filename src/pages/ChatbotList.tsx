import React, { useState, useEffect } from "react";
import { Card, Button, Input, Skeleton, message, Modal, BackTop } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  MessageOutlined,
  LeftOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchChatbots, deleteChatbot, Chatbot } from "../services/chatbotService";

const { Search } = Input;

const ChatbotList: React.FC = () => {
  const { t } = useTranslation();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [chatbotToDelete, setChatbotToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChatbots = async () => {
      try {
        setLoading(true);
        const data = await fetchChatbots();
        setChatbots(data);
      } catch (error) {
        message.error(t("chatbotList.loadError"));
        console.error("Error loading chatbots:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChatbots();
  }, [t]);

  const filteredChatbots = chatbots.filter((bot) =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleCreateChatbot = () => {
    navigate("/create-prompt")
  };

  const handleChatbotClick = (botId: string) => {
    navigate(`/rag-agent?botId=${botId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, botId: string) => {
    e.stopPropagation(); // Prevent card click event
    setChatbotToDelete(botId);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chatbotToDelete) return;

    try {
      await deleteChatbot(chatbotToDelete);
      message.success(t("chatbotList.deleteSuccess"));
      setChatbots(chatbots.filter(bot => bot.id !== chatbotToDelete));
    } catch (error) {
      message.error(t("chatbotList.deleteError"));
      console.error("Error deleting chatbot:", error);
    } finally {
      setDeleteModalVisible(false);
      setChatbotToDelete(null);
    }
  };

  const renderSkeletonCards = () => {
    return Array(6)
      .fill(null)
      .map((_, index) => (
        <Card
          key={index}
          className="h-full transform hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Skeleton.Avatar active size={48} shape="circle" />
            </div>
            <div className="flex-1">
              <Skeleton.Input active size="large" block className="mb-2" />
              <Skeleton paragraph={{ rows: 2 }} active className="mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton.Button active size="small" />
                <Skeleton.Button active size="small" />
              </div>
            </div>
          </div>
        </Card>
      ));
  };

  const renderEmptyState = () => {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <RobotOutlined className="text-6xl text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {t("chatbotList.noChatbots")}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {t("chatbotList.createFirst")}
        </p>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreateChatbot}
          className="bg-blue-600 hover:bg-blue-700 border-none"
        >
          {t("chatbotList.createNew")}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-blue-600"
          >
            {t("common.back")}
          </Button>
        </div>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {t("chatbotList.title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("chatbotList.description")}
          </p>
        </div>

        {/* Search and Create Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <Search
            placeholder={t("chatbotList.search")}
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            className="w-full md:w-96"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateChatbot}
            className="bg-blue-600 hover:bg-blue-700 border-none whitespace-nowrap"
          >
            {t("chatbotList.createNew")}
          </Button>
        </div>

        {/* Chatbots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            renderSkeletonCards()
          ) : filteredChatbots.length > 0 ? (
            filteredChatbots.map((bot) => (
              <Card
                key={bot.id}
                hoverable
                className="h-full transform hover:scale-105 transition-all duration-300"
                onClick={() => handleChatbotClick(bot.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                      <RobotOutlined className="text-2xl text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {bot.name}
                      </h3>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => handleDeleteClick(e, bot.id)}
                        className="hover:bg-red-50"
                      />
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {bot.prompt || t("chatbotList.noDescription")}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <ThunderboltOutlined />
                        <span>{t("chatbotList.features.aiPowered")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageOutlined />
                        <span>{t("chatbotList.features.chatEnabled")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full">{renderEmptyState()}</div>
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      <BackTop>
        <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowUpOutlined className="text-gray-600" />
        </div>
      </BackTop>

      <Modal
        title={t("chatbotList.deleteTitle")}
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setChatbotToDelete(null);
        }}
        okText={t("common.delete")}
        okButtonProps={{ danger: true }}
        cancelText={t("common.cancel")}
      >
        <p>{t("chatbotList.deleteConfirm")}</p>
      </Modal>
    </div>
  );
};

export default ChatbotList;
