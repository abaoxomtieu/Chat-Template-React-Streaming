import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Space,
  Divider,
  Alert,
  Checkbox,
  Tooltip,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, RobotOutlined, ToolOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  fetchChatbotDetail,
  updateChatbot,
  Chatbot,
  ChatbotUpdateRequest,
} from "../services/chatbotService";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ChatbotEditor: React.FC = () => {
  const { t } = useTranslation();
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  useEffect(() => {
    const fetchChatbot = async () => {
      if (!botId) {
        setError(t("chatbotEditor.noIdError"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchChatbotDetail(botId);
        setChatbot(data);
        // Handle tools as an array of strings
        const toolNames = Array.isArray(data.tools) ? data.tools : [];
        setSelectedTools(toolNames);
        
        form.setFieldsValue({
          name: data.name,
          prompt: data.prompt,
        });
      } catch (err) {
        console.error("Error fetching chatbot:", err);
        setError(t("chatbotEditor.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchChatbot();
  }, [botId, form, t]);

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);
      const updateData: ChatbotUpdateRequest = {
        name: values.name,
        prompt: values.prompt,
        tools: selectedTools,
      };

      if (botId) {
        const updatedChatbot = await updateChatbot(botId, updateData);
        setChatbot(updatedChatbot);
        message.success(t("chatbotEditor.updateSuccess"));
        navigate("/chatbots");
      }
    } catch (err) {
      console.error("Error updating chatbot:", err);
      message.error(t("chatbotEditor.updateError"));
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/chatbots");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert
          message={t("chatbotEditor.error")}
          description={error}
          type="error"
          showIcon
        />
        <Button
          type="primary"
          onClick={handleBack}
          className="mt-4"
        >
          {t("common.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="text-gray-600 hover:text-blue-600 mb-4"
          >
            {t("common.back")}
          </Button>
          <Title level={2} className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {t("chatbotEditor.title")}
          </Title>
          <Paragraph className="text-gray-600">
            {t("chatbotEditor.description")}
          </Paragraph>
        </div>

        <Card className="shadow-md border border-purple-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-full">
              <RobotOutlined className="text-white text-2xl" />
            </div>
            <div>
              <Title level={4} className="m-0">
                {chatbot?.name || t("chatbotEditor.defaultName")}
              </Title>
              <Paragraph className="text-gray-500 m-0">
                {t("chatbotEditor.id")}: {botId}
              </Paragraph>
            </div>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: chatbot?.name || "",
              prompt: chatbot?.prompt || "",
            }}
          >
            <Form.Item
              name="name"
              label={t("chatbotEditor.nameLabel")}
              rules={[{ required: true, message: t("chatbotEditor.nameRequired") }]}
            >
              <Input placeholder={t("chatbotEditor.namePlaceholder")} />
            </Form.Item>

            <Form.Item
              name="prompt"
              label={t("chatbotEditor.promptLabel")}
              rules={[{ required: true, message: t("chatbotEditor.promptRequired") }]}
              help={t("chatbotEditor.promptHelp")}
            >
              <TextArea
                placeholder={t("chatbotEditor.promptPlaceholder")}
                autoSize={{ minRows: 6, maxRows: 12 }}
                className="font-mono text-sm"
              />
            </Form.Item>

            <Divider>
              <Space>
                <ToolOutlined />
                <span>{t("chatbotEditor.toolsTitle")}</span>
              </Space>
            </Divider>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTools.includes("search")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTools([...selectedTools, "search"]);
                    } else {
                      setSelectedTools(selectedTools.filter(tool => tool !== "search"));
                    }
                  }}
                >
                  {t("chatbotEditor.searchTool")}
                </Checkbox>
                <Tooltip title={t("chatbotEditor.searchToolHelp")}>
                  <QuestionCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTools.includes("calculator")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTools([...selectedTools, "calculator"]);
                    } else {
                      setSelectedTools(selectedTools.filter(tool => tool !== "calculator"));
                    }
                  }}
                >
                  {t("chatbotEditor.calculatorTool")}
                </Checkbox>
                <Tooltip title={t("chatbotEditor.calculatorToolHelp")}>
                  <QuestionCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button onClick={handleBack}>
                {t("common.cancel")}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<SaveOutlined />}
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                {t("common.save")}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotEditor;
