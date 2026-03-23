import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import type { QueuedPost } from "./queue-manager";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const DIST_DIR = path.join(process.cwd(), "data/distribution");

export async function generateDistributionContent(
  post: QueuedPost,
): Promise<void> {
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  console.log("   📣 Generating distribution content...");

  const prompt = `You are a social media writer for LastEMI, India's honest debt freedom platform.

Generate distribution content for this blog post:
Title: ${post.title}
Keyword: ${post.seoKeyword}
Brief: ${post.description}
URL: https://lastemi.com/blog/${post.slug}

Generate ALL of the following formats. Return as JSON only:
{
  "twitter_thread": {
    "tweet1": "Hook tweet under 240 chars with a specific number.",
    "tweet2": "Key insight. Under 240 chars.",
    "tweet3": "The honest verdict. Under 240 chars.",
    "tweet4": "CTA with the URL. Under 240 chars."
  },
  "linkedin_post": "150-200 word LinkedIn post. Professional tone. End with URL.",
  "whatsapp_message": "Short message under 100 words. Plain language. End with URL."
}

Rules:
- Never use "game-changer" or "must-read"
- Include at least one specific ₹ figure
- Say something a bank would not say
- No emojis in LinkedIn content`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1500,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = completion.choices[0]?.message?.content ?? "{}";
    let content;
    try {
      content = JSON.parse(responseText);
    } catch {
      content = { raw: responseText };
    }

    const outputPath = path.join(DIST_DIR, `${post.slug}.json`);
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          slug: post.slug,
          title: post.title,
          url: `https://lastemi.com/blog/${post.slug}`,
          generatedAt: new Date().toISOString(),
          ...content,
        },
        null,
        2,
      ),
    );

    console.log(
      `   ✅ Distribution content saved to data/distribution/${post.slug}.json`,
    );
  } catch (err) {
    console.error("   ⚠️ Distribution content generation failed:", err);
  }
}
