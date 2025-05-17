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
import {
  fetchChatbotDetail,
  updateChatbot,
  Chatbot,
  ChatbotUpdateRequest,
} from "../services/chatbotService";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ChatbotEditor: React.FC = () => {
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
        setError("No chatbot ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchChatbotDetail(botId);
        setChatbot(data);
        // Extract tool names from the tools array
        const toolNames = data.tools?.map((tool: any) => tool.name) || [];
        setSelectedTools(toolNames);
        
        form.setFieldsValue({
          name: data.name,
          prompt: data.prompt,
        });
      } catch (err) {
        console.error("Error fetching chatbot:", err);
        setError("Failed to load chatbot details");
      } finally {
        setLoading(false);
      }
    };

    fetchChatbot();
  }, [botId, form]);

  const handleSubmit = async (values: any) => {
    if (!botId) return;

    try {
      setSaving(true);
      // Format the tools array based on selected tools
      const tools = selectedTools.map(toolName => ({
        name: toolName,
        type: "function"
      }));
      
      const updateData: ChatbotUpdateRequest = {
        name: values.name,
        prompt: values.prompt,
        tools: tools
      };

      await updateChatbot(botId, updateData);
      message.success("Chatbot updated successfully");
    } catch (err) {
      console.error("Error updating chatbot:", err);
      message.error("Failed to update chatbot");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={handleBack}>
              Back to List
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="mb-4"
          >
            Back to Chatbot List
          </Button>
          <Title level={2} className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Edit Chatbot
          </Title>
          <Paragraph className="text-gray-600">
            Customize your chatbot's name, prompt, and other settings.
          </Paragraph>
        </div>

        <Card className="shadow-md border border-purple-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-full">
              <RobotOutlined className="text-white text-2xl" />
            </div>
            <div>
              <Title level={4} className="m-0">
                {chatbot?.name || "Chatbot"}
              </Title>
              <Paragraph className="text-gray-500 m-0">
                ID: {botId}
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
              label="Chatbot Name"
              rules={[{ required: true, message: "Please enter a name" }]}
            >
              <Input placeholder="Enter chatbot name" />
            </Form.Item>

            <Form.Item
              name="prompt"
              label="System Prompt"
              rules={[{ required: true, message: "Please enter a prompt" }]}
              help="This is the system prompt that defines your chatbot's personality and capabilities."
            >
              <TextArea
                placeholder="Enter system prompt"
                autoSize={{ minRows: 6, maxRows: 12 }}
                className="font-mono text-sm"
              />
            </Form.Item>

            <Divider>
              <Space>
                <ToolOutlined />
                <span>Available Tools</span>
              </Space>
            </Divider>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="font-medium mr-2">Tools</span>
                <Tooltip title="Select tools that your chatbot can use to enhance its capabilities">
                  <QuestionCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedTools.includes("retrieve_document")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTools([...selectedTools, "retrieve_document"]);
                      } else {
                        setSelectedTools(selectedTools.filter(t => t !== "retrieve_document"));
                      }
                    }}
                  >
                    <span className="font-medium">Document Retrieval</span>
                  </Checkbox>
                  <div className="ml-6 text-sm text-gray-500">
                    Allows the chatbot to search and retrieve information from your document database
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedTools.includes("search_engine")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTools([...selectedTools, "search_engine"]);
                      } else {
                        setSelectedTools(selectedTools.filter(t => t !== "search_engine"));
                      }
                    }}
                  >
                    <span className="font-medium">Web Search</span>
                  </Checkbox>
                  <div className="ml-6 text-sm text-gray-500">
                    Allows the chatbot to search the web for current information
                  </div>
                </div>
              </div>
            </div>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  Save Changes
                </Button>
                <Button onClick={handleBack}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotEditor;
