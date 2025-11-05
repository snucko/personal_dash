import { GoogleGenAI, Type } from "@google/genai";
import type { WeatherData, SportsData, Game } from '../types';

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
        if (team === 'NFL') {
            // Updated mock data to show clearly upcoming games to avoid confusion.
            return mockDelay([
                { id: 'DAL@PHI', awayTeam: { name: 'Cowboys', score: '' }, homeTeam: { name: 'Eagles', score: '' }, status: 'UPCOMING', details: 'Sun 1:00 PM' },
                { id: 'KC@DEN', awayTeam: { name: 'Chiefs', score: '' }, homeTeam: { name: 'Broncos', score: '' }, status: 'UPCOMING', details: 'Sun 4:25 PM' },
                { id: 'GB@SF', awayTeam: { name: 'Packers', score: '' }, homeTeam: { name: '49ers', score: '' }, status: 'UPCOMING', details: 'Sun 8:20 PM' },
            ]);
        }
        return mockDelay([
            { id: 'BOS@TOR', awayTeam: { name: 'Bruins', score: '2' }, homeTeam: { name: 'Maple Leafs', score: '1' }, status: 'LIVE', details: 'P2 08:45' }
        ]);
    }

    let prompt: string;
    if (team.toLowerCase() === 'nfl') {
        const today = new Date().toUTCString();
        prompt = `The current date is ${today}. Provide a list of today's live or upcoming NFL games.
- If there are games live right now, prioritize them. Show their live scores, quarter, and time remaining. List up to 3 prominent live games.
- If no games are live, but there are games scheduled for later today, list the 3 most anticipated upcoming games with their scheduled times.
- If there are no NFL games at all today, list the 3 most anticipated games for the upcoming week (e.g., next Sunday or Monday Night).
The response must be a JSON array of game objects.`;
    } else {
        prompt = `Provide an update for the ${team}. First, check if there's a game happening right now. If so, give me the live score and game status. If no game is live, tell me about their next scheduled game. Return the result as a JSON array containing a single game object.`;
    }

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
                        id: { type: Type.STRING, description: "A unique ID for the game, e.g., 'KC@BAL'" },
                        homeTeam: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                score: { type: Type.STRING, description: "Current score as a string, e.g., '14' or '' if upcoming" }
                            },
                            required: ["name", "score"]
                        },
                        awayTeam: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                score: { type: Type.STRING, description: "Current score as a string, e.g., '10' or '' if upcoming" }
                            },
                             required: ["name", "score"]
                        },
                        status: { type: Type.STRING, description: "Enum: 'LIVE', 'UPCOMING', 'FINAL', 'INFO'" },
                        details: { type: Type.STRING, description: "Game status details, e.g., 'Q2 05:30', 'Sun, Oct 27 @ 1:00 PM', 'Final'" }
                    },
                    required: ["id", "homeTeam", "awayTeam", "status", "details"]
                }
            }
        }
    });
    
    return JSON.parse(response.text) as SportsData;
};