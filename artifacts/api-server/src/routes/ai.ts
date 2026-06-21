import { Router } from "express";
import OpenAI from "openai";
import { logger } from "../lib/logger";

const router = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/generate-content", async (req, res) => {
  try {
    const { businessName, industry, location, tone, goal } = req.body;
    if (!businessName || !industry || !location || !tone || !goal) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert social media manager for small businesses. Generate engaging, platform-specific content that drives real results. Always match the brand voice, use relevant emojis appropriately, and write captions that encourage action. Return ONLY valid JSON in this exact format: { "instagram": "caption text with emojis and line breaks", "facebook": "longer more conversational post", "tiktok": "short punchy caption with trending hooks", "hashtags": ["hashtag1", "hashtag2", ...30 hashtags], "callToAction": "specific CTA for this business" }`,
        },
        {
          role: "user",
          content: `Business: ${businessName}\nIndustry: ${industry}\nLocation: ${location}\nTone: ${tone}\nGoal: ${goal}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(completion.choices[0].message.content || "{}");
    res.json(content);
  } catch (err) {
    req.log.error({ err }, "Failed to generate content");
    res.status(500).json({ error: "Failed to generate content" });
  }
});

router.post("/generate-hashtags", async (req, res) => {
  try {
    const { industry, platform, location } = req.body;
    if (!industry || !platform || !location) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a social media hashtag expert. Return ONLY valid JSON in this format: { "hashtags": ["hashtag1", "hashtag2", ...] } with 25-30 relevant hashtags for the given industry and platform.`,
        },
        {
          role: "user",
          content: `Industry: ${industry}\nPlatform: ${platform}\nLocation: ${location}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to generate hashtags");
    res.status(500).json({ error: "Failed to generate hashtags" });
  }
});

router.post("/generate-calendar", async (req, res) => {
  try {
    const { businessName, industry, month } = req.body;
    if (!businessName || !industry || !month) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a social media content strategist. Generate a 30-day content calendar. Return ONLY valid JSON in this format: { "calendar": [ { "week": 1, "day": "Monday", "date": "2024-06-03", "platform": "instagram", "theme": "Brand Story", "postIdea": "Share your origin story", "caption": "Full caption here...", "hashtags": ["tag1", "tag2"] } ] }. Generate 30 entries, rotating between instagram, facebook, and tiktok.`,
        },
        {
          role: "user",
          content: `Business: ${businessName}\nIndustry: ${industry}\nMonth: ${month}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to generate calendar");
    res.status(500).json({ error: "Failed to generate calendar" });
  }
});

router.post("/improve-caption", async (req, res) => {
  try {
    const { caption, platform, tone } = req.body;
    if (!caption || !platform || !tone) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a social media copywriter. Improve the given caption for better engagement. Return ONLY valid JSON: { "improved": "improved caption text" }`,
        },
        {
          role: "user",
          content: `Platform: ${platform}\nTone: ${tone}\nCaption: ${caption}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to improve caption");
    res.status(500).json({ error: "Failed to improve caption" });
  }
});

export default router;
