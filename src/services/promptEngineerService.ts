import { PrimaryChatPayload, StreamResponse } from "./chatService";

// API URLs
const BASE_API_URL = "http://0.0.0.0:8000/ai";
const PROMPT_ENGINEER_URL = `${BASE_API_URL}/prompt_engineer`;
const PROMPT_ENGINEER_STREAM_URL = `${BASE_API_URL}/prompt_engineer/stream`;

/**
 * Function to send messages to the prompt engineer streaming endpoint
 */
export const sendPromptEngineerMessage = async (
  payload: PrimaryChatPayload,
  onMessage: (message: string) => void,
  onFinal: (data: any) => void,
  onError: (error: string) => void
) => {
  try {
    const response = await fetch(PROMPT_ENGINEER_STREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      console.log("buffer", buffer);

      const lines = buffer.split("\n\n");
      console.log("lines", lines);

      buffer = lines.pop() || "";
      console.log("buffer", buffer);

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data: StreamResponse = JSON.parse(line);
            console.log("Stream data:", data);

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
    console.error("Error in streaming chat:", error);
    onError(error instanceof Error ? error.message : "Unknown error");
  }
};

/**
 * Function to send messages to the prompt engineer endpoint (traditional API)
 */
export const sendPromptEngineerNonStreamingMessage = async (
  payload: PrimaryChatPayload
): Promise<any> => {
  try {
    const response = await fetch(PROMPT_ENGINEER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Prompt engineer response:", data);
    return data;
  } catch (error) {
    console.error("Error sending prompt engineer message:", error);
    throw error;
  }
};
