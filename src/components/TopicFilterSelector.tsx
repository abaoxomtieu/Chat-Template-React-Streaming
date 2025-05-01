import React, { useState } from 'react';
import { Select, InputNumber, Input } from 'antd';

const { Option } = Select;

interface TopicFilterSelectorProps {
  onTopicChange: (topic: string) => void;
  onFilterChange: (filter: { session_number: number; lesson_id: string }) => void;
}

const TopicFilterSelector: React.FC<TopicFilterSelectorProps> = ({
  onTopicChange,
  onFilterChange,
}) => {
  const [selectedTopic, setSelectedTopic] = useState('education');
  const [sessionNumber, setSessionNumber] = useState(1);
  const [lessonId, setLessonId] = useState('L01');

  const handleTopicChange = (value: string) => {
    setSelectedTopic(value);
    onTopicChange(value);
  };

  const handleSessionNumberChange = (value: number | null) => {
    if (value !== null) {
      setSessionNumber(value);
      onFilterChange({ session_number: value, lesson_id: lessonId });
    }
  };

  const handleLessonIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLessonId(value);
    onFilterChange({ session_number: sessionNumber, lesson_id: value });
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-4">
        <span className="font-medium">Topic:</span>
        <Select
          value={selectedTopic}
          onChange={handleTopicChange}
          style={{ width: 200 }}
        >
          <Option value="education">Education</Option>
          <Option value="math">Mathematics</Option>
          <Option value="science">Science</Option>
          <Option value="history">History</Option>
          <Option value="language">Language</Option>
        </Select>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="font-medium">Session Number:</span>
        <InputNumber
          min={1}
          max={100}
          value={sessionNumber}
          onChange={handleSessionNumberChange}
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="font-medium">Lesson ID:</span>
        <Input
          value={lessonId}
          onChange={handleLessonIdChange}
          style={{ width: 100 }}
          placeholder="e.g., L01"
        />
      </div>
    </div>
  );
};

export default TopicFilterSelector; 