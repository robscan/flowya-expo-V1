import { aiConfig, canMakeRequest, getAIConfigError, isAIConfigured } from '@/utils/aiConfig';

export async function generateTranslation(params: {
  text: string;
  sourceLang: 'es';
  targetLang: 'en';
}): Promise<{ translation: string | null; error?: string }> {
  if (!params.text.trim()) {
    return { translation: null, error: 'Text is required' };
  }

  if (!isAIConfigured()) {
    return { translation: null, error: getAIConfigError() || 'OpenAI not configured' };
  }

  if (!canMakeRequest()) {
    return { translation: null, error: 'Rate limit: try again later' };
  }

  const prompt = `Translate the following text from Spanish to English.
Return ONLY JSON with the exact shape:
{
  "translation": ""
}

Text:
${params.text}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          { role: 'system', content: 'You are a precise translator.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { translation: null, error: `OpenAI error: ${errorText}` };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return { translation: null, error: 'Empty response from OpenAI' };
    }

    const parsed = JSON.parse(content);
    const translation = typeof parsed.translation === 'string' ? parsed.translation.trim() : '';
    if (!translation) {
      return { translation: null, error: 'Invalid translation response' };
    }

    return { translation };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown translation error';
    return { translation: null, error: message };
  }
}
