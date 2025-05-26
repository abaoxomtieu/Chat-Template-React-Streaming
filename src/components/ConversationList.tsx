import React from 'react';
import { Button, Avatar } from 'antd';
import {
  MessageOutlined,
  DeleteOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

interface ConversationMeta {
  conversation_id: string;
  name: string;
  created_at: number;
}

interface ConversationListProps {
  conversations: ConversationMeta[];
  currentConversationId: string;
  isSidebarCollapsed: boolean;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onCreateConversation: () => void;
  onToggleSidebar: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversationId,
  isSidebarCollapsed,
  onSelectConversation,
  onDeleteConversation,
  onCreateConversation,
  onToggleSidebar,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!isSidebarCollapsed && (
          <span className="text-sm font-medium text-gray-700">
            Conversations
          </span>
        )}
        <Button
          type="text"
          icon={isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
          className="text-gray-600 hover:text-blue-600"
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {!isSidebarCollapsed && (
            <Button
              type="primary"
              onClick={onCreateConversation}
              size="small"
              className="w-full bg-blue-600 hover:bg-blue-700 border-none"
              icon={<PlusOutlined />}
            >
              New Conversation
            </Button>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.conversation_id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                currentConversationId === conv.conversation_id
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
              onClick={() => onSelectConversation(conv.conversation_id)}
            >
              <MessageOutlined className="text-lg" />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 text-sm font-medium truncate">
                    {conv.name}
                  </span>
                  <Button
                    type="text"
                    size="small"
                    danger
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.conversation_id);
                    }}
                    className="p-1 hover:bg-red-50"
                  >
                    <DeleteOutlined />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationList; 