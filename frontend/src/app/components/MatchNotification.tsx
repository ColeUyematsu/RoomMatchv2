"use client";

import { useState, useEffect } from "react";

export default function MatchNotification() {
    const [notification, setNotification] = useState<string | null>(null);
    const [matchId, setMatchId] = useState<number | null>(null);

    useEffect(() => {
        const checkNotifications = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch("http://127.0.0.1:8000/match/notify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    setNotification(data.message);
                    setMatchId(data.match_id);
                }
            } catch (error) {
                console.error("Error checking notifications:", error);
            }
        };

        checkNotifications();
    }, []);

    return (
        notification ? (
            <div className="notification-box">
                <p>{notification}</p>
                <button className="accept-match">Keep Match</button>
                <button className="decline-match">Request New Match</button>
            </div>
        ) : null
    );
}
