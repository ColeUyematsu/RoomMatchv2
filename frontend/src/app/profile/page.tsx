"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
  const [profileData, setProfileData] = useState({
    hometown: "",
    major: "",
    graduation_year: "",
    interests: "",
    selected_prompt1: "",
    selected_prompt2: "",
    selected_prompt3: "",
    response1: "",
    response2: "",
    response3: "",
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false); // Ensure loading is set to false if user isn't logged in
        return;
      }
  
      try {
        const response = await axios.get("http://127.0.0.1:8000/user-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Ensure that the data is set properly, avoiding undefined values
        const {
          hometown = "",
          major = "",
          graduation_year = "",
          interests = "",
          profile_picture = "",
          prompts = []
        } = response.data || {};
      
        const [prompt1, prompt2, prompt3] = prompts;
      
        setProfileData({
          hometown,
          major,
          graduation_year,
          interests,
          selected_prompt1: prompt1?.prompt || "",
          response1: prompt1?.response || "",
          selected_prompt2: prompt2?.prompt || "",
          response2: prompt2?.response || "",
          selected_prompt3: prompt3?.prompt || "",
          response3: prompt3?.response || "",
      });
  
        if (profile_picture) {
          setPreviewImage(`http://127.0.0.1:8000${profile_picture}`);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
  
    async function fetchPrompts() {
      try {
        const response = await axios.get("http://127.0.0.1:8000/prompts");
        setPrompts(response.data);
      } catch (error) {
        console.error("Error fetching prompts:", error);
      }
    }
  
    // Call both API requests and ensure loading is updated
    async function fetchData() {
      await fetchProfile();
      await fetchPrompts();
      setLoading(false); // ✅ Ensure loading is set to false once everything loads
    }
  
    fetchData();
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value || "" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must be logged in to update your profile.");
      return;
    }
  
    const formData = new FormData();
    Object.entries(profileData).forEach(([key, value]) => {
      formData.append(key, value || ""); // Prevent undefined values
    });
  
    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/update-profile", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.data.profile_picture) {
        setPreviewImage(`http://127.0.0.1:8000${response.data.profile_picture}`);
      }
  
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };
  
  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Picture Upload */}
        <label className="block text-center">
          Profile Picture
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
          
          {/* Display Profile Picture or Default Avatar */}
          <img 
            src={previewImage || "/default-avatar.png"} // Show default avatar if no profile picture is set
            alt="Profile Preview" 
            className="mt-2 w-32 h-32 object-cover rounded-full mx-auto"
          />
        </label>

        {/* Hometown */}
        <label className="block">
          Hometown
          <input type="text" name="hometown" value={profileData.hometown} onChange={handleChange} className="w-full p-2 border rounded" />
        </label>

        {/* Major */}
        <label className="block">
          Intended Major
          <input type="text" name="major" value={profileData.major} onChange={handleChange} className="w-full p-2 border rounded" />
        </label>

        {/* Graduation Year */}
        <label className="block">
          Graduation Year
          <input type="text" name="graduation_year" value={profileData.graduation_year} onChange={handleChange} className="w-full p-2 border rounded" />
        </label>

        {/* Interests */}
        <label className="block">
          Interests & Hobbies
          <textarea name="interests" value={profileData.interests} onChange={handleChange} className="w-full p-2 border rounded"></textarea>
        </label>

        {/* Prompt 1 */}
        <label className="block">
          Choose a Prompt
          <select name="selected_prompt1" value={profileData.selected_prompt1 || ""} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select a prompt...</option>
            {prompts.map((prompt, index) => (
              <option key={index} value={prompt}>{prompt}</option>
            ))}
          </select>
          <input type="text" name="response1" placeholder="Your response..." value={profileData.response1 || ""} onChange={handleChange} className="w-full p-2 border rounded mt-2" />
        </label>

        {/* Prompt 2 */}
        <label className="block">
          Choose Another Prompt
          <select name="selected_prompt2" value={profileData.selected_prompt2 || ""} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select a prompt...</option>
            {prompts.map((prompt, index) => (
              <option key={index} value={prompt}>{prompt}</option>
            ))}
          </select>
          <input type="text" name="response2" placeholder="Your response..." value={profileData.response2 || ""} onChange={handleChange} className="w-full p-2 border rounded mt-2" />
        </label>

        {/* Prompt 3 */}
        <label className="block">
          Choose a Final Prompt
          <select name="selected_prompt3" value={profileData.selected_prompt3 || ""} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select a prompt...</option>
            {prompts.map((prompt, index) => (
              <option key={index} value={prompt}>{prompt}</option>
            ))}
          </select>
          <input type="text" name="response3" placeholder="Your response..." value={profileData.response3 || ""} onChange={handleChange} className="w-full p-2 border rounded mt-2" />
        </label>

        {/* Submit Button */}
        <button type="submit" className="w-full bg-gray-300 text-black py-2 rounded hover:bg-gray-400">Save Profile</button>      </form>
    </div>
  );
}