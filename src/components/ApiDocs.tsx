import React from 'react';
import { Modal, Typography, Divider, Space, Tag, Alert } from 'antd';
import { CodeOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface ApiDocsProps {
  isVisible: boolean;
  onClose: () => void;
  botId: string;
}

const ApiDocs: React.FC<ApiDocsProps> = ({ isVisible, onClose, botId }) => {
  const apiUrl = `${window.location.origin}/ai/rag_agent_template/stream`;
  const exampleCode = `// Example using fetch
const response = await fetch('${apiUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: {
      role: "user",
      content: "Your message here"
    },
    bot_id: "${botId}",
    conversation_id: "optional_conversation_id",
    model_name: "gemini-2.5-flash-preview-05-20" // or "gemini-2.0-flash"
  })
});

// Handle streaming response
const reader = response.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const text = new TextDecoder().decode(value);
  const lines = text.split("\\n").filter(Boolean);
  
  for (const line of lines) {
    const data = JSON.parse(line);
    if (data.type === "message") {
      // Handle streaming message
      console.log(data.content);
    } else if (data.type === "final") {
      // Handle final response
      console.log(data.content.final_response);
    }
  }
}`;

  return (
    <Modal
      title={
        <Space>
          <CodeOutlined />
          <span>API Integration Guide</span>
        </Space>
      }
      open={isVisible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Typography>
        <Alert
          message="API Integration"
          description="Use this API to integrate our chatbot into your website or application."
          type="info"
          showIcon
          className="mb-4"
        />

        <Title level={4}>API Endpoint</Title>
        <Paragraph>
          <Text code>{apiUrl}</Text>
        </Paragraph>

        <Title level={4}>Request Method</Title>
        <Paragraph>POST</Paragraph>

        <Title level={4}>Headers</Title>
        <Paragraph>
          <Text code>Content-Type: application/json</Text>
        </Paragraph>

        <Title level={4}>Request Body</Title>
        <Paragraph>
          <pre className="bg-gray-50 p-4 rounded-lg">
            {JSON.stringify({
              query: {
                role: "user",
                content: "Your message here"
              },
              bot_id: botId,
              conversation_id: "optional_conversation_id",
              model_name: "gemini-2.5-flash-preview-05-20"
            }, null, 2)}
          </pre>
        </Paragraph>

        <Title level={4}>Parameters</Title>
        <Space direction="vertical" className="w-full">
          <div>
            <Tag color="blue">query</Tag>
            <Text> The user's message with role and content</Text>
          </div>
          <div>
            <Tag color="blue">bot_id</Tag>
            <Text> Your chatbot's unique identifier</Text>
          </div>
          <div>
            <Tag color="blue">conversation_id</Tag>
            <Text> Optional: For maintaining conversation context</Text>
          </div>
          <div>
            <Tag color="blue">model_name</Tag>
            <Text> Choose between "gemini-2.5-flash-preview-05-20" or "gemini-2.0-flash"</Text>
          </div>
        </Space>

        <Divider />

        <Title level={4}>Response Format</Title>
        <Paragraph>
          The API uses Server-Sent Events (SSE) for streaming responses. Each response is a JSON object with the following structure:
        </Paragraph>
        <pre className="bg-gray-50 p-4 rounded-lg">
          {JSON.stringify({
            type: "message",
            content: "Streaming message content..."
          }, null, 2)}
        </pre>
        <Paragraph>
          Final response format:
        </Paragraph>
        <pre className="bg-gray-50 p-4 rounded-lg">
          {JSON.stringify({
            type: "final",
            content: {
              final_response: "Complete response message",
              selected_ids: [],
              selected_documents: []
            }
          }, null, 2)}
        </pre>

        <Divider />

        <Title level={4}>Example Implementation</Title>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
          {exampleCode}
        </pre>

        <Alert
          message="Note"
          description="Make sure to handle errors appropriately and implement proper error handling in your integration."
          type="warning"
          showIcon
          className="mt-4"
        />
      </Typography>
    </Modal>
  );
};

export default ApiDocs; 