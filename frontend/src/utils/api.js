const API_URL = import.meta.env.VITE_API_URL;

export const fetchJSON = async (path) => {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error("Request failed");
  }
  return response.json();
};

export const postJSON = async (path, body) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return response.json();
};
