import axios from 'axios';

export class Davinci {
    key: string = '';
    topP: number = 1;
    temp: number = 1;
    maxTokens: number = 30;
    stop: Array<string> = ["function"];


    constructor(key: string, topP?: number, temp?: number, maxTokens?: number, stop?: Array<string>) {
        this.key = key;
        if (topP) this.topP = topP
        if (temp) this.temp = temp;
        if (maxTokens) this.maxTokens = maxTokens;
        if (stop) this.stop = stop;
    }

    async complete(text: string): Promise<Array<string>> {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.key}`
            }
        }


        const suggestions: string[] | void | undefined = await axios.post('https://api.openai.com/v1/engines/davinci/completions',
        { prompt: text, max_tokens: this.maxTokens, temperature: this.temp,top_p: this.topP, n: 1, stream: false, stop: this.stop }, config)
            .then((res: any) => res.data)
            .then((res) => {
                return res?.choices.map((choice: any) => choice.text);
            })
            .catch((err) => console.log(err))
        
        console.log(suggestions);
        return suggestions as Array<string>;

    }

}
