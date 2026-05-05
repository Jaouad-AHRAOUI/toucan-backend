import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Route de test simple
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend Toucan running" });
});

app.get("/token", async (req, res) => {
  try {
    const apiKey = process.env.TOUCAN_API_KEY;

    console.log("TOUCAN_API_KEY exists:", !!apiKey);

    if (!apiKey) {
      return res.status(500).json({
        error: "TOUCAN_API_KEY is missing in environment variables"
      });
    }

    const response = await fetch("https://toucanai.cloud/embed/generate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        user: {
          distinctId: "user-123",
          role: "explorer",
          attributes: {
            customer_id: "abc123"
          }
        }
      })
    });

    const rawText = await response.text();

    console.log("TOUCAN STATUS:", response.status);
    console.log("TOUCAN RAW RESPONSE:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(500).json({
        error: "Toucan response is not valid JSON",
        raw: rawText
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Toucan API returned an error",
        details: data
      });
    }

    if (!data.token) {
      return res.status(500).json({
        error: "Token not returned by Toucan API",
        details: data
      });
    }

    res.json({
      token: data.token,
      expiresIn: data.expiresIn
    });
  } catch (err) {
    console.error("TOKEN ERROR:", err);
    res.status(500).json({
      error: "Failed to generate token",
      details: err.message
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server running on port", port);
});
