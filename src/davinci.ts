import axios from 'axios';
import * as vscode from "vscode";
import * as https from 'https';


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export class Davinci {
    key: string = '';
    topP: number = 1;
    temp: number = .7;
    maxTokens: number = 64;
    bestOf: number = 1;
    stop: Array<string> = ["line"];


    constructor(key: string, topP?: number, temp?: number, maxTokens?: number, stop?: Array<string>) {
        this.key = key;
        if (topP) this.topP = topP
        if (temp) this.temp = temp;
        if (maxTokens) this.maxTokens = maxTokens;
        if (stop) this.stop = stop;
    }

    async complete(text: string, language: string): Promise<Array<string>>{
        const agent = new https.Agent({
            rejectUnauthorized: false,
          });

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.key}`
            },
            httpsAgent: agent,
        }

        text = `* ${language}\n*/\n ${text}`;

        const suggestions: string[] | void | undefined = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', { 
            prompt: text, 
            max_tokens: this.maxTokens,
            temperature: this.temp,
            top_p: this.topP,
            n: 1,
            stream: false,
            stop: this.stop
        }, config)
            .then((res: any) => res.data)
            .then((res) => {
                return res?.choices.map((choice: any) => choice.text);
            })
            .catch((err) => vscode.window.showErrorMessage(err.toString()))
        
        if (!suggestions) return [''];
        return suggestions as Array<string>;
    }

}