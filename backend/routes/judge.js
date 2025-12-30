const express = require("express");
const User = require("../models/User");
const router = express.Router();
const axios = require("axios");


// ---------------- CONTEXT ROUTE ----------------
router.get("/context", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.email });
    res.json({ persona: user?.persona || "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch context" });
  }
});


// ---------------- MAIN ANALYSIS ROUTE ----------------
router.post("/", async (req, res) => {
  try {
    const { ingredients, image_url, userProfile } = req.body;

    if (!ingredients && !image_url) {
      return res.status(400).json({
        msg: "Provide either ingredients text or image"
      });
    }

    let user = await User.findOne({ email: req.email });
    if (!user)
      user = await User.create({ email: req.email, persona: userProfile || "" });

    if (userProfile) {
      user.persona = userProfile;
      await user.save();
    }

    const persona = user.persona || "a consumer who cares about healthy eating";

    const payload = {
      model: "deepseek-vl-1.5",
      messages: [
        {
          role: "system",
          content: "You are a nutrition AI. ALWAYS return ONLY raw JSON. No markdown."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `User persona: ${persona}

Analyze the food / product using the image and/or ingredient list.

Return ONLY JSON in EXACT format:
{
  "verdict": "SAFE" | "CAUTION" | "AVOID",
  "short_reason": "",
  "detailed_reason": "",
  "ui_theme": "green" | "yellow" | "red",
  "highlighted_ingredients": [],
  "uncertainty_note": ""
}`
            },
            ...(image_url
              ? [
                  {
                    type: "image_url",
                    image_url: image_url
                  }
                ]
              : []),
            ...(ingredients
              ? [
                  {
                    type: "text",
                    text: `Ingredients: ${ingredients}`
                  }
                ]
              : [])
          ]
        }
      ],
      max_tokens: 500
    };

    const response = await axios.post(
      "https://api.deepseek.com/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const raw = response.data.choices[0].message.content;

    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      // fallback if JSON slightly malformed
      return res.json({
        verdict: "CAUTION",
        short_reason: "AI returned non-strict JSON",
        detailed_reason: raw,
        ui_theme: "yellow",
        highlighted_ingredients: [],
        uncertainty_note: "Parser fallback"
      });
    }

    res.json(json);
  } catch (error) {
    console.error("AI Error:", error?.response?.data || error.message);
    res.status(500).json({ error: "AI reasoning failed" });
  }
});



// ---------------- FOLLOW UP CHAT ROUTE ----------------
router.post("/chat", async (req, res) => {
  try {
    const { message, context, userProfile, history } = req.body;

    const payload = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an AI Nutrition Co-pilot.

CONTEXT OF PRODUCT:
${context}

USER PROFILE:
${userProfile}

Rules:
- Friendly + simple
- Max 3 sentences unless asked for detail
- Suggest healthier swaps when helpful`
        },
        ...history,
        { role: "user", content: message }
      ]
    };

    const response = await axios.post(
      "https://api.deepseek.com/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Chat error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Chat failed" });
  }
});

module.exports = router;
