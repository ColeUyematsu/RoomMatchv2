"use client";

import { useState, useEffect } from "react";

export default function AdminPanel() {
    const [message, setMessage] = useState("");
    const [matches, setMatches] = useState<{ user1: string, user2: string }[]>([]);
    const [unmatchedUsers, setUnmatchedUsers] = useState<string[]>([]);
    const [matchedUsers, setMatchedUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("http://127.0.0.1:8000/admin/user-status", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setUnmatchedUsers(data.unmatched_users);
                setMatchedUsers(data.matched_users);
                fetchMatches(); // Fetch matches after users are updated
            } else {
                setMessage(`Error: ${data.detail}`);
            }
        } catch (error) {
            setMessage("Server error. Could not load users.");
        }
    };

    const fetchMatches = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("http://127.0.0.1:8000/matches", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setMatches(data.matches);
            }
        } catch (error) {
            setMessage("Server error. Could not load matches.");
        }
    };

    const handleMatchUsers = async () => {
        setLoading(true);
        setMessage("");
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("http://127.0.0.1:8000/admin/match-users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setMatches(data.matches);
                setMessage(" Matching successful!");
                fetchUsers(); // Fetch users and update the match table
            } else {
                setMessage(`⚠️ Error: ${data.detail}`);
            }
        } catch (error) {
            setMessage("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage and match users efficiently</p>

            <div className="mt-6 w-full max-w-lg flex flex-col items-center">
                <button 
                    onClick={handleMatchUsers} 
                    className={`w-full max-w-xs py-3 px-6 text-white font-bold text-lg rounded-lg shadow-md transition-all ${
                        loading 
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={loading}
                >
                    {loading ? "⏳ Matching..." : "Match Users"}
                </button>
                {message && <p className="mt-3 text-sm font-semibold text-gray-700">{message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full max-w-4xl">
                {/* Unmatched Users */}
                <div className="bg-white shadow-lg rounded-lg p-5">
                    <h3 className="text-xl font-bold text-gray-800">
                        Unmatched Users ({unmatchedUsers.length})
                    </h3>
                    <div className="mt-4 space-y-2">
                        {unmatchedUsers.length > 0 ? (
                            unmatchedUsers.map((user, index) => (
                                <div key={index} className="p-3 bg-gray-200 rounded-md text-center font-medium">
                                    {user}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">No unmatched users</p>
                        )}
                    </div>
                </div>

                {/* Matched Users */}
                <div className="bg-white shadow-lg rounded-lg p-5">
                    <h3 className="text-xl font-bold text-gray-800">
                        Matched Users ({matchedUsers.length})
                    </h3>
                    <div className="mt-4 space-y-2">
                        {matchedUsers.length > 0 ? (
                            matchedUsers.map((user, index) => (
                                <div key={index} className="p-3 bg-green-200 rounded-md text-center font-medium">
                                    {user}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">No matched users</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Matched Pairs */}
            {matches.length > 0 && (
                <div className="bg-white shadow-lg rounded-lg p-6 mt-8 w-full max-w-lg">
                    <h3 className="text-xl font-bold text-gray-800 text-center">Matched Pairs</h3>
                    <div className="mt-4 space-y-4">
                        {matches.map((match, index) => (
                            <div 
                                key={index} 
                                className="flex justify-between items-center p-3 bg-gray-200 rounded-md font-medium"
                            >
                                <span>{match.user1}</span>
                                <span className="text-xl">↔</span>
                                <span>{match.user2}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}