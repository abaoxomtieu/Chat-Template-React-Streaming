import axios from "axios";
import { ApiDomain } from "../constants";

export interface ChatMessage {
  content: string;
  type: "human" | "ai";
}

// Base chat payload that matches the backend PrimaryChatBody
export interface PrimaryChatPayload {
  query: string;
  history: ChatMessage[];
  lesson_name?: string | null;
  subject_name?: string | null;
  class_number?: number | null;
}

// Legacy payload structure for other endpoints (keeping for backward compatibility)
export interface ChatPayload {
  history: ChatMessage[];
  language: string;
  query: string;
  topic: string;
  filter: null | {
    session_number: number;
    lesson_id: string;
  };
}

// API URLs
const BASE_API_URL = `${ApiDomain}/ai`;
const PRIMARY_CHAT_URL = `${BASE_API_URL}/primary_chat`;
const PRIMARY_CHAT_STREAM_URL = `${BASE_API_URL}/primary_chat/stream`;
const RAG_SPEED_URL = `${BASE_API_URL}/rag_speed`; // Legacy endpoint

// Stream response types
export interface StreamResponse {
  type: "message" | "error" | "final";
  content: string | {
    final_response: string;
    lesson_name?: string;
    subject_name?: string;
    class_number?: string;
  };
}

// Function to send messages to the primary chat endpoint (traditional API)
export const sendPrimaryChatMessage = async (
  payload: PrimaryChatPayload
): Promise<any> => {
  try {
    const response = await axios.post(PRIMARY_CHAT_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });
    console.log("Primary chat response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending primary chat message:", error);
    throw error;
  }
};

// Function to send messages to the streaming chat endpoint
export const sendStreamingChatMessage = async (
  payload: PrimaryChatPayload,
  onMessage: (message: string) => void,
  onFinal: (data: any) => void,
  onError: (error: string) => void
) => {
  try {
    const response = await fetch(PRIMARY_CHAT_STREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    let buffer = '';
    let jsonBuffer = '';
    let inJson = false;
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process each character to handle JSON objects without relying on delimiters
      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        
        if (!inJson && char === '{') {
          // Start of a new JSON object
          inJson = true;
          jsonBuffer = '{';
        } else if (inJson) {
          jsonBuffer += char;
          
          // Check if we have a complete JSON object
          if (char === '}') {
            try {
              // Try to parse the JSON to see if it's valid
              const data: StreamResponse = JSON.parse(jsonBuffer);
              console.log("Stream data:", data);
              
              switch (data.type) {
                case 'message':
                  onMessage(data.content as string);
                  break;
                case 'final':
                  onFinal(data.content);
                  break;
                case 'error':
                  onError(data.content as string);
                  break;
              }
              
              // Reset for the next JSON object
              inJson = false;
              jsonBuffer = '';
            } catch (e) {
              // If parsing fails, it might be an incomplete JSON object or malformed
              // Continue collecting more characters
              if (jsonBuffer.endsWith('}}')) {
                // This might be a nested object that's complete
                try {
                  const data: StreamResponse = JSON.parse(jsonBuffer);
                  console.log("Stream data (nested):", data);
                  
                  switch (data.type) {
                    case 'message':
                      onMessage(data.content as string);
                      break;
                    case 'final':
                      onFinal(data.content);
                      break;
                    case 'error':
                      onError(data.content as string);
                      break;
                  }
                  
                  // Reset for the next JSON object
                  inJson = false;
                  jsonBuffer = '';
                } catch (nestedError) {
                  // Still not a valid JSON, continue collecting
                }
              }
            }
          }
        }
      }
      
      // Clear the processed buffer
      buffer = '';
    }
  } catch (error) {
    console.error('Error in streaming chat:', error);
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
};

// Legacy function (keeping for backward compatibility)
export const sendChatMessage = async (
  payload: ChatPayload
): Promise<string> => {
  try {
    const response = await axios.post<string>(RAG_SPEED_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });
    console.log("Legacy chat response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};
