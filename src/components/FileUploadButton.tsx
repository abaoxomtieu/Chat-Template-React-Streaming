import React, { useState, useRef } from "react";
import {
  Button,
  message,
  Modal,
  Statistic,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  FileImageOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { ApiDomain } from "../constants";

const { Text, Title } = Typography;

interface FileAnalysisResult {
  bot_id: string;
  file_path: string;
  word_count: number;
  image_count: number;
  file_type: string;
}

interface FileIngressResult {
  bot_id: string;
  file_path: string;
  chunks_count: number;
  success: boolean;
  message: string;
}

interface FileUploadButtonProps {
  botId: string;
  onUploadSuccess?: (result: FileIngressResult) => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  botId,
  onUploadSuccess,
}) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isIngressing, setIsIngressing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] =
    useState<FileAnalysisResult | null>(null);
  const [ingressResult, setIngressResult] = useState<FileIngressResult | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check if file is PDF or DOCX
    if (
      !file.name.toLowerCase().endsWith(".pdf") &&
      !file.name.toLowerCase().endsWith(".docx")
    ) {
      message.error("Only PDF and DOCX files are supported");
      return;
    }
    
    // Check file size (50MB limit)
    const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSizeInBytes) {
      message.error(`File size exceeds 50MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    setSelectedFile(file);
    setIsModalVisible(true);

    // Automatically analyze the file
    await analyzeFile(file);
  };

  const analyzeFile = async (file: File) => {
    if (!botId) {
      message.error("Bot ID is required");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bot_id", botId);

      const response = await axios.post(`${ApiDomain}/file/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;
      setAnalysisResult(result);
      
      // Check if image count exceeds 100
      if (result.image_count > 100) {
        message.error("Files with more than 100 images cannot be uploaded. Please reduce the number of images.");
      }
    } catch (error) {
      console.error("Error analyzing file:", error);
      message.error("Failed to analyze file. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ingressFile = async () => {
    if (!selectedFile || !botId) {
      message.error("File and Bot ID are required");
      return;
    }
    
    // Check if image count exceeds 100
    if (analysisResult && analysisResult.image_count > 100) {
      message.error("Files with more than 100 images cannot be uploaded. Please reduce the number of images.");
      return;
    }
    
    // Double-check file size (50MB limit)
    const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSizeInBytes) {
      message.error(`File size exceeds 50MB limit. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    setIsIngressing(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("bot_id", botId);

      const response = await axios.post(`${ApiDomain}/file/ingress`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIngressResult(response.data);

      if (response.data.success) {
        message.success("File uploaded and processed successfully!");
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      } else {
        message.error("File processing failed.");
      }
    } catch (error) {
      console.error("Error ingressing file:", error);
      message.error("Failed to process file. Please try again.");
    } finally {
      setIsIngressing(false);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setAnalysisResult(null);
    setIngressResult(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Button
        icon={<UploadOutlined />}
        onClick={handleButtonClick}
        size="small"
      >
        Upload File
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".pdf,.docx"
      />

      <Modal
        title="File Analysis"
        open={isModalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={isIngressing}
            onClick={ingressFile}
            disabled={!analysisResult || (analysisResult && analysisResult.image_count > 100)}
          >
            Upload & Process
          </Button>,
        ]}
        width={600}
      >
        {selectedFile && (
          <div className="mb-4">
            <Text strong>Selected File: </Text>
            <Text>{selectedFile.name}</Text>
          </div>
        )}

        {isAnalyzing ? (
          <div className="text-center py-8">
            <Text>Analyzing file...</Text>
          </div>
        ) : analysisResult ? (
          <div>
            <Title level={4}>Analysis Results</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Word Count"
                  value={analysisResult.word_count}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Image Count"
                  value={analysisResult.image_count}
                  prefix={<FileImageOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic title="File Type" value={analysisResult.file_type} />
              </Col>
            </Row>

            <Divider />

            <Text type="secondary">
              This file will be processed with chunk size 1000 and overlap 200.
              Click "Upload & Process" to add this content to the chatbot.
            </Text>
          </div>
        ) : null}

        {ingressResult && (
          <div className="mt-4">
            <Divider />
            <Title level={4}>Processing Results</Title>
            <Row>
              <Col span={24}>
                <Statistic
                  title="Chunks Created"
                  value={ingressResult.chunks_count}
                  prefix={<DatabaseOutlined />}
                  valueStyle={{
                    color: ingressResult.success ? "#3f8600" : "#cf1322",
                  }}
                />
              </Col>
            </Row>
            <div className="mt-2">
              <Text strong>Status: </Text>
              <Text type={ingressResult.success ? "success" : "danger"}>
                {ingressResult.message}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default FileUploadButton;
