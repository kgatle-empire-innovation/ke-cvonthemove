import { GoogleGenAI } from '@google/genai';
import { AiRefineRequest, AiRefineResponse } from '@cvonthemove/db';

export class AiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  async refineText(request: AiRefineRequest): Promise<AiRefineResponse> {
    const { text, type, context } = request;
    
    let prompt = '';
    if (type === 'summary') {
      prompt = `You are an expert career coach and professional CV writer. 
Please refine the following professional summary to make it more impactful, concise, and professional.
Focus on action verbs and clear achievements.
${context ? `Context/Job Title: ${context}\n` : ''}
Original Summary:
"${text}"

Provide ONLY the refined summary text without any surrounding quotes, Markdown formatting, or conversational filler.`;
    } else if (type === 'job_description') {
      prompt = `You are an expert career coach and professional CV writer.
Please refine the following job description/work experience to make it more impactful, concise, and professional.
Focus on action verbs and clear achievements.
${context ? `Context/Job Title: ${context}\n` : ''}
Original Description:
"${text}"

Provide ONLY the refined description text without any conversational filler.`;
    } else {
      throw new Error(`Unsupported AI refine type: ${type}`);
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const refinedText = response.text || '';
      return { refinedText: refinedText.trim() };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate AI refinement');
    }
  }
}
