export const authApiService = {
  login: async (credentials) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }).then((res) => res.json());

    if (!response.success) {
      throw new Error(
        response.message + " " + response?.details ?? "Login failed"
      );
    }

    return response;
  },
  logout: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/logout`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      throw new Error("Logout failed");
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    return await response.json();
  },
};
