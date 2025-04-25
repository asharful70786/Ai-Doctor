import React, { useState } from 'react';
import axios from 'axios';

function OTPLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);

  const sendOtp = async () => {
    try {
      await axios.post('http://localhost:4000/otp-login', { email }, { withCredentials: true });
      setStep(2);
      alert("OTP sent to email");
    } catch (err) {
      alert(err.response?.data?.error || "Error sending OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      await axios.post('http://localhost:4000/verify-otp-login', { email, otp }, { withCredentials: true });
      alert("Login successful");
      // redirect or update UI
    } catch (err) {
      alert(err.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-sm mx-auto">
      {step === 1 && (
        <>
          <input
            className="p-2 border rounded"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="bg-blue-500 text-white p-2 rounded" onClick={sendOtp}>
            Send OTP
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <input
            className="p-2 border rounded"
            placeholder="Enter the OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button className="bg-green-500 text-white p-2 rounded" onClick={verifyOtp}>
            Verify OTP & Login
          </button>
        </>
      )}
    </div>
  );
}

export default OTPLogin;
