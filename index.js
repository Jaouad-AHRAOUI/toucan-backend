import express from "express";
import cors from "cors";

console.log("TOUCAN_API_KEY =", process.env.TOUCAN_API_KEY);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/token", async (req, res) => {
  try {
    const response = await fetch("https://toucanai.cloud/embed/generate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.TOUCAN_API_KEY
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

    const data = await response.json();

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
    console.error(err);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// ✅ IMPORTANT FIX RENDER PORT
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server running on port", port);
});
