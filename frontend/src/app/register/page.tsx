"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/utils/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [error, setError] = useState("");
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);
  const router = useRouter();

  // List of supported schools
  const schools = [
    "Pomona College",
    "Harvey Mudd College",
    "Claremont McKenna College",
    "Scripps College",
    "Pitzer College",
    "Stanford University",
    "UC Berkeley",
    "MIT",
    "Harvard University",
    "Other",
  ];

  // Filter schools based on input
  const handleSchoolInput = (input: string) => {
    setSchool(input);
    setFilteredSchools(
      input ? schools.filter((s) => s.toLowerCase().includes(input.toLowerCase())) : []
    );
  };

  const handleRegister = async () => {
    if (!email || !password || !school) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await registerUser(email, password, school);
      if (response.success) {
        router.push("/login"); // Redirect to login after success
      } else {
        setError(response.message); // Display backend error message
      }
    } catch (error) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Register</h1>
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

      {/* Searchable School Input */}
      <div className="relative w-64">
        <input
          type="text"
          placeholder="Type your school"
          className="border p-2 rounded w-full"
          value={school}
          onChange={(e) => handleSchoolInput(e.target.value)}
        />
        {filteredSchools.length > 0 && (
          <ul className="absolute left-0 right-0 bg-white border mt-1 max-h-40 overflow-auto rounded shadow-md">
            {filteredSchools.map((s, index) => (
              <li
                key={index}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setSchool(s);
                  setFilteredSchools([]);
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="bg-blue-500 text-white p-2 rounded w-64 mt-4" onClick={handleRegister}>
        Register
      </button>

      <p className="mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-blue-500 hover:underline">
          Log in
        </a>
      </p>
    </div>
  );
}