const express = require("express");
const User = require("../models/User");
const router = express.Router();
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// ---------------- CONTEXT ROUTE ----------------
router.get("/context", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.email });
    res.json({ persona: user?.persona || "" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch context" });
  }
});


// ---------------- MAIN ANALYSIS ----------------
router.post("/", async (req, res) => {
  try {
    const { ingredients, image_url, userProfile } = req.body;

    if (!ingredients && !image_url) {
      return res.status(400).json({ msg: "Ingredients or image required" });
    }

    let user = await User.findOne({ email: req.email });
    if (!user)
      user = await User.create({ email: req.email, persona: userProfile || "" });

    if (userProfile) {
      user.persona = userProfile;
      await user.save();
    }

    const persona = user.persona || "a consumer who cares about healthy choices";

    // Convert image to base64 if provided
    let imagePart = null;
    if (image_url) {
      const img = await axios.get(image_url, { responseType: "arraybuffer" });
      imagePart = {
        inlineData: {
          data: Buffer.from(img.data).toString("base64"),
          mimeType: "image/png"
        }
      };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [] // avoids random blocking
    });

    const prompt = `
You are an AI Nutrition Co-pilot.
User persona: ${persona}

Analyze using image and/or ingredients below.
If anything unclear, state uncertainty.

Ingredients: ${ingredients || "Not provided"}

Return ONLY valid JSON EXACTLY like:
{
  "verdict": "SAFE" | "CAUTION" | "AVOID",
  "short_reason": "",
  "detailed_reason": "",
  "ui_theme": "green" | "yellow" | "red",
  "highlighted_ingredients": [],
  "uncertainty_note": ""
}
`;

    const parts = [{ text: prompt }];
    if (imagePart) parts.push(imagePart);

    const result = await model.generateContent(parts);
    const text = result.response.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.json({
        verdict: "CAUTION",
        short_reason: "Could not strictly parse JSON",
        detailed_reason: text,
        ui_theme: "yellow",
        highlighted_ingredients: [],
        uncertainty_note: "Parser fallback"
      });
    }

    res.json(json);

  } catch (error) {
    console.error("Gemini Error:", error?.response?.data || error.message);
    res.status(500).json({ error: "AI reasoning failed" });
  }
});


// ---------------- FOLLOW UP CHAT ----------------
router.post("/chat", async (req, res) => {
  try {
    const { message, context, userProfile, history } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        text: `
You are an AI Nutrition Co-pilot.

PRODUCT:
${context}

USER:
${userProfile}

Rules:
- Helpful but brief
- Max 3 sentences unless asked
- Suggest swaps when useful

User: ${message}
`
      }
    ]);

    res.json({ reply: result.response.text() });

  } catch (error) {
    console.error("Chat Error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Chat failed" });
  }
});

module.exports = router;
