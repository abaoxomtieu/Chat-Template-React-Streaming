import React from 'react';
import { Avatar, Skeleton, Collapse, List } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import ChatMessageAgent from './ChatMessageAgent';
import ReactMarkdown from 'react-markdown';
import RecommendationContainer, { travelGuideRecommendations } from './RecommendationContainer';

const { Panel } = Collapse;

interface StructuredMessage {
  role: string;
  content: string | Array<{
    type: string;
    text?: string;
    source_type?: string;
    url?: string;
  }>;
  type?: string;
  displayContent?: string;
}

interface ChatMessagesProps {
  messages: StructuredMessage[];
  streamingMessage: string;
  selectedDocuments: any[];
  loadingChatbot: boolean;
  chatbotDetails: any;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onRecommendationClick: (recommendation: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  streamingMessage,
  selectedDocuments,
  loadingChatbot,
  chatbotDetails,
  messagesEndRef,
  onRecommendationClick,
}) => {
  return (
    <div className="flex-1 overflow-y-auto py-4 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-10">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              {loadingChatbot ? (
                <Skeleton active avatar paragraph={{ rows: 3 }} />
              ) : (
                <>
                  <RobotOutlined className="text-4xl text-blue-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {chatbotDetails?.name || "AI Assistant"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {chatbotDetails?.prompt?.substring(0, 150) + "..." ||
                      "Ask me anything about travel destinations, plan your trips, or inquire about images of places."}
                  </p>
                </>
              )}
              <RecommendationContainer
                title="Example Questions"
                recommendations={travelGuideRecommendations}
                onRecommendationClick={onRecommendationClick}
              />
            </div>
          </div>
        ) : (
          messages.map((msg: StructuredMessage, index: number) => {
            const displayMessage = {
              role: msg.role,
              content:
                msg.displayContent ||
                (typeof msg.content === "string" ? msg.content : ""),
            };
            return <ChatMessageAgent key={index} message={displayMessage} />;
          })
        )}

        {/* Streaming Message */}
        {streamingMessage && (
          <div className="flex justify-center">
            <div className="bg-gray-50 rounded-2xl py-4 w-2/3 animate-pulse">
              <div className="max-w-4xl mx-auto flex gap-4 px-4">
                <Avatar
                  icon={<RobotOutlined />}
                  className="bg-blue-500 text-white"
                  size={32}
                />
                <div className="flex-1 text-gray-800 text-sm leading-relaxed">
                  <div className="w-full">
                    <ReactMarkdown
                      components={{
                        img: ({ node, src, alt, ...props }) => (
                          <img
                            src={src}
                            alt={alt || "Image"}
                            className="my-2 max-w-full rounded-md"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {streamingMessage}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Source Documents */}
        {selectedDocuments.length > 0 && (
          <div className="mt-4">
            <Collapse
              className="bg-white/80 border border-gray-100 rounded-xl overflow-hidden"
              expandIconPosition="end"
            >
              <Panel
                header={
                  <span className="text-gray-700 font-medium">
                    Source Documents ({selectedDocuments.length})
                  </span>
                }
                key="1"
              >
                <List
                  dataSource={selectedDocuments}
                  renderItem={(doc) => (
                    <List.Item>
                      <div className="w-full">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="text-sm text-gray-600 mb-1">
                              {doc.metadata?.content || doc.page_content}
                            </div>
                            {doc.metadata?.source && (
                              <div className="text-xs text-gray-400">
                                Source: {doc.metadata.source}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Panel>
            </Collapse>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages; 