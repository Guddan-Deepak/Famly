import axios from "axios";

export default async function handler(req, res) {
  // Read backend base URL from environment variable
  const baseUrl = process.env.VITE_SERVER; 
  if (!baseUrl) {
    return res.status(500).json({ error: "Missing BACKEND_URL environment variable" });
  }

  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path.join("/") : path;
  const url = '${baseUrl}/${endpoint}';

  try {
    const response = await axios({
      url,
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
      data: req.method !== "GET" ? req.body : undefined,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: "Proxy error" });
  }
}