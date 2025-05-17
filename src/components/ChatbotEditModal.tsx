import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Divider,
  Space,
  Checkbox,
  Tooltip,
  message,
} from "antd";
import {
  QuestionCircleOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { 
  updateChatbot, 
  Chatbot, 
  ChatbotUpdateRequest 
} from "../services/chatbotService";

const { TextArea } = Input;

interface ChatbotEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  chatbot: Chatbot | null;
  onSuccess: (updatedChatbot: Chatbot) => void;
}

const ChatbotEditModal: React.FC<ChatbotEditModalProps> = ({
  isVisible,
  onClose,
  chatbot,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  useEffect(() => {
    if (chatbot && isVisible) {
      // Extract tool names from the tools array
      const toolNames = chatbot.tools?.map((tool: any) => tool.name) || [];
      setSelectedTools(toolNames);
      
      form.setFieldsValue({
        name: chatbot.name,
        prompt: chatbot.prompt,
      });
    }
  }, [chatbot, isVisible, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
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

      if (chatbot?.id) {
        const updatedChatbot = await updateChatbot(chatbot.id, updateData);
        message.success("Chatbot updated successfully");
        onSuccess(updatedChatbot);
        onClose();
      }
    } catch (error) {
      console.error("Failed to update chatbot:", error);
      message.error("Failed to update chatbot");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Edit Chatbot"
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={saving}
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          Save Changes
        </Button>,
      ]}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
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
      </Form>
    </Modal>
  );
};

export default ChatbotEditModal;
