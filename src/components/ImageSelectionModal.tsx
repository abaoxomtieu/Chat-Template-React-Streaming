import React from 'react';
import { Modal, List, Card, Image } from 'antd';

interface ImageSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  availableImages: Array<{
    id: string;
    url: string;
    content: string;
  }>;
  onImageSelect: (url: string) => void;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
  isVisible,
  onClose,
  availableImages,
  onImageSelect,
}) => {
  return (
    <Modal
      title="Select an Image to Chat About"
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={700}
      className="rounded-xl"
    >
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={availableImages}
        renderItem={(image) => (
          <List.Item>
            <Card
              hoverable
              className="border border-gray-100 rounded-xl overflow-hidden"
              cover={
                <div className="h-48 overflow-hidden">
                  <Image
                    alt="Travel destination"
                    src={image.url}
                    className="w-full h-full object-cover"
                  />
                </div>
              }
              onClick={() => onImageSelect(image.url)}
            >
              <Card.Meta
                title={`Image ${image.id.substring(0, 8)}...`}
                description={image.content.substring(0, 100) + "..."}
              />
            </Card>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default ImageSelectionModal; 