const express = require("express");
const User = require("../models/User");
const router = express.Router();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/", async (req, res) => {
  try {
    const { ingredients, userProfile } = req.body;

    if (!ingredients) {
      return res.status(400).json({ msg: "Ingredients required" });
    }

    let user = await User.findOne({ email: req.email });

    // If user does not exist
    if (!user) {
      user = await User.create({
        email: req.email,
        persona: userProfile || ""
      });
    }

    // If user provided new persona, update
    if (userProfile) {
      user.persona = userProfile;
      await user.save();
    }

    const persona = user.persona || "unknown user; be neutral";

    const prompt = `
You are an AI-Native Nutrition Co-pilot.
User Context: ${persona}
Ingredients: ${ingredients}

Return ONLY JSON in this exact format:

{
  "verdict": "SAFE" | "CAUTION" | "AVOID",
  "short_reason": "",
  "detailed_reason": "",
  "ui_theme": "green" | "yellow" | "red",
  "highlighted_ingredients": [],
  "uncertainty_note": ""
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(response.choices[0].message.content));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed" });
  }
});

module.exports = router;
