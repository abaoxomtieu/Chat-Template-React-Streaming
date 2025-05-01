import React, { useState, useEffect } from "react";

function EntranceEval() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Sample payload based on your data structure
  const [payload, setPayload] = useState({
    test_info: {
      subject: "Sử",
      level: "Cấp 2",
      total_questions: 20,
      duration: "60 minutes",
    },
    results: [
      {
        name: "Bài 1: Hiện thực lịch sử và nhận thức lịch sử",
        lesson_id: "L01",
        questions: [
          { correct: true, question: "Nhận thức lịch sử là gì?" },
          { correct: true, question: "Sử học là gì?" },
          {
            correct: true,
            question: "Đối tượng nghiên cứu của Sử học là",
          },
          { correct: true, question: "Các chức năng của Sử học bao gồm" },
          {
            correct: false,
            question: "Nội dung nào sau đây không phải là nhiệm vụ của Sử học?",
          },
          {
            correct: true,
            question:
              "Trong nghiên cứu lịch sử, các nhà sử học cần phải tuân thủ những nguyên tắc cơ bản nào?",
          },
          { correct: true, question: "Sử liệu là gì?" },
          {
            correct: true,
            question:
              "Căn cứ vào mối liên hệ với sự vật, hiện tượng được nghiên cứu và giá trị thông tin, sử liệu được chia thành những loại nào?",
          },
          {
            correct: false,
            question:
              "Căn cứ vào dạng thức tồn tại, sử liệu không bao gồm nhóm nào sau đây?",
          },
          {
            correct: true,
            question: "Rìu tay Núi Đọ (Thanh Hóa) thuộc loại hình sử liệu nào?",
          },
          {
            correct: true,
            question: "Hai phương pháp cơ bản trong nghiên cứu lịch sử là",
          },
          {
            correct: true,
            question:
              "Nội dung nào sau đây phản ánh điểm giống nhau giữa phương pháp lịch sử và phương pháp logic trong nghiên cứu lịch sử?",
          },
          {
            correct: false,
            question:
              "Hiện thực lịch sử có điểm gì khác biệt so với nhận thức lịch sử?",
          },
        ],
      },
      {
        name: "Bài 2: Tri thức lịch sử và cuộc sống",
        lesson_id: "L02",
        questions: [
          {
            correct: true,
            question:
              "Chọn cụm từ thích hợp điền vào chỗ trống để hoàn thành khái nhiệm sau: '…… là những hiểu biết của con người về các lĩnh vực liên quan đến lịch sử, hình thành qua quá trình học tập, khám phá, nghiên cứu và trải nghiệm'",
          },
          {
            correct: true,
            question:
              "Nội dung nào sau đây là một trong những vai trò của tri thức lịch sử?",
          },
          {
            correct: true,
            question:
              "Tri thức lịch sử được hình thành qua những quá trình nào sau đây?",
          },
          {
            correct: false,
            question:
              "Nội dung nào sau đây là một trong những ý nghĩa của tri thức lịch sử đối với con người?",
          },
          {
            correct: true,
            question:
              "Tri thức lịch sử không đem lại ý nghĩa nào sau đây đối với mỗi cá nhân và xã hội?",
          },
          {
            correct: false,
            question:
              "Những bài học kinh nghiệm trong lịch sử có giá trị như thế nào đối với cuộc sống hiện tại và tương lai của con người?",
          },
        ],
      },
    ],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle nested properties with dot notation (e.g., "test_info.subject")
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setPayload((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setPayload((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const sendApiRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      // Replace with your actual API endpoint
      const apiUrl = "https://api.example.com/submit-test";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authorization headers if needed
          // 'Authorization': 'Bearer your-token-here'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err.message || "Something went wrong with the API call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Test Submission</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              name="test_info.subject"
              value={payload.test_info.subject}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <input
              type="text"
              name="test_info.level"
              value={payload.test_info.level}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Questions
            </label>
            <input
              type="number"
              name="test_info.total_questions"
              value={payload.test_info.total_questions}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <input
              type="text"
              name="test_info.duration"
              value={payload.test_info.duration}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Language</label>
        <input
          type="text"
          name="language"
          value={payload.language}
          onChange={handleInputChange}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Payload Preview</h2>
          <button
            onClick={() => {
              const el = document.getElementById("payload-json");
              navigator.clipboard.writeText(el.innerText);
              alert("Payload copied to clipboard!");
            }}
            className="px-3 py-1 bg-gray-200 rounded text-sm"
          >
            Copy JSON
          </button>
        </div>
        <pre
          id="payload-json"
          className="bg-gray-100 p-4 rounded overflow-auto max-h-60"
        >
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>

      <button
        onClick={sendApiRequest}
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? "Sending..." : "Send API Request"}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">API Response:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default EntranceEval;
