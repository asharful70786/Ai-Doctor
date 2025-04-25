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
  const [auth, setAuth] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchCount();
    checkAuth();
  }, []);

  const fetchCount = async () => {
    try {
      const res = await fetch("http://localhost:4000/count", { credentials: "include" });
      const data = await res.json();
      setCount(data.count);
    } catch {
      console.error("Error fetching count");
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("http://localhost:4000/auth-check", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.auth) {
        setAuth(true);
        setEmail(data.email);
      } else {
        setAuth(false);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setAuth(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAnswer("🧠 Thinking...");
    try {
      const res = await fetch("http://localhost:4000/ask", {
        credentials: "include",
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
    const type = showSignup ? "register" : "login";
    try {
      const res = await fetch("http://localhost:4000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, type }),
      });
      if (res.ok) {
        setStep("otp");
      } else {
        alert("Failed to send OTP. Please check your email.");
      }
    } catch {
      alert("Server error during sending OTP");
    }
  };

  const verifyOtp = async () => {
    const type = showSignup ? "register" : "login";
    try {
      const res = await fetch("http://localhost:4000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp, password, type }),
      });
      if (res.ok) {
        setAuth(true);
        resetAuthForm();
      } else {
        alert("OTP verification failed");
      }
    } catch {
      alert("Server error during OTP verification");
    }
  };

  const resetAuthForm = () => {
    setShowSignup(false);
    setShowLogin(false);
    setStep("email");
    setEmail("");
    setOtp("");
    setPassword("");
  };

  const logout = async () => {
    await fetch("http://localhost:4000/logout", {
      credentials: "include",
    });
    setAuth(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white font-sans">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-950 border-b border-gray-800 shadow">
        <h1 className="text-xl font-bold text-green-400">AI Doctor 🩺</h1>
        {auth && (
          <button onClick={logout} className="text-sm bg-red-600 px-3 py-1 rounded">
            Logout
          </button>
        )}
      </div>

      {/* AUTH GATE */}
      {!auth ? (
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="text-center space-y-4">
            <h2 className="text-lg text-gray-300">Please login to access AI Doctor</h2>
            <button
              onClick={() => {
                setShowLogin(true);
                setShowSignup(false);
              }}
              className="bg-green-600 px-4 py-2 rounded text-sm font-medium"
            >
              Login with OTP
            </button>
            <button
              onClick={() => {
                setShowSignup(true);
                setShowLogin(false);
              }}
              className="bg-blue-600 px-4 py-2 rounded text-sm font-medium"
            >
              Signup with OTP
            </button>
          </div>
        </div>
      ) : (
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
      )}

      {/* Auth Modal */}
      {(showSignup || showLogin) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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

            {step === "email" && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full mb-3 p-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            )}

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
                  placeholder="Enter 4-digit OTP"
                  maxLength={4}
                  className="w-full mt-3 mb-3 p-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
                <button
                  onClick={verifyOtp}
                  className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded"
                >
                  Verify OTP
                </button>
              </>
            )}

            <button onClick={resetAuthForm} className="text-sm text-gray-400 mt-3">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
