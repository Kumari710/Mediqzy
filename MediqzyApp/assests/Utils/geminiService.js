/**
 * Gemini AI Service
 * 
 * Handles medical AI assistance, health insights, and image analysis
 * using Google's Gemini Pro models.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from './apiConfig';

// Initialize the API with the key
const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.API_KEY);

/**
 * Get a medical response for a text prompt
 * @param {string} prompt - User's health query
 * @param {string} context - Optional background context (e.g. user metrics)
 * @returns {Promise<string>} AI Response
 */
export const getMedicalConsultation = async (prompt, context = '') => {
    try {
        if (GEMINI_CONFIG.API_KEY === 'your-gemini-api-key') {
            return "AI feature is ready but requires a Gemini API Key to function. Please configure it in Utils/apiConfig.js";
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const fullPrompt = `
            You are a professional medical assistant (AI Doctor). 
            Context: ${context}
            User Question: ${prompt}
            
            Provide helpful, accurate medical information but always include a disclaimer that this is AI-generated and not a replacement for professional medical advice.
        `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini AI error:', error);
        return "I'm having trouble connecting to my medical brain right now. Please try again later.";
    }
};

/**
 * Analyze medical images (e.g. reports, skin conditions)
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} prompt - What to look for in the image
 * @returns {Promise<string>} Analysis result
 */
export const analyzeMedicalImage = async (imageBase64, prompt = "Analyze this medical image and provide insights.") => {
    try {
        if (GEMINI_CONFIG.API_KEY === 'your-gemini-api-key') {
            return "AI Image analysis is ready but requires a Gemini API Key.";
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const parts = [
            { text: prompt },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64
                }
            }
        ];

        const result = await model.generateContent(parts);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Vision error:', error);
        return "Failed to analyze the image. Please ensure it's a clear medical document or photo.";
    }
};

export default {
    getMedicalConsultation,
    analyzeMedicalImage,
};
