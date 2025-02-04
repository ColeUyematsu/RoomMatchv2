"use client";

import { useEffect, useState } from "react";

interface Message {
  sender: string;
  content: string;
}

export default function Chat({ userId, receiverId }: { userId: number; receiverId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/chat/${userId}/${receiverId}`);

    socket.onmessage = (event) => {
      setMessages((prev) => [...prev, { sender: "them", content: event.data }]);
    };

    socket.onclose = () => console.log("Chat closed");
    setWs(socket);

    return () => socket.close();
  }, [userId, receiverId]);

  const sendMessage = () => {
    if (ws && input.trim()) {
      ws.send(input);
      setMessages((prev) => [...prev, { sender: "me", content: input }]);
      setInput("");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-lg font-semibold">Chat</h2>
      <div className="h-60 overflow-y-auto border p-2 mt-2">
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === "me" ? "text-right text-blue-600" : "text-left text-gray-700"}>
            {msg.content}
          </p>
        ))}
      </div>
      <div className="flex mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
}