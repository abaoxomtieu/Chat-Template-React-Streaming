import axios from "axios";
import { ApiDomain } from "../constants";

// API URLs
const BASE_API_URL = `${ApiDomain}/ai`;
const CHATBOTS_URL = `${BASE_API_URL}/chatbots`;

// Chatbot interface
export interface Chatbot {
  id: string;
  name: string;
  prompt: string;
  tools: any[];
  created_at?: string;
  updated_at?: string;
}

// Update request structure for chatbot
export interface ChatbotUpdateRequest {
  name?: string;
  prompt?: string;
  tools?: any[];
}

// Response structure for chatbot list
export interface ChatbotListResponse {
  chatbots: Chatbot[];
}

/**
 * Fetch all available chatbots
 */
export const fetchChatbots = async (): Promise<Chatbot[]> => {
  try {
    const response = await axios.get<ChatbotListResponse>(CHATBOTS_URL);
    return response.data.chatbots;
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    throw error;
  }
};

/**
 * Fetch details of a specific chatbot by ID
 * @param id The ID of the chatbot to fetch
 */
export const fetchChatbotDetail = async (id: string): Promise<Chatbot> => {
  try {
    const response = await axios.get<Chatbot>(`${CHATBOTS_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching chatbot with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update a chatbot's properties
 * @param id The ID of the chatbot to update
 * @param updateData The data to update (name, prompt, tools)
 */
export const updateChatbot = async (id: string, updateData: ChatbotUpdateRequest): Promise<Chatbot> => {
  try {
    const response = await axios.put<Chatbot>(`${CHATBOTS_URL}/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating chatbot with ID ${id}:`, error);
    throw error;
  }
};

export const deleteChatbot = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_API_URL}/chatbots/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete chatbot');
    }
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    throw error;
  }
};
