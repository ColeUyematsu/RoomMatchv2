"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setHydrated(true); // Ensures client-side rendering
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No token found, skipping profile fetch.");
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/user-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200 && response.data.profile_picture) {
          setProfilePicture(`http://127.0.0.1:8000${response.data.profile_picture}`);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error("Token may be expired. Logging out user.");
          logout();
          router.push("/login");
        }
      }
    }

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, logout, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!hydrated) return null; // Prevents hydration mismatch

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div>
        <a href="/" className="text-xl font-bold">RoomMatch</a>
      </div>
      <div className="space-x-4 flex items-center">
        {isAuthenticated ? (
          <>
            <a href="/questionnaire">Questionnaire</a>
            <a href="/matches">Matches</a>
            {isAdmin && <a href="/admin">Admin Panel</a>}
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)} className="focus:outline-none">
                <img
                  src={profilePicture || "/default-avatar.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-gray-300"
                />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 shadow-md rounded-md p-3">
                  <a href="/profile" className="block py-2 px-3 hover:bg-gray-200">Edit Profile</a>
                  <button onClick={handleLogout} className="w-full text-left py-2 px-3 hover:bg-gray-200">Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </>
        )}
      </div>
    </nav>
  );
}