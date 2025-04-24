import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [count, setCount] = useState(0);
  const [auth, setAuth] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email"); // email → otp

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

  const sendOtp = async () => {
    const res = await fetch("http://localhost:4000/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) setStep("otp");
  };

  const verifyOtp = async (type) => {
    const res = await fetch(`http://localhost:4000/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, type }),
    });
    if (res.ok) {
      setAuth(true);
      setShowSignup(false);
      setShowLogin(false);
      setStep("email");
      setEmail("");
      setOtp("");
    }
  };

  const logout = async () => {
    await fetch("http://localhost:4000/logout");
    setAuth(false);
  };

  useEffect(() => {
    fetchCount();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white font-sans">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-950 border-b border-gray-800 shadow">
        <h1 className="text-xl font-bold text-green-400">AI Doctor 🩺</h1>
        <div className="space-x-3">
          {!auth ? (
            <>
              <button onClick={() => setShowLogin(true)} className="text-sm bg-green-600 px-3 py-1 rounded">Login</button>
              <button onClick={() => setShowSignup(true)} className="text-sm bg-blue-600 px-3 py-1 rounded">Signup</button>
            </>
          ) : (
            <button onClick={logout} className="text-sm bg-red-600 px-3 py-1 rounded">Logout</button>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-col items-center px-4 py-10">
        <img src="https://tse2.mm.bing.net/th?id=OIP.UzLA2Chr50z7MD7WCxdqRgHaHa&pid=Api&P=0&h=180" alt="Doctor Logo" className="w-20 mb-4 rounded-full shadow-lg" />
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

        {answer && (
          <div className="mt-6 p-6 bg-gray-800 border border-gray-700 rounded-lg w-full max-w-lg shadow-md">
            <p className="text-green-300">
              <strong>AI Doctor:</strong> {answer}
            </p>
          </div>
        )}
      </div>

      {/* Signup/Login Modal */}
      {(showSignup || showLogin) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{showSignup ? "Signup" : "Login"}</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full mb-3 p-2 bg-gray-800 border border-gray-700 rounded text-white"
              disabled={step === "otp"}
            />
            {step === "email" ? (
              <button onClick={sendOtp} className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded">
                Send OTP
              </button>
            ) : (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full mt-3 mb-3 p-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
                <button
                  onClick={() => verifyOtp(showSignup ? "register" : "login")}
                  className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded"
                >
                  Verify OTP
                </button>
              </>
            )}
            <button
              onClick={() => {
                setShowSignup(false);
                setShowLogin(false);
                setEmail("");
                setOtp("");
                setStep("email");
              }}
              className="text-sm text-gray-400 mt-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
