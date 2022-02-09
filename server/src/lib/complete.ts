import axios from 'axios';

export const complete = async (prompt: any, language: any, key:any): Promise<any> => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    }
  }

  const suggestions = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
    prompt: prompt,
    max_tokens: 64,
    temperature: .13,
    top_p: 1,
    stream: false,
    stop: ["function", "line"],
  }, config)
    .then((res) => res.data)
    .then((res) => {
      return res.choices.map((choice: any) => choice.text);
    })
    .catch((err) => console.log(err));

  return suggestions || [''];
}
