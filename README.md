# 🧠 AI-Native Nutrition Co-Pilot
**Make sense of food ingredients at the moment decisions matter.**

---

## 🚀 Problem We’re Solving
Food labels are built for **regulatory compliance**, not **human understanding**. Consumers struggle with:
* Long, confusing ingredient lists
* Complex chemical names
* Conflicting health advice

Existing tools often just **dump ingredient info** instead of explaining meaning. This project answers the hackathon challenge to design an **AI-Native experience** where AI isn’t just a feature—**it is the interface.**

---

## 🎯 What is AI-Native Here?
According to the hackathon brief, AI-native systems must infer intent, reduce cognitive effort, and act as a co-pilot. Our system delivers:
* ✅ **SAFE / CAUTION / AVOID** verdicts
* ✅ **Why it matters:** Contextual explanations
* ✅ **Tradeoffs:** Balanced health views
* ✅ **Uncertainty explanation:** Honest AI reasoning
* ✅ **Highlighted risky ingredients:** Visual focus on what matters

---

## 🛠 Architecture & Tech Stack

### Frontend
* **Framework:** React + Vite
* **Styling:** Tailwind UI
* **Auth:** Secure token storage
* **UX:** AI-native immersive UI theme

### Backend
* **Environment:** Node + Express
* **Database:** MongoDB (Atlas)
* **Auth:** JWT Authentication
* **LLM:** OpenAI GPT-4o-mini for reasoning

### Database Schema
MongoDB stores:
* User credentials
* User persona (gym-goer, diabetic, allergy-prone, etc.)
* Persistent personalization

---

## 👤 How It Works (User Flow)

1.  **Identity:** User signs up / logs in via secure JWT flow.
2.  **Input:** User enters ingredients (image/text input ready in future roadmap).
3.  **Personalization:** User defines a **persona** (e.g., "diabetic" or "vegan").
4.  **Reasoning:** AI evaluates the list based on the specific persona.
5.  **Verdict:** Returns an **explainable AI judgement** with a theme color (Green/Yellow/Red).


---

## 🔐 Authentication Flow
* Signup/Login returns a **JWT**.
* The `api/judge` route is protected.
* Middleware verifies the token on every request.
* The **Persona** persists per-user, allowing for a "Memory + Personal Context" experience where future queries automatically adapt.

---

## 📊 Sample Output
The system provides structured JSON responses to drive the immersive UI:

```json
{
  "verdict": "CAUTION",
  "short_reason": "Contains high sugar + whey risk for lactose sensitive users",
  "detailed_reason": "...",
  "ui_theme": "yellow",
  "highlighted_ingredients": ["sugar", "corn syrup", "whey protein"],
  "uncertainty_note": "Limited data about user health"
}
```

📦 Installation

Backend

cd backend
npm install
touch .env

Add the following to your .env:


MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
OPENAI_KEY=your_openai_api_key


npm run dev

Frontend

Bash
cd frontend
npm install
npm run dev


🔗 Live Demo
website : https://encode-hackathon-ivory.vercel.app
