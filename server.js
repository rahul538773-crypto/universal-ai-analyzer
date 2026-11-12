const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.CRICKET_API_KEY;

const BASE_URL = "https://api.cricapi.com/v1";

app.get("/", (req, res) => {
  res.json({
    name: "Universal AI Analyzer Backend",
    status: "Online",
    service: "Cricket Data API"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running"
  });
});

app.get("/api/live-matches", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Cricket API key is not configured on server"
      });
    }

    const url = new URL(BASE_URL + "/cricScore");
    url.searchParams.set("apikey", API_KEY);

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: "Cricket provider returned an error",
        providerStatus: response.status
      });
    }

    const data = await response.json();

    if (data.status === "failure") {
      return res.status(502).json({
        success: false,
        error: data.reason || "Cricket API request failed"
      });
    }

    res.json({
      success: true,
      source: "CricketData",
      fetchedAt: new Date().toISOString(),
      data: data.data || []
    });

  } catch (error) {
    console.error("Cricket API error:", error.message);

    res.status(500).json({
      success: false,
      error: "Unable to fetch cricket data"
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Universal AI Analyzer backend running on port " + PORT);
});
