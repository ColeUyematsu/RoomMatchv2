"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext"; 
import { getMessages, sendMessage, getMatchProfile } from "@/app/utils/api";

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

interface MatchProfile {
  email: string;
  profile_picture?: string;
  hometown?: string;
  major?: string;
  interests?: string;
  prompts?: { prompt: string; response: string }[];
}

export default function ChatPage() {
  const router = useRouter();
  const { userId, matchId } = useParams();
  const { isAuthenticated } = useAuth();
  const loggedInUserId = localStorage.getItem("user_id") || "";

  const userIdStr: string = Array.isArray(userId) ? userId[0] : userId || "";
  const matchIdStr: string = Array.isArray(matchId) ? matchId[0] : matchId || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [matchProfile, setMatchProfile] = useState<MatchProfile | null>(null);

  useEffect(() => {
    if (!userIdStr || !matchIdStr) {
      console.error("userId or matchId is missing! Check routing.");
      return;
    }


    const fetchData = async () => {
      try {
        const profileData = await getMatchProfile(matchIdStr);
        setMatchProfile(profileData);

        const messageData = await getMessages(userIdStr, matchIdStr);
        setMessages(messageData);
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    fetchData();
  }, [userIdStr, matchIdStr]);

  const handleSend = async () => {
    if (!userIdStr || !matchIdStr) {
      console.error("Cannot send message: userId or matchId is undefined!");
      return;
    }

    if (newMessage.trim() === "") return;

    const sentMessage = {
      sender: userIdStr,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, sentMessage]); 

    await sendMessage(userIdStr, matchIdStr, newMessage);
    setNewMessage("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      {/* Match Profile Section */}
      {matchProfile && (
        <div className="mb-4 flex items-center gap-4 p-4 border rounded-lg shadow bg-gray-50">
          {matchProfile.profile_picture ? (
            <img
              src={`http://127.0.0.1:8000${matchProfile.profile_picture}`}
              alt="Profile"
              className="w-16 h-16 object-cover rounded-full"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full">
              No Image
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold">{matchProfile.email}</h2>
            <p className="text-gray-600">
              <strong>Major:</strong> {matchProfile.major || "Not provided"}
            </p>
            <p className="text-gray-600">
              <strong>Interests:</strong> {matchProfile.interests || "Not provided"}
            </p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-center mb-4">Chat with {matchProfile?.email || "Match"}</h1>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-100 flex flex-col">
        {messages.map((msg, index) => {
          const isSentByUser = loggedInUserId && msg.sender.toString() === loggedInUserId.toString();

          return (
            <div key={index} className={`mb-2 flex ${isSentByUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`p-3 rounded-lg max-w-xs break-words ${
                  isSentByUser
                    ? "bg-blue-500 text-white text-right" // Sent messages (Blue, right)
                    : "bg-gray-300 text-black text-left" // Received messages (Gray, left)
                }`}
              >
                {msg.content}
                <p className="text-xs text-black-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Field */}
      <div className="flex mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-l-lg"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>

      <button onClick={() => router.push("/matches")} className="mt-4 text-blue-500">
        ← Back to Matches
      </button>
    </div>
  );
}