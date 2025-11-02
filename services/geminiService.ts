
import { GoogleGenAI, Type } from "@google/genai";
import type { WeatherData, SportsData } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a mock service.");
}

const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;
const model = 'gemini-2.5-flash';

const mockDelay = <T,>(data: T, delay = 500): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(data), delay));

export const getWeatherData = async (): Promise<WeatherData> => {
    if (!ai) {
        return mockDelay({
            location: "Bristol, RI",
            temperature: 72,
            condition: "Sunny",
            description: "Clear skies and a gentle breeze."
        });
    }

    const prompt = "Get the current weather for Bristol, RI.";
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    location: { type: Type.STRING },
                    temperature: { type: Type.NUMBER, description: "Temperature in Fahrenheit" },
                    condition: { type: Type.STRING, description: "e.g., Sunny, Cloudy, Rain" },
                    description: { type: Type.STRING }
                },
                required: ["location", "temperature", "condition", "description"]
            }
        }
    });

    return JSON.parse(response.text) as WeatherData;
};

export const getSportsData = async (team: string): Promise<SportsData> => {
    if (!ai) {
         const isNfl = team.toLowerCase().includes('nfl');
        return mockDelay({
            status: 'LIVE',
            headline: isNfl ? 'Live: Chiefs @ Ravens' : 'Live vs. Maple Leafs',
            details: isNfl ? '14-10 | Q2 02:15' : '2-1 | P2 08:45'
        });
    }

    let prompt: string;
    if (team.toLowerCase() === 'nfl') {
        prompt = `Provide an update for the NFL. First, check if there are any games happening right now. If so, give me the live score for the most exciting game. The headline should be the matchup (e.g., 'Chiefs @ Ravens'), and the details should be the score and game status (e.g., '14-7 | Q2 05:30'). If multiple games are live, pick the one with the closest score or involving top teams. If no games are live, tell me about the most anticipated upcoming game this week: who is playing, and the date and time. If it's the offseason, provide a significant news headline.`;
    } else {
        prompt = `Provide an update for the ${team}. First, check if there's a game happening right now. If so, give me the live score against their opponent and the current game status (e.g., quarter, period, time left). If no game is live, tell me about their next scheduled game: who they're playing, and the date and time of the game. If there's neither a live game nor an upcoming one soon, just give a general recent news headline.`;
    }

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    status: { type: Type.STRING, description: "Should be 'LIVE', 'UPCOMING', or 'INFO' based on the content." },
                    headline: { type: Type.STRING, description: "e.g., 'Live vs. Opponent' or 'Next Game vs. Opponent' or a news headline." },
                    details: { type: Type.STRING, description: "e.g., '14-7 | Q2 05:30' or 'Sun, Oct 27 @ 1:00 PM EST' or a news snippet." }
                },
                required: ["status", "headline", "details"]
            }
        }
    });
    
    return JSON.parse(response.text) as SportsData;
};
