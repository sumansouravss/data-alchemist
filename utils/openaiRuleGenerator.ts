export async function generateRulesFromOpenAI(tasks: any[]) {
  const prompt = `Given the following tasks (with TaskID and dependencies), suggest 3-5 scheduling rules in this JSON format: 
  [{ "type": "dependency", "after": "T2", "before": "T1" }, ...]
  
  Tasks:
  ${JSON.stringify(tasks.slice(0, 10), null, 2)}
  `;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    }),
  });

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content ?? '';
  try {
    const rules = JSON.parse(content);
    if (Array.isArray(rules)) return rules;
  } catch (e) {
    console.warn('Failed to parse AI response:', content);
  }
  return [];
}
