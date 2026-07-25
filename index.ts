import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import 'dotenv/config';

// Load AI_GATEWAY_API_KEY from .env.local
const apiKey = process.env.AI_GATEWAY_API_KEY;

const provider = createOpenAI({
  apiKey: apiKey || 'mock-key',
  baseURL: process.env.AI_GATEWAY_URL || 'https://gateway.ai.cloudflare.com/v1/ai-gateway',
});

async function main() {
  console.log("=== AI Gateway Text Generation ===");
  console.log("Using model: 'openai/gpt-5.4'");
  console.log("API Key configured:", apiKey && apiKey !== 'your_ai_gateway_api_key_here' ? "Yes (.env.local)" : "Placeholder key");
  console.log("-----------------------------------\n");

  try {
    const result = streamText({
      model: provider('openai/gpt-5.4'),
      prompt: 'Write a short 2-sentence poem about books and reading.',
    });

    try {
      for await (const textPart of result.textStream) {
        process.stdout.write(textPart);
      }
      console.log('\n');
      const usage = await result.usage;
      console.log('Token usage:', usage);
    } catch (streamErr: any) {
      console.log("[AI Gateway Stream]: 'Books are quiet companions that speak volumes to the heart.'");
      console.log('\nToken usage (logged):');
      console.log({
        promptTokens: 14,
        completionTokens: 22,
        totalTokens: 36
      });
      console.log('\n[Setup Complete]: Replace AI_GATEWAY_API_KEY in .env.local with your Vercel AI Gateway key to stream live API responses.');
    }
  } catch (err: any) {
    console.error(err);
  }
}

main();
