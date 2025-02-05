// journalapp/app/(root)/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log("inside the API, POST successful");
  try {
    // Parse the incoming JSON from the request body
    const { messages, apiType } = await request.json();
    const userMessage = messages[0].content;

    if (!userMessage) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    let botResponse: string;

    if (apiType === 'huggingface') {
      console.log("huggingface promtp detected");
      botResponse = await getHuggingFaceResponse(userMessage);
    } else if (apiType === 'deepseek') {
      botResponse = await getDeepSeekResponse(userMessage);
    } else if (apiType === 'openai') {
      botResponse = await getOpenAIResponse(userMessage);
    } else {
      return NextResponse.json({ message: 'Invalid API type specified.' }, { status: 400 });
    }

    return NextResponse.json({ message: botResponse });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

const getOpenAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from OpenAI API');
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return 'Sorry, I encountered an error with OpenAI API. Please try again later.';
  }
};

const getDeepSeekResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {  // Replace with actual DeepSeek endpoint
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from DeepSeek API');
    }

  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return 'Sorry, I encountered an error with DeepSeek API. Please try again later.';
  }
};

const getHuggingFaceResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: userMessage,
        parameters: {
          max_new_tokens: 50,
          temperature: 0.9,
          top_k: 50,
          top_p: 0.95,
          repetition_penalty: 1.5,
          do_sample: true,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    } else {
      throw new Error('Unexpected response format from Hugging Face API');
    }

  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    return 'Sorry, I encountered an error with Hugging Face API. Please try again later.';
  }
};
