import axios, { AxiosError } from "axios"; 


const API_BASE_URL = "http://127.0.0.1:8000"; // Backend URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/x-www-form-urlencoded" }, // Use URL Encoding
});

// Function to Register a New User with School Selection
export const registerUser = async (email: string, password: string, school: string) => {
  try {
    const response = await api.post("/register", {
      email,
      password,
      school, // Add school field
    });

    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post("/token", formData);
    const { access_token, user_id } = response.data; // Ensure backend returns user_id

    if (access_token && user_id) {
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_id", user_id.toString()); // Store userId
    } else {
      throw new Error("User ID missing in login response");
    }

    return { access_token, user_id };
  } catch (err: unknown) {
    console.error("Error logging in:", err);
    return null;
  }
};
export const getMatches = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) return [];

  try {
    console.log("Fetching matches..."); // Debugging
    const response = await axios.get("http://127.0.0.1:8000/match-results", {
      headers: { 
        Authorization: `Bearer ${token}` ,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    const matches = response.data;


    const profileRequests = matches.map(async (match: { matchId: number; match: string; score: number }) => {
      try {
        const profileResponse = await axios.get(
          `http://127.0.0.1:8000/user-profile/${match.matchId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        return {
          userId: localStorage.getItem("user_id"),
          matchId: match.matchId,
          match: match.match,
          score: match.score,  // No longer errors because API includes it
          profile: profileResponse.data,
        };
      } catch (error) {
        console.error("Error fetching profile:", error);
        return { userId: localStorage.getItem("user_id"), matchId: match.matchId, match: match.match, score: match.score, profile: null };
      }
    });

    return await Promise.all(profileRequests);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

export const getMatchProfile = async (matchId: string) => {
  if (!matchId) {
    console.error("Cannot fetch match profile: matchId is missing!");
    return null;
  }

  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token found.");


    const response = await axios.get(`http://127.0.0.1:8000/user-profile/${matchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching match profile:", error);
    return null;
  }
};

export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token found.");

    const response = await api.get("/user-profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data; // Return user data
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const submitQuestionnaire = async (responses: number[]) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token found.");

    const formData = new URLSearchParams();

    // Ensure all 25 questions are included
    for (let i = 0; i < 25; i++) {
      formData.append(`question${i + 1}`, responses[i]?.toString() || "4"); 
    }

    const response = await api.post("/questionnaire/submit-questionnaire", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error submitting questionnaire:", error);
    return false;
  }
};

export const updateUserProfile = async (formData: FormData) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token found.");

    const response = await api.put("/user-profile", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
};

export const getUserResponses = async () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token found.");

    const response = await api.get("/questionnaire/get-responses", {  // Ensure correct route
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user responses:", error);
    return null;
  }
};


export const getMessages = async (userId: string, matchId: string) => {
  if (!userId || !matchId) {
    console.error("Cannot fetch messages: userId or matchId is undefined!");
    return [];
  }

  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token found.");


    const response = await axios.get(`http://127.0.0.1:8000/chat/messages/${userId}/${matchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const sendMessage = async (userId: string, matchId: string, message: string) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token found.");


    await axios.post(
      `http://127.0.0.1:8000/chat/messages/${userId}/${matchId}`,
      { content: message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error sending message:", error);
  }
};