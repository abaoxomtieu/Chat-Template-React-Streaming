import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function ImageExplainer() {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [domain, setDomain] = useState('Môn Toán');
  const [topic, setTopic] = useState('Toán Tích Phân và Giải thích');
  const [question, setQuestion] = useState('Giải thích cách giải');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('domain', domain);
      formData.append('topic', topic);
      formData.append('question', question);

      const response = await axios.post('http://localhost:8000/image-explainer/explain', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResult(response.data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 inline-block">Image Explainer</h1>
        <p className="mt-3 text-gray-600">Upload an image and get AI-powered explanations</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
        <div className="text-sm font-medium text-gray-500 mb-4">Fill in the details below to analyze your image</div>
        <div className="space-y-4">
          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700 font-medium">Select Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-600
                  hover:file:bg-purple-100 hover:file:text-purple-700
                  transition-all duration-150"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Domain</span>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm
                  focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50
                  hover:border-purple-300 transition-colors duration-150"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Topic</span>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm
                  focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50
                  hover:border-purple-300 transition-colors duration-150"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Question</span>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm
                  focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50
                  hover:border-purple-300 transition-colors duration-150"
              />
            </label>
          </div>

          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !image}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-150 transform hover:scale-[1.02]
              ${loading || !image 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
              }`}
          >
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-xl border border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="h-6 w-6 mr-2 text-purple-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Analysis Result
          </h2>
          <div className="prose prose-purple prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
