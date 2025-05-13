import axios from "axios";

export interface ChatMessage {
  content: string;
  type: "human" | "ai";
}

export interface AdaptiveChatPayload {
  query: string;
  session_id?: string;
  history?: ChatMessage[];
  current_system_prompt?: string;
  user_profile?: Record<string, any>;
}

export interface AdaptiveChatResponse {
  bot_message: string;
  updated_system_prompt?: string;
  session_id: string;
  probing_questions?: string[];
  user_profile_updates?: Record<string, any>;
}

export interface StreamResponse {
  type: "message" | "error" | "final";
  content: string | {
    bot_message?: string;
    updated_system_prompt?: string;
    session_id?: string;
    probing_questions?: string[];
    user_profile_updates?: Record<string, any>;
  };
}

// API URLs
const BASE_API_URL = "http://localhost:8000/adaptive-chat";
const ADAPTIVE_CHAT_URL = `${BASE_API_URL}/chat`;
const ADAPTIVE_CHAT_STREAM_URL = `${BASE_API_URL}/chat/stream`;

// Function to send messages to the adaptive chat endpoint (traditional API)
export const sendAdaptiveChatMessage = async (
  payload: AdaptiveChatPayload
): Promise<AdaptiveChatResponse> => {
  try {
    const response = await axios.post(ADAPTIVE_CHAT_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });
    console.log("Adaptive chat response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending adaptive chat message:", error);
    throw error;
  }
};

// Function to send messages to the streaming adaptive chat endpoint
export const sendStreamingAdaptiveChatMessage = async (
  payload: AdaptiveChatPayload,
  onMessage: (message: string) => void,
  onFinal: (data: any) => void,
  onError: (error: string) => void
) => {
  try {
    const response = await fetch(ADAPTIVE_CHAT_STREAM_URL, {
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
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data: StreamResponse = JSON.parse(line);
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
          } catch (e) {
            console.error('Error parsing stream data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in streaming chat:', error);
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
}; 