import React from 'react';
import { Input, Switch, Button, Image } from 'antd';
import {
  SendOutlined,
  ThunderboltOutlined,
  PictureOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import FileUploadButton from './FileUploadButton';

const { TextArea } = Input;

interface ChatInputProps {
  input: string;
  loading: boolean;
  isStreaming: boolean;
  selectedImage: string | null;
  availableImages: any[];
  botId: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onStreamingToggle: () => void;
  onImageClear: () => void;
  onImageModalOpen: () => void;
  onUploadSuccess: (result: any) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  loading,
  isStreaming,
  selectedImage,
  availableImages,
  botId,
  onInputChange,
  onSend,
  onKeyPress,
  onStreamingToggle,
  onImageClear,
  onImageModalOpen,
  onUploadSuccess,
}) => {
  return (
    <div className="flex-none p-4 border-t border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={isStreaming}
              onChange={onStreamingToggle}
              size="small"
              className="bg-gray-200"
            />
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <ThunderboltOutlined />
              Streaming {isStreaming ? "On" : "Off"}
            </span>

            <FileUploadButton
              botId={botId}
              onUploadSuccess={onUploadSuccess}
            />
          </div>
          {availableImages.length > 0 && (
            <Button
              type="default"
              size="small"
              icon={<PictureOutlined />}
              onClick={onImageModalOpen}
              className="text-gray-600 hover:text-blue-600"
            >
              Select Image from Sources
            </Button>
          )}
        </div>

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="mb-3 relative">
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={selectedImage}
                alt="Selected image"
                className="max-h-[150px] w-auto mx-auto"
                preview={false}
              />
            </div>
            <Button
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              size="small"
              className="absolute top-1 right-1 bg-white/80 rounded-full hover:bg-red-50"
              onClick={onImageClear}
            />
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <TextArea
              placeholder={
                selectedImage
                  ? "Ask about this image..."
                  : "Ask me about travel destinations..."
              }
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyPress}
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 resize-none"
            />
          </div>
          <button
            onClick={onSend}
            disabled={loading || (!input.trim() && !selectedImage)}
            className={`p-3 rounded-full transition-all duration-200 ${
              loading || (!input.trim() && !selectedImage)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md"
            }`}
          >
            <SendOutlined className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput; 