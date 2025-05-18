import { ApiDomain } from "../constants";
import { ChatMessage } from './chatService';

// Base URL for the multi-agent API
const BASE_API_URL = `${ApiDomain}/ai`;
const MULTI_AGENT_API_URL = `${BASE_API_URL}/multi_agent`;
const MULTI_AGENT_STREAM_URL = `${BASE_API_URL}/multi_agent/stream`;

// Type for the payload sent to the multi-agent API
export interface MultiAgentChatPayload {
  query: string;
  history: ChatMessage[];
  session_id?: string;
  system_prompt?: string;
}

// Type for the response from the multi-agent API
export interface MultiAgentResponse {
  bot_message?: string;
  session_id?: string;
  updated_system_prompt?: string;
  collected_data?: Array<{ source: string; content: string }>;
  analysis_results?: string;
}

// Stream response types
export interface MultiAgentStreamResponse {
  type: "message" | "error" | "final" | "collecting" | "analyzing";
  content: string | MultiAgentResponse;
}

/**
 * Sends a message to the multi-agent API
 * @param payload The payload to send to the API
 * @returns The response from the API
 */
export const sendMultiAgentChatMessage = async (
  payload: MultiAgentChatPayload
): Promise<MultiAgentResponse> => {
  try {
    const response = await fetch(MULTI_AGENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message to multi-agent API:', error);
    throw error;
  }
};

/**
 * Sends a message to the multi-agent streaming API
 * @param payload The payload to send to the API
 * @param onMessage Callback for when a message chunk is received
 * @param onFinal Callback for when the complete response is received
 * @param onError Callback for when an error occurs
 */
export const sendStreamingMultiAgentChatMessage = async (
  payload: MultiAgentChatPayload,
  onMessage: (message: string) => void,
  onFinal: (data: MultiAgentResponse) => void,
  onError: (error: string) => void
) => {
  let eventSource: EventSource | null = null;
  
  try {
    // Try using GET method first with URL parameters
    const url = new URL(MULTI_AGENT_STREAM_URL, window.location.origin);
    url.searchParams.append('query', payload.query);
    if (payload.session_id) {
      url.searchParams.append('session_id', payload.session_id);
    }
    
    // For debugging
    console.log("Connecting to SSE stream at:", url.toString());
    
    // Initial message to show progress
    onMessage("Connecting to multi-agent system...");
    
    // Create EventSource
    eventSource = new EventSource(url.toString());
    
    // If connection fails after 3 seconds, try POST method
    const connectionTimeout = setTimeout(async () => {
      if (eventSource && eventSource.readyState !== EventSource.OPEN) {
        console.log("GET method not working, trying POST method");
        
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        
        try {
          // Make a POST request to the streaming endpoint
          const response = await fetch(MULTI_AGENT_STREAM_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          // Handle the response using ReadableStream
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('ReadableStream not supported');
          }
          
          const decoder = new TextDecoder();
          
          // Process the stream
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log("Stream complete");
              break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            console.log("Received chunk:", chunk);
            
            // Process the chunk (basic SSE parsing)
            const lines = chunk.split('\n\n');
            
            for (const line of lines) {
              if (!line.trim() || !line.startsWith('data:')) continue;
              
              try {
                const data = JSON.parse(line.substring(5).trim());
                
                if (data.type === 'message' || data.type === 'collecting' || data.type === 'analyzing') {
                  onMessage(data.content);
                } else if (data.type === 'final') {
                  onFinal(data.content);
                  return; // End the processing
                } else if (data.type === 'error') {
                  onError(data.content);
                  return; // End the processing
                }
              } catch (error) {
                console.error("Error parsing SSE data:", error);
              }
            }
          }
          
        } catch (error) {
          console.error("Error in POST fallback:", error);
          onError("Failed to connect using POST method");
        }
      }
    }, 3000);
    
    // Set up normal EventSource handling
    eventSource.onopen = (event) => {
      console.log("SSE connection opened", event);
      clearTimeout(connectionTimeout);
      onMessage("Processing your request...");
    };
    
    eventSource.onmessage = (event) => {
      try {
        console.log("SSE event received:", event);
        
        if (!event.data) {
          console.log("Empty event data received, ignoring");
          return;
        }
        
        // Parse the data
        const data = JSON.parse(event.data);
        console.log("Parsed data:", data);
        
        if (data.type === 'message' || data.type === 'collecting' || data.type === 'analyzing') {
          onMessage(data.content);
        } else if (data.type === 'final') {
          onFinal(data.content);
          if (eventSource) {
            eventSource.close();
          }
        } else if (data.type === 'error') {
          onError(data.content);
          if (eventSource) {
            eventSource.close();
          }
        }
      } catch (error) {
        console.error("Error parsing SSE event:", error, event);
        onError("Error processing server response");
        if (eventSource) {
          eventSource.close();
        }
      }
    };
    
    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      clearTimeout(connectionTimeout);
      
      if (eventSource?.readyState === EventSource.CLOSED) {
        onError("Connection closed unexpectedly");
      }
      
      if (eventSource) {
        eventSource.close();
      }
    };
    
    // Return a cleanup function
    return () => {
      console.log("Cleanup function called, closing SSE connection");
      clearTimeout(connectionTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  } catch (error) {
    console.error('Error in streaming chat:', error);
    onError(error instanceof Error ? error.message : 'Unknown error');
    if (eventSource) {
      eventSource.close();
    }
  }
}; 