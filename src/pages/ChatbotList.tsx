import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Avatar,
  Tag,
  Button,
  Skeleton,
  Typography,
  message,
} from "antd";
import {
  RobotOutlined,
  ArrowRightOutlined,
  ToolOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchChatbots, Chatbot } from "../services/chatbotService";

const { Title, Paragraph } = Typography;

const ChatbotList: React.FC = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChatbots = async () => {
      try {
        setLoading(true);
        const data = await fetchChatbots();
        setChatbots(data);
      } catch (error) {
        message.error("Failed to load chatbots");
        console.error("Error loading chatbots:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChatbots();
  }, []);

  const handleChatbotSelect = (chatbot: Chatbot) => {
    // Navigate to the RAG Agent page with the selected botId
    navigate(`/rag-agent?botId=${chatbot.id}`);
  };

  const handleEditChatbot = (chatbot: Chatbot, event: React.MouseEvent) => {
    // Prevent the card click from triggering
    event.stopPropagation();
    // Navigate to the chatbot editor page
    navigate(`/chatbot-editor/${chatbot.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <Title
              level={2}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Available Chatbots
            </Title>
            <div className="flex-1 flex justify-end">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/create-prompt")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                size="large"
              >
                Create New Chatbot
              </Button>
            </div>
          </div>
          <Paragraph className="text-gray-600 max-w-2xl mx-auto">
            Choose from our collection of specialized AI assistants designed to
            help with different tasks
          </Paragraph>
        </div>

        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 3,
            xl: 3,
            xxl: 3,
          }}
          dataSource={chatbots}
          loading={loading}
          renderItem={(chatbot) => (
            <List.Item>
              <Card
                hoverable
                className="h-full border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                style={{ width: '100%', height: 280 }}
                actions={[
                  <Button
                    icon={<EditOutlined />}
                    onClick={(e) => handleEditChatbot(chatbot, e)}
                  >
                    Edit
                  </Button>,
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={() => handleChatbotSelect(chatbot)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    Start Chat
                  </Button>,
                ]}
              >
                <Skeleton loading={loading} avatar active>
                  <Card.Meta
                    avatar={
                      <Avatar
                        size={64}
                        icon={<RobotOutlined />}
                        className="bg-gradient-to-r from-purple-500 to-indigo-500"
                      />
                    }
                    title={
                      <span className="text-lg font-medium">
                        {chatbot.name}
                      </span>
                    }
                    description={
                      <div className="h-32 overflow-hidden">
                        <Paragraph
                          ellipsis={{ rows: 3 }}
                          className="text-gray-600 mb-3"
                        >
                          {chatbot.prompt.substring(0, 150)}...
                        </Paragraph>
                        {chatbot.tools && chatbot.tools.length > 0 && (
                          <div className="mt-2">
                            <Tag icon={<ToolOutlined />} color="blue">
                              {chatbot.tools.length} Tools Available
                            </Tag>
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-400">
                          ID: {chatbot.id}
                        </div>
                      </div>
                    }
                  />
                </Skeleton>
              </Card>
            </List.Item>
          )}
        />

        {!loading && chatbots.length === 0 && (
          <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-purple-100">
            <RobotOutlined
              style={{ fontSize: 48 }}
              className="text-gray-300 mb-4"
            />
            <Title level={4} className="text-gray-500">
              No Chatbots Available
            </Title>
            <Paragraph className="text-gray-400">
              There are currently no chatbots configured in the system.
            </Paragraph>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotList;
