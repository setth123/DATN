import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import authService from "../services/auth.service";
import candidateService from "../services/candidate.service";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = await authService.login(email, password);

      if (data.data.token) {
        // After successful login, attempt to fetch candidate data
        try {
          const candidateResponse = await candidateService.getMe();
          if (candidateResponse.data.data) {
            localStorage.setItem("candidate", JSON.stringify(candidateResponse.data.data));
          }
        } catch (candidateError) {
          console.warn("Could not fetch candidate data after login:", candidateError);
        }
        navigate("/");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("Google credential response:", credentialResponse);
      await authService.googleLogin(credentialResponse);
      // After successful Google login, attempt to fetch candidate data
      try {
        const candidateResponse = await candidateService.getMe();
        if (candidateResponse.data.data) {
          localStorage.setItem("candidate", JSON.stringify(candidateResponse.data.data));
        }
      } catch (candidateError) {
        console.warn("Could not fetch candidate data after Google login:", candidateError);
      }
      navigate("/");
    } catch (error) {
      setMessage("Google login failed");
    }
  };

  const handleGoogleFailure = () => {
    setMessage("Google login failed");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold">Sign In</h2>
        {message && <div className="mb-4 text-center text-red-500">{message}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="mb-2 block text-gray-400" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-gray-400" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-green-700"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-green-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
        <div className="mt-6 border-t border-gray-700 pt-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            useOneTap
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;