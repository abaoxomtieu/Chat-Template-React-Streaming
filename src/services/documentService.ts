import { Document } from "../types/document";
import { api } from "./api";

export const documentService = {
  async getDocuments(botId?: string): Promise<Document[]> {
    const response = await api.get("/vector-store/get-documents", {
      params: { bot_id: botId },
    });
    return response.data;
  },

  async addDocuments(data: { documents: Document[]; ids: string[] }): Promise<void> {
    await api.post("/vector-store/add-documents", data);
  },

  async updateDocument(id: string, content: string, metadata: any): Promise<void> {
    const document = {
      page_content: content,
      metadata,
    };
    await api.put(`/vector-store/update-document/${id}`, document);
  },

  async deleteDocuments(ids: string[]): Promise<void> {
    const queryString = ids.map(id => `ids=${id}`).join('&');
    await api.delete(`/vector-store/delete-documents?${queryString}`);
  },
}; 