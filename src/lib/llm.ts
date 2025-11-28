/**
 * LLM utility using Azure OpenAI
 */

const AZURE_OPENAI_API_KEY = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_ENDPOINT = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
const AZURE_API_VERSION = '2024-08-01-preview';

export async function llm(prompt: string, model: string = 'gpt-4o', parseJson: boolean = false): Promise<string> {
  // Check if Azure OpenAI is configured
  if (!AZURE_OPENAI_API_KEY || !AZURE_OPENAI_ENDPOINT) {
    console.warn('Azure OpenAI not configured. Please set VITE_AZURE_OPENAI_API_KEY and VITE_AZURE_OPENAI_ENDPOINT in .env file');
    
    // Return mock response for development
    if (parseJson) {
      return JSON.stringify({ 
        suggestions: [],
        message: 'Azure OpenAI not configured - using mock data'
      });
    }
    
    return 'Azure OpenAI not configured. Please add your API key and endpoint to .env file.';
  }

  try {
    // Construct the Azure OpenAI endpoint URL
    const endpoint = AZURE_OPENAI_ENDPOINT.endsWith('/') 
      ? AZURE_OPENAI_ENDPOINT 
      : `${AZURE_OPENAI_ENDPOINT}/`;
    
    const url = `${endpoint}openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant specializing in meal planning and nutrition for institutional catering.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: parseJson ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', response.status, errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return content;
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    
    // Return error message or mock data
    if (parseJson) {
      return JSON.stringify({
        error: true,
        message: 'Failed to connect to Azure OpenAI',
      });
    }
    
    throw error;
  }
}
