"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/utils/api";

const questions = [
  "How clean do you like your living space?",
  "How important is it for your roommate to be quiet at night?",
  "How often do you like to have guests over?",
  "Do you prefer studying in silence or with background noise?",
  "How early do you usually wake up?",
  "How late do you usually stay up?",
  "How do you feel about sharing food with your roommate?",
  "How often do you cook in your living space?",
  "How important is it for you to have similar political views as your roommate?",
  "How comfortable are you with sharing personal belongings with your roommate?",
  "How often do you play music or watch TV in shared spaces?",
  "How well do you tolerate noise when sleeping?",
  "How often do you drink alcohol at home?",
  "How important is it for your roommate to have similar religious views?",
  "How often do you exercise at home?",
  "Do you prefer a structured or flexible household routine?",
  "How do you handle conflicts with roommates?",
  "How often do you clean shared spaces?",
  "How open are you to spontaneous social activities?",
  "How comfortable are you discussing personal matters with your roommate?",
  "How much alone time do you need daily?",
  "How do you feel about pets in the living space?",
  "How much do you value having a quiet space to relax?",
  "How often do you study or work at home?",
  "How important is it to have similar lifestyle habits as your roommate?",
];

export default function QuestionnaireForm() {
  const router = useRouter();
  const [responses, setResponses] = useState<number[]>(Array(25).fill(4)); // Default to neutral (4)
  const [loading, setLoading] = useState(true);

  // Fetch stored responses when the component loads
  useEffect(() => {
    async function fetchUserResponses() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await api.get("/questionnaire/get-responses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setResponses(Object.values(response.data)); // Convert object to array
        }
      } catch (error) {
        console.error("Error fetching user responses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserResponses();
  }, []);

  const handleChange = (index: number, value: number) => {
    setResponses((prevResponses) => {
      const newResponses = [...prevResponses];
      newResponses[index] = value;
      return newResponses;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Please log in before submitting the questionnaire.");
        return;
      }

      if (responses.length !== 25) {
        alert("Please complete all 25 questions.");
        return;
      }

      // Convert responses into URLSearchParams
      const formData = new URLSearchParams();
      responses.forEach((value, index) => {
        formData.append(`question${index + 1}`, value.toString());
      });

      // Send request to update questionnaire responses
      await api.post("/questionnaire/submit-questionnaire", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Fetch the updated responses to ensure frontend state is correct
      const response = await api.get("/questionnaire/get-responses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setResponses(Object.values(response.data)); // Reload responses after saving
      }

      alert("Questionnaire submitted successfully!");
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      alert("Failed to submit responses. Please try again.");
    }
};

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">RoomMatch Questionnaire</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="flex flex-col">
            <label className="text-lg font-medium">{question}</label>
            <select
              value={responses[index] ?? 4} // Ensure it's not undefined
              onChange={(e) => handleChange(index, parseInt(e.target.value))}
              className="mt-2 p-2 border rounded-lg"
            >
              {Array.from({ length: 7 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button type="submit" className="w-full bg-gray-300 text-black py-2 rounded hover:bg-gray-400">
          Submit
        </button>
      </form>
    </div>
  );
}