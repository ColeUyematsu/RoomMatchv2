"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<null | boolean>(null); 

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] text-gray-900">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#D9D9D9] text-gray-900 text-center p-6">
      {/* Logo */}
      <div className="mb-8">
        <Image 
          src="/logo.png"  
          alt="RoomMatch Logo"
          width={300}  
          height={300}  
          priority
        />
      </div>

      {/* Hero Section */}
      <h1 className="text-4xl font-extrabold mb-4">Welcome to RoomMatch</h1>
      <p className="text-lg max-w-xl">
        {isLoggedIn
          ? "Start by filling out the questionnaire and explore your best roommate matches!"
          : "Find the perfect roommate with AI-driven matching. Answer a few questions and let us do the rest!"}
      </p>

      {/* Buttons */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {isLoggedIn ? (
          <>
            <button
              className="bg-white text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-300 transition"
              onClick={() => router.push("/profile")}
            >
              Edit your Profile
            </button>
            <button
              className="bg-white text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-300 transition"
              onClick={() => router.push("/questionnaire")}
            >
              Fill Out Questionnaire
            </button>
            <button
              className="bg-white text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-300 transition"
              onClick={() => router.push("/matches")}
            >
              View Your Matches
            </button>
          </>
        ) : (
          <>
            <button
              className="bg-white text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-300 transition"
              onClick={() => router.push("/about")}
            >
              About
            </button>
            <button
              className="bg-white text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-300 transition"
              onClick={() => router.push("/login")}
            >
              Login
            </button>
            <button
              className="bg-white text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-300 transition"
              onClick={() => router.push("/register")}
            >
              Register
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-sm opacity-80">
        &copy; {new Date().getFullYear()} RoomMatch. All Rights Reserved.
      </footer>
    </div>
  );
}