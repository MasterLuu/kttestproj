
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getInventoryInsights(inventorySummary: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `分析以下库存状态，并为仓库管理员提供 3 条简短的专业建议。重点关注效率、库存优化和潜在风险。请使用中文回答。
      
      库存摘要：
      ${inventorySummary}
      
      响应应为一个字符串 JSON 数组。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return ["优先处理库存不足的商品。", "每日监控畅销商品的库存情况。", "关注季节性需求波动。"];
  }
}
