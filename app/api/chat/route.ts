import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
  const { a, b } = await req.json();
  console.log('comparing ', a, b);
  const messages = [
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content:  `compare "${a}" (designated "A") and "${b} designated B) ;
 return a JSON array of 8 features with properties "feature", "description" "a", "b", "value" (a number 1-10 indicating importance of feature) and "winner".  
 description describe the meaning of the feature, and should be 1-2 medium sized sentences.
 Use the names "${a}" (for "A") and "${b}" (for B) in the text of the properties "a" and "b" of the response. 
 The value of the "winner" property should be  ("a", "b", or "draw")
 Return the 5 most high value differnces
 Only return the YML - Act as a computer software: give me only the requested output, no conversation. use the '-' notation for each item`
    }
  ];
  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages,
     stream: true,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
