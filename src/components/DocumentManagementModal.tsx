import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Tag,
  Collapse,
} from "antd";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import { Document } from "../types/document";
import { documentService } from "../services/documentService";
import { useTranslation } from "react-i18next";

const { Panel } = Collapse;

interface DocumentManagementModalProps {
  isVisible: boolean;
  onClose: () => void;
  botId: string;
}

const DocumentManagementModal: React.FC<DocumentManagementModalProps> = ({
  isVisible,
  onClose,
  botId,
}) => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [form] = Form.useForm();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getDocuments(botId);
      setDocuments(data);
    } catch (error) {
      message.error(t("document.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchDocuments();
    }
  }, [isVisible, botId]);

  const handleAdd = async (values: any) => {
    try {
      const metadata = {
        type: values.type || "text",
        bot_id: botId,
        public_url: values.public_url || "",
        ...values.customMetadata,
      };

      const newDocument = {
        documents: [
          {
            id: crypto.randomUUID(),
            type: values.type || "text",
            page_content: values.content,
            metadata,
          },
        ],
        ids: [crypto.randomUUID()],
      };

      await documentService.addDocuments(newDocument);
      message.success(t("document.success"));
      setIsModalVisible(false);
      form.resetFields();
      fetchDocuments();
    } catch (error) {
      message.error(t("document.createError"));
    }
  };

  const handleEdit = async (values: any) => {
    if (!editingDocument) return;

    try {
      const metadata = {
        type: values.type || "text",
        bot_id: botId,
        public_url: values.public_url || "",
        ...values.customMetadata,
      };

      await documentService.updateDocument(
        editingDocument.id,
        values.content,
        metadata
      );
      message.success(t("document.success"));
      setIsModalVisible(false);
      setEditingDocument(null);
      form.resetFields();
      fetchDocuments();
    } catch (error) {
      message.error(t("document.updateError"));
    }
  };

  const showEditModal = (document: Document) => {
    setEditingDocument(document);
    const { type, bot_id, public_url, ...customMetadata } = document.metadata;

    form.setFieldsValue({
      content: document.page_content,
      type,
      bot_id,
      public_url,
      customMetadata,
    });
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingDocument(null);
    form.resetFields();
  };

  const handleDelete = async (ids: string[]) => {
    try {
      await documentService.deleteDocuments(ids);
      message.success(t("document.success"));
      setDocuments(prev => prev.filter(doc => !ids.includes(doc.id)));
      setSelectedIds([]);
    } catch (error) {
      message.error(t("document.deleteError"));
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 280,
    },
    {
      title: t("document.type"),
      dataIndex: ["metadata", "type"],
      key: "type",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "image" ? "blue" : "green"}>{type}</Tag>
      ),
    },
    {
      title: t("document.content"),
      dataIndex: "page_content",
      key: "content",
      ellipsis: true,
      render: (content: string) => (
        <div
          style={{
            maxWidth: 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {content}
        </div>
      ),
    },
    {
      title: t("document.actions"),
      key: "actions",
      width: 120,
      render: (_: any, record: Document) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title={t("document.deleteConfirm")}
            onConfirm={() => handleDelete([record.id])}
            okText={t("common.yes")}
            cancelText={t("common.no")}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={t("document.title")}
      open={isVisible}
      onCancel={onClose}
      width={1200}
      footer={null}
    >
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              {t("document.add")}
            </Button>
            {selectedIds.length > 0 && (
              <Popconfirm
                title={t("document.deleteSelectedConfirm")}
                onConfirm={() => handleDelete(selectedIds)}
                okText={t("common.yes")}
                cancelText={t("common.no")}
              >
                <Button danger icon={<DeleteOutlined />}>
                  {t("document.deleteSelected")}
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={documents}
          loading={loading}
          rowKey="id"
          rowSelection={{
            type: "checkbox",
            onChange: (selectedRowKeys) =>
              setSelectedIds(selectedRowKeys as string[]),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t("document.total", { total }),
          }}
        />

        <Modal
          title={editingDocument ? t("document.edit") : t("document.add")}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            onFinish={editingDocument ? handleEdit : handleAdd}
            layout="vertical"
          >
            <Form.Item
              name="content"
              label={t("document.content")}
              rules={[{ required: true, message: t("document.contentRequired") }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Collapse defaultActiveKey={["1"]}>
              <Panel header={t("document.metadata")} key="1">
                <Form.Item
                  name="type"
                  label={t("document.type")}
                  initialValue="text"
                >
                  <Input />
                </Form.Item>

                <Form.Item name="public_url" label={t("document.publicUrl")}>
                  <Input />
                </Form.Item>
              </Panel>
            </Collapse>

            <Form.Item className="mt-4">
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingDocument ? t("common.save") : t("common.create")}
                </Button>
                <Button onClick={handleModalClose}>{t("common.cancel")}</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Modal>
  );
};

export default DocumentManagementModal; 