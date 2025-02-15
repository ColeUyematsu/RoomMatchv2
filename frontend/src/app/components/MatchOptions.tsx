"use client";

import { useState } from "react";

export default function MatchOptions() {
    const [message, setMessage] = useState("");

    const handleRequestNewMatch = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("http://127.0.0.1:8000/request-new-match", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("You have requested a new match.");
            } else {
                setMessage(`⚠️ Error: ${data.detail}`);
            }
        } catch (error) {
            setMessage("Server error. Please try again.");
        }
    };

    return (
        <div className="match-options">
            <button onClick={handleRequestNewMatch} className="new-match-button">
                🔄 Request New Match
            </button>
            {message && <p className="message">{message}</p>}
        </div>
    );
}
