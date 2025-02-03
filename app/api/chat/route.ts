// journalapp/app/(root)/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log("inside the API, POST successful");
  try {
    // Parse the incoming JSON from the request body
    const { userMessage, apiType } = await request.json();

    let botResponse: string;

    if (apiType === 'huggingface') {
      console.log("huggingface promtp detected");
      botResponse = await getHuggingFaceResponse(userMessage);
    } else if (apiType === 'deepseek') {
      botResponse = await getDeepSeekResponse(userMessage);
    }else if (apiType === 'openai') {
      botResponse = await getOpenAIResponse(userMessage);
    } else {
      botResponse = 'Invalid API type specified.';
    }

    return NextResponse.json({ message: botResponse });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ message: 'Error processing your request' }, { status: 500 });
  }
}

const getOpenAIResponse = async (userMessage: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: userMessage,
      max_tokens: 50,
    }),
  });

  const data = await response.json();
  // Make sure data.choices exists and is an array
  if (data && Array.isArray(data.choices) && data.choices.length > 0) {
    return data.choices[0].text.trim();
  }
  return 'No valid response from OpenAI';
};

const getDeepSeekResponse = async (userMessage: string) => {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 100,
    }),
  });

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Error getting response';
};


const getHuggingFaceResponse = async (userMessage: string): Promise<string> => {
  const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: userMessage,
    }),
  });

  const data = await response.json();
  // Hugging Face responses often return an array of generated results.
  // Adjust this logic based on the actual response format.
  if (Array.isArray(data) && data[0]?.generated_text) {
    console.log("POST successfuly handled by huggingface");
    return data[0].generated_text.trim();
  }
  // If response isn't in the expected format, return the JSON as a string
  return JSON.stringify(data);
};
