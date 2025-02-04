"use client";

import { useEffect, useState } from "react";
import { getMatches } from "@/app/utils/api";
import { useRouter } from "next/navigation";

// ✅ Define the expected match type
interface Match {
    userId: number;  
    matchId: number; 
    match: string;   
    score: number;
    profile?: {
      profile_picture?: string;
      hometown?: string;
      major?: string;
      interests?: string;
      prompts?: { prompt: string; response: string }[];
    };
  }

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
  const fetchMatches = async () => {
    try {
      const data = await getMatches();
      console.log("🔍 API Matches Response:", data); // ✅ Debugging
      setMatches(data);
    } catch (error) {
      console.error("🚨 Error fetching matches:", error);
    }
  };

  fetchMatches();
}, []);
  const toggleMatch = (matchId: string) => {
    setExpandedMatch((prev) => (prev === matchId ? null : matchId));
  };

  const startChat = (matchId: number) => {
    const userId = localStorage.getItem("user_id"); // ✅ Retrieve stored userId
  
    if (!userId) {
      console.error("🚨 Error: userId is undefined! Fix API response.");
      return;
    }
  
    if (!matchId) {
      console.error("🚨 Error: matchId is undefined! Check match object.");
      return;
    }
  
    console.log(`Navigating to chat: /chat/${userId}/${matchId}`); // ✅ Debugging
    router.push(`/chat/${userId}/${matchId}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">Your Roommate Matches</h1>
      <p className="text-center text-gray-600 mb-6">
        Click on a match to collapse/expand their profile or start chatting.
      </p>

      {matches.length === 0 ? (
        <p className="text-center text-gray-600">No matches found yet.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match, index) => (
            <li
              key={index}
              className="p-4 border rounded-lg shadow cursor-pointer hover:bg-gray-100"
              onClick={() => toggleMatch(match.match)}
            >
              <div className="flex items-center justify-between">
                {/* Match Info */}
                <div className="flex items-center gap-4">

                  <div>
                    <p className="text-lg font-semibold">{match.match}</p>
                    <p className="text-gray-500">Similarity Score: {match.score.toFixed(2)}</p>
                  </div>
                </div>

                {/* Chat Button */}
                <button
                className="bg-gray-400 text-black font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-300 transition"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent collapsing when clicking chat
                    startChat(match.matchId); // ✅ Only pass match.userId, not userId
                }}
                >
                Chat
                </button>
              </div>

              {/* Profile Details - Visible by Default, Click to Collapse */}
              {expandedMatch === match.match && match.profile && (
                <div className="mt-4 flex items-center gap-4">
                  {/* Profile Picture Large */}
                  {match.profile.profile_picture ? (
                    <img
                      src={`http://127.0.0.1:8000${match.profile.profile_picture}`}
                      alt="Profile"
                      className="w-36 h-35 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-36 h-35 flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg">
                      No Image
                    </div>
                  )}

                  {/* Profile Details */}
                  <div className="flex-1">
                    <p><strong>Hometown:</strong> {match.profile.hometown || "Not provided"}</p>
                    <p><strong>Major:</strong> {match.profile.major || "Not provided"}</p>
                    <p><strong>Interests:</strong> {match.profile.interests || "Not provided"}</p>

                    {/* Prompts */}
                    {match.profile.prompts && match.profile.prompts.length > 0 ? (
                      <div className="mt-2">
                        <h3 className="font-semibold">Prompts:</h3>
                        {match.profile.prompts.map((p, i) => (
                          <p key={i} className="mt-1"><strong>{p.prompt}:</strong> {p.response}</p>
                        ))}
                      </div>
                    ) : (
                      <p>No prompts available</p>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}