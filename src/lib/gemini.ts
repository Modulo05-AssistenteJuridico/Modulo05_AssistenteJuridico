import "server-only";
import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export const GEMINI_MODEL_FALLBACK =
  process.env.GEMINI_MODEL_FALLBACK ?? "gemini-2.5-flash-lite";

export function createGeminiClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
}
