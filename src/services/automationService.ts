import { GoogleGenAI, Type } from "@google/genai";
import { adminDb } from '../firebaseAdmin.ts';
import admin from 'firebase-admin';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const runDailyAutomation = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const metaRef = adminDb.collection('metadata').doc('automation');
    const metaSnap = await metaRef.get();
    
    if (metaSnap.exists && metaSnap.data()?.lastDailyUpdate === today) {
      console.log('Daily automation already ran today.');
      return;
    }

    console.log('Running daily AI content automation...');

    const model = "gemini-3-flash-preview";
    const prompt = `Generate a daily update for an AI Hub. Provide:
    1. A new AI Tool recommendation (name, description, category: "AI Tools").
    2. A new AI Fact or Knowledge piece (title, description, category: "AI Knowledge").
    3. An AI Art prompt idea (title, description, category: "AI Art").
    
    Return the result as a JSON array of 3 objects with fields: title, description, category.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { 
                type: Type.STRING,
                enum: ["AI Art", "AI Tools", "AI Knowledge"]
              }
            },
            required: ["title", "description", "category"]
          }
        }
      }
    });

    const content = JSON.parse(response.text);

    for (const item of content) {
      // For images, we'll use a placeholder seeded with the title to make it look "automated"
      const seed = item.title.replace(/\s+/g, '-').toLowerCase();
      const imageUrl = `https://picsum.photos/seed/${seed}/800/800`;
      
      await adminDb.collection('aiContent').add({
        ...item,
        imageUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isAutomated: true
      });
    }

    // --- News Automation ---
    console.log('Fetching trending AI news for community update...');
    const newsPrompt = `Fetch the top 5 most trending and POSITIVE AI news stories from the last 24 hours. 
    Focus on news that is useful for people, makes good things for them, or can inspire positive change.
    Include news that can change a person with its good news and positive impact.
    For each, provide:
    1. A catchy headline (title).
    2. A comprehensive 3-4 sentence summary.
    3. A category (e.g., "Research", "Product", "Ethics", "Creative", "Robotics").
    4. A list of 3 relevant tags.
    5. Estimated read time (e.g., "2 min").
    6. A detailed prompt for an AI image generator that visually represents this news story.
    
    Format as a JSON array of objects with fields: title, summary, category, tags, readTime, imagePrompt.`;

    const newsResponse = await ai.models.generateContent({
      model,
      contents: newsPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              readTime: { type: Type.STRING },
              imagePrompt: { type: Type.STRING }
            },
            required: ["title", "summary", "category", "tags", "readTime", "imagePrompt"]
          }
        }
      }
    });

    const newsItems = JSON.parse(newsResponse.text);

    for (const news of newsItems) {
      // Generate a unique AI image for each news story
      let imageUrl = `https://picsum.photos/seed/${news.title.replace(/\s+/g, '-').toLowerCase()}/1200/800`;
      
      try {
        console.log(`Generating AI image for: ${news.title}`);
        const imageGenResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { text: `A high-quality, cinematic, professional editorial illustration for a news article about: ${news.title}. Style: Futuristic, clean, vibrant colors. Prompt: ${news.imagePrompt}` }
            ]
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        });

        for (const part of imageGenResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (imgError) {
        console.error(`Failed to generate AI image for ${news.title}, falling back to picsum:`, imgError);
      }

      await adminDb.collection('posts').add({
        title: news.title,
        content: news.summary,
        category: news.category,
        tags: news.tags,
        readTime: news.readTime,
        imageUrl: imageUrl,
        authorName: 'Neural Hub AI',
        authorPhoto: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeuralHub',
        authorUid: 'system_automation',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        date: today,
        type: 'news',
        likes: 0,
        comments: 0,
        isAutomated: true
      });
    }

    await metaRef.set({ lastDailyUpdate: today }, { merge: true });
    console.log('Daily automation completed successfully.');
  } catch (error) {
    console.error('Daily automation failed:', error);
    throw error; // Re-throw to handle in server.ts
  }
};
