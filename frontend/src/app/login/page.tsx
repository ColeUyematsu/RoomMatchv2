"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/utils/api";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth(); // Use Auth Context


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const loginData = await loginUser(email, password);
  
    if (loginData && loginData.access_token && loginData.user_id) {
      login(loginData.access_token, loginData.user_id); // Store userId in AuthContext
      setTimeout(() => {
        router.push("/matches"); // Redirect user after state updates
      }, 100); // Small delay ensures state is updated before rerendering
    } else {
      console.error("Login failed. Check API response.");
    }
  };

  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        className="border p-2 rounded w-64 mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 rounded w-64 mb-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white p-2 rounded w-64" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}