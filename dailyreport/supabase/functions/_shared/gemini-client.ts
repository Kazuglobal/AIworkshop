// Gemini API client for resource search functionality
// Using the Google Generative AI SDK

import { GoogleGenerativeAI } from 'npm:@google/generative-ai@2.2.0';

// API Key should be set as environment variable
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Gemini model to use
const MODEL_NAME = 'gemini-1.5-pro';

// Initialize the Gemini API client
export const initGeminiClient = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  return new GoogleGenerativeAI(GEMINI_API_KEY);
};

// Search for resources related to a query
export async function searchResources(query: string, additionalContext?: string) {
  try {
    const genAI = initGeminiClient();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Create prompt for Gemini
    const prompt = `
      あなたは「Culture Bridge Program 2025」という高校生と留学生のための
      ボランティア活動とその意義をテーマにした教育プログラム向けの
      リソース検索アシスタントです。
      
      以下のクエリに関連する記事、ニュース、オンラインリソースを検索し、
      5件の推奨リソースをJSON形式で返してください:
      
      クエリ: ${query}
      ${additionalContext ? `追加コンテキスト: ${additionalContext}` : ''}
      
      各リソースには以下の情報を含めてください:
      - title: リソースのタイトル（日本語）
      - url: リソースのURL
      - description: リソースの簡単な説明（日本語、100文字程度）
      - tags: 関連するタグの配列（SDGs、ボランティア、国際交流など）
      - type: リソースのタイプ（article, video, website, tool等）
      
      結果は必ず以下のJSON形式で返してください:
      { "resources": [ { title, url, description, tags, type }, ... ] }
    `;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response
    // Sometimes Gemini adds markdown code blocks around JSON
    const jsonMatch = text.match(/```(?:json)?([\s\S]*?)```/) || [null, text];
    const jsonStr = jsonMatch[1].trim();
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse JSON response from Gemini:', e);
      return { resources: [] };
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { resources: [] };
  }
} 