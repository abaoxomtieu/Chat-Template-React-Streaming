export interface DocumentMetadata {
  type?: string;
  bot_id?: string;
  public_url?: string;
  [key: string]: any;
}

export interface Document {
  id: string;
  metadata: DocumentMetadata;
  page_content: string;
  type: string;
}

export interface AddDocumentRequest {
  documents: {
    page_content: string;
    metadata: DocumentMetadata;
  }[];
  ids: string[];
} 