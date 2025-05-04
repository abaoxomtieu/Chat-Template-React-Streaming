import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import ImageExplainer from './pages/ImageExplainer';
import PromptEngineer from './pages/PromptEngineer';

  /**
   * The main App component. This component renders a `Router` with routes
   * to the `Chat` and `ImageExplainer` pages.
   *
   * This component is the entry point for the entire application.
   *
   * @remarks
   * This component is a functional component and does not have its own state.
   * All state is managed by the `Chat` and `ImageExplainer` components.
   *
   * @returns {JSX.Element} The rendered App component.
   */
function App() {
  return (
    <Router>
      {/* <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <nav className="bg-white shadow-lg border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    AI Assistant
                  </span>
                </div>
                <div className="ml-10 flex items-center space-x-4">
                  <Link 
                    to="/" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-150"
                  >
                    Chat
                  </Link>
                  <Link 
                    to="/image-explainer" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-150"
                  >
                    Image Explainer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav> */}

        {/* <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> */}
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/image-explainer" element={<ImageExplainer />} />
            <Route path="/prompt-engineer" element={<PromptEngineer />} />
          </Routes>
        {/* </main> */}
      {/* </div> */}
    </Router>
  );
}

export default App;
