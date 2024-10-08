import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.deepinfra.com/v1/openai',
  apiKey: process.env.DEEPINFRA_TOKEN, // Ensure your Deepinfra token is set in your environment variables
});

//2. Our platform guides users through the onboarding process to get started quickly.
//3. Users can access our service through our website.
const systemPrompt = `
You are an AI-powered customer support assistant for Computer Science AI Assistant, we are a platform that provides AI-driven interviews for computer science jobs. Your goal is to assist users with any questions or issues they might have regarding the platform, its features, and the interview process.
1. Computer Science Assistant AI offers AI-powered interviews for software engineering positions.
2. We cover a wide range of topics including algorithms, data structures, system design, and behavioral questions.
3. If asked about technical issues, guide users to our troubleshooting page or suggest contacting our support team.
4. Always mention user privacy and data security.
5. If you're unsure about any information, it's okay to say you don't know and offer to connect the user to a human representative.
6. Do not go out of the scope of the 8 listed systemPrompts, and tell the user that this is a website to help computer scientist trying to make it in the field!

Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all Computer Science AI users.
`;

export async function POST(req) {
  const data = await req.json();
  const stream = false; // Set to true if you want streaming

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...data,
    ],
    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
    stream: stream,
  });

  if (stream) {
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            if (chunk.choices[0].finish_reason) {
              controller.enqueue(encoder.encode(`Finished: ${chunk.choices[0].finish_reason}`));
              controller.enqueue(encoder.encode(`Prompt tokens: ${chunk.usage.prompt_tokens}, Completion tokens: ${chunk.usage.completion_tokens}`));
            } else {
              const content = chunk.choices[0].delta.content;
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } else {
    // Only return the content string without any additional JSON structure
    const content = completion.choices[0].message.content;

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
