import axios from "axios";
import { ApiDomain } from "../constants";

export const ttsService = {
  textToSpeech: async (text: string, provider: string = "huggingface") => {
    try {
      const endpoint = provider === "huggingface" ? "/tts/huggingface" : "/tts/gemini";
      const payload = provider === "huggingface" 
        ? { text }
        : { text, voice_name: "Kore" };

      const response = await axios.post(
        `${ApiDomain}${endpoint}`,
        payload,
        { responseType: "blob" }
      );

      const audioUrl = URL.createObjectURL(response.data);
      return audioUrl;
    } catch (error) {
      console.error("TTS Error:", error);
      throw error;
    }
  },
};
