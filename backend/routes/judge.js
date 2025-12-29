const express = require("express");
const User = require("../models/User");
const router = express.Router();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// --- NEW: Route to fetch saved context ---
router.get("/context", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.email });
    res.json({ persona: user?.persona || "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch context" });
  }
});

// --- Existing POST route ---
router.post("/", async (req, res) => {
  try {
    const { ingredients, image_url, userProfile } = req.body;

    if (!ingredients && !image_url) {
      return res.status(400).json({ msg: "Ingredients or an image is required" });
    }

    let user = await User.findOne({ email: req.email });
    if (!user) {
      user = await User.create({ email: req.email, persona: userProfile || "" });
    }

    // Update the persona if the user sent a new one
    if (userProfile) {
      user.persona = userProfile;
      await user.save();
    }

    const persona = user.persona || "a consumer looking for healthy choices";

    // Build the multimodal message
    const content = [
      {
        type: "text",
        text: `You are an AI-Native Nutrition Co-pilot. 
               User Health Context: ${persona}.
               Analyze the following input and provide human-level insight.
               
               Return ONLY JSON in this exact format:
               {
                 "verdict": "SAFE" | "CAUTION" | "AVOID",
                 "short_reason": "",
                 "detailed_reason": "",
                 "ui_theme": "green" | "yellow" | "red",
                 "highlighted_ingredients": [],
                 "uncertainty_note": "Mention if the image is blurry or ingredients are unclear"
               }`
      }
    ];

    if (image_url) {
      content.push({
        type: "image_url",
        image_url: { url: image_url } 
      });
    } else {
      content.push({
        type: "text",
        text: `Ingredients list: ${ingredients}`
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [{ role: "user", content: content }],
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(response.choices[0].message.content));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI reasoning failed" });
  }
});

module.exports = router;