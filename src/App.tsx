import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RagAgent from "./pages/RagAgent";
import ChatbotList from "./pages/ChatbotList";
import ChatbotEditor from "./pages/ChatbotEditor";
import CustomChatbot from "./pages/CustomChatbot";
import LandingPage from "./pages/LandingPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/assistants" element={<ChatbotList />} />
        <Route path="/rag-agent" element={<RagAgent />} />
        <Route path="/chatbot-editor/:botId" element={<ChatbotEditor />} />
        <Route path="/create-prompt" element={<CustomChatbot />} />
      </Routes>
    </Router>
  );
}

export default App;
