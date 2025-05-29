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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  // Tools are stored as an array of strings
  useEffect(() => {
    if (chatbot && isVisible) {
      // Handle tools as an array of strings
      const toolNames = Array.isArray(chatbot.tools) ? chatbot.tools : [];
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
      
      // Use the selected tools array directly
      const tools = selectedTools;
      
      const updateData: ChatbotUpdateRequest = {
        name: values.name,
        prompt: values.prompt,
        tools: tools
      };

      if (chatbot?.id) {
        const updatedChatbot = await updateChatbot(chatbot.id, updateData);
        message.success(t("chatbotEditModal.updateSuccess"));
        onSuccess(updatedChatbot);
        onClose();
      }
    } catch (error) {
      console.error("Failed to update chatbot:", error);
      message.error(t("chatbotEditModal.updateError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={t("chatbotEditModal.title")}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t("chatbotEditModal.cancel")}
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={saving}
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          {t("chatbotEditModal.saveChanges")}
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
          label={t("chatbotEditModal.nameLabel")}
          rules={[{ required: true, message: t("chatbotEditModal.nameRequired") }]}
        >
          <Input placeholder={t("chatbotEditModal.namePlaceholder")} />
        </Form.Item>

        <Form.Item
          name="prompt"
          label={t("chatbotEditModal.promptLabel")}
          rules={[{ required: true, message: t("chatbotEditModal.promptRequired") }]}
          help={t("chatbotEditModal.promptHelp")}
        >
          <TextArea
            placeholder={t("chatbotEditModal.promptPlaceholder")}
            autoSize={{ minRows: 6, maxRows: 12 }}
            className="font-mono text-sm"
          />
        </Form.Item>

        <Divider>
          <Space>
            <ToolOutlined />
            <span>{t("chatbotEditModal.toolsTitle")}</span>
          </Space>
        </Divider>

        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="font-medium mr-2">{t("chatbotEditModal.toolsTitle")}</span>
            <Tooltip title={t("chatbotEditModal.toolsHelp")}>
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
                <span className="font-medium">{t("chatbotEditModal.documentRetrieval")}</span>
              </Checkbox>
              <div className="ml-6 text-sm text-gray-500">
                {t("chatbotEditModal.documentRetrievalHelp")}
              </div>
            </div>
            
            <div className="flex items-center">
              <Checkbox
                checked={selectedTools.includes("duckduckgo_search")}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTools([...selectedTools, "duckduckgo_search"]);
                  } else {
                    setSelectedTools(selectedTools.filter(t => t !== "duckduckgo_search"));
                  }
                }}
              >
                <span className="font-medium">{t("chatbotEditModal.duckDuckSearch")}</span>
              </Checkbox>
              <div className="ml-6 text-sm text-gray-500">
                {t("chatbotEditModal.duckDuckSearchHelp")}
              </div>
            </div>

            <div className="flex items-center">
              <Checkbox
                checked={selectedTools.includes("python_repl")}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTools([...selectedTools, "python_repl"]);
                  } else {
                    setSelectedTools(selectedTools.filter(t => t !== "python_repl"));
                  }
                }}
              >
                <span className="font-medium">{t("chatbotEditModal.pythonRepl")}</span>
              </Checkbox>
              <div className="ml-6 text-sm text-gray-500">
                {t("chatbotEditModal.pythonReplHelp")}
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default ChatbotEditModal;
