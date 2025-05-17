import React from "react";
import { Card, Typography, List, Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

interface RecommendationContainerProps {
  title: string;
  recommendations: string[];
  onRecommendationClick: (recommendation: string) => void;
}

/**
 * A component that displays travel guide recommendations and example queries
 * for the RAG Agent.
 */
const RecommendationContainer: React.FC<RecommendationContainerProps> = ({
  title,
  recommendations,
  onRecommendationClick,
}) => {
  return (
    <Card className="mb-4 border border-purple-100 shadow-sm">
      <Title level={5} className="mb-3 text-purple-700">
        {title}
      </Title>
      <List
        size="small"
        dataSource={recommendations}
        renderItem={(item) => (
          <List.Item className="px-0 py-1">
            <div className="w-full">
              <Paragraph className="mb-1 text-gray-700">{item}</Paragraph>
              <Button
                type="link"
                size="small"
                className="p-0 text-purple-600 hover:text-purple-800"
                onClick={() => onRecommendationClick(item)}
                icon={<ArrowRightOutlined />}
              >
                Ask this
              </Button>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

/**
 * Predefined travel guide recommendations for the RAG Agent
 */
export const travelGuideRecommendations = [
  "Bạn là ai vậy",
  "Search vectorstore 'Cách giải quyết vấn đề'",
  "Mô tả khả năng của bạn",
];

export default RecommendationContainer;
