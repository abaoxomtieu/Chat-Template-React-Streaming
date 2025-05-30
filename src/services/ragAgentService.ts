import axios from "axios";
import { ApiDomain } from "../constants";

// RAG Agent payload that matches the backend RagAgentBody
export interface RagAgentPayload {
  query: {
    role: string;
    content:
      | string
      | Array<{
          type: string;
          text?: string;
          source_type?: string;
          url?: string;
        }>;
  };
  bot_id?: string; // Optional bot ID to specify which chatbot to use
  prompt?: string; // Optional prompt to override the bot's default prompt
  conversation_id?: string; // Optional conversation ID for thread management
  model_name?: string; // Optional model name for backend selection
}

// Response structure for RAG Agent
export interface RagAgentResponse {
  final_response: string;
  selected_ids: number[];
  selected_documents: any[];
}

// Stream response types for RAG Agent
export interface RagStreamResponse {
  type: "message" | "error" | "final";
  content:
    | string
    | {
        final_response: string;
        selected_ids: number[];
        selected_documents: any[];
      };
}

// API URLs
const BASE_API_URL = `${ApiDomain}/ai`;
const RAG_AGENT_URL = `${BASE_API_URL}/rag_agent_template`;
const RAG_AGENT_STREAM_URL = `${BASE_API_URL}/rag_agent_template/stream`;

// Function to send messages to the RAG agent endpoint (traditional API)
export const sendRagAgentMessage = async (
  payload: RagAgentPayload
): Promise<RagAgentResponse> => {
  try {
    const response = await axios.post(RAG_AGENT_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });
    console.log("RAG agent response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending RAG agent message:", error);
    throw error;
  }
};

// Function to send messages to the streaming RAG agent endpoint
export const sendStreamingRagAgentMessage = async (
  payload: RagAgentPayload,
  onMessage: (message: string) => void,
  onFinal: (data: any) => void,
  onError: (error: string) => void,
  abortSignal?: AbortSignal
) => {
  try {
    const response = await fetch(RAG_AGENT_STREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No reader available");
    }

    let buffer = "";
    while (true) {
      if (abortSignal?.aborted) {
        console.log("Request aborted, stopping stream reading");
        reader.cancel();
        return;
      }

      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data: RagStreamResponse = JSON.parse(line);
            
            if (abortSignal?.aborted) {
              console.log("Request aborted, stopping message processing");
              return;
            }
            
            switch (data.type) {
              case "message":
                onMessage(data.content as string);
                break;
              case "final":
                onFinal(data.content);
                break;
              case "error":
                onError(data.content as string);
                break;
            }
          } catch (e) {
            console.error("Error parsing stream data:", e);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log("Request was aborted");
      return;
    }
    
    console.error("Error in streaming RAG agent:", error);
    onError(error instanceof Error ? error.message : "Unknown error");
  }
};
