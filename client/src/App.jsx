import { useState, useEffect } from "react";
import "./App.css";

// Answer component that breaks text into bullet points
const AnswerList = ({ text }) => {
  if (!text) return null;

  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-*0-9.]+\s*/, "")); // remove bullet/numbering

  return (
    <div className="mt-6 p-6 bg-gray-800 border border-gray-700 rounded-lg w-full max-w-lg shadow-md">
      <h3 className="text-green-300 font-semibold mb-2">AI Doctor Suggestion:</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-200 text-sm">
        {lines.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
    </div>
  );
};

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchCount();
  }, []);

  const fetchCount = async () => {
    try {
      const res = await fetch("http://localhost:4000/count");
      const data = await res.json();
      setCount(data.count);
    } catch {
      console.error("Error fetching count");
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAnswer("🧠 Thinking...");
    try {
      const res = await fetch("http://localhost:4000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAnswer(data.answer);
      setCount(data.total);
    } catch {
      setAnswer("❌ Failed to get a response. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white font-sans">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-950 border-b border-gray-800 shadow">
        <h1 className="text-xl font-bold text-green-400">AI Doctor 🩺</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center px-4 py-10">
        <img
          src="https://tse2.mm.bing.net/th?id=OIP.UzLA2Chr50z7MD7WCxdqRgHaHa&pid=Api&P=0&h=180"
          alt="Doctor Logo"
          className="w-20 mb-4 rounded-full shadow-lg"
        />
        <p className="text-sm text-gray-400 mb-6">
          Total Patients Helped: <span className="text-green-300 font-semibold">{count}</span>
        </p>

        <textarea
          placeholder="Describe your symptoms or ask a health-related question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full max-w-lg h-32 p-4 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white resize-none"
        />

        <button
          onClick={handleAsk}
          className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-full shadow-md transition-all duration-200"
        >
          Ask Doctor
        </button>

        {answer && <AnswerList text={answer} />}
      </div>
    </div>
  );
}

export default App;
