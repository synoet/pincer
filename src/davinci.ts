import axios from 'axios';
import * as vscode from 'vscode';


export class Davinci {
    key: string = '';
    context: string = '';
    temp: number = 0;
    maxTokens: number = 0;
    freqPen: number = 0;
    presPen: number = 0;
    stop: Array<string> = [];


    constructor(key: string, context: string, temp: number, maxTokens: number, freqPen: number, presPen: number, stop: Array<string>) {
        this.key = key;
        this.context = context;
        this.temp = temp;
        this.maxTokens = maxTokens;
        this.freqPen = freqPen;
        this.presPen = presPen;
        this.stop = stop;
    }

    async complete(text: string): Promise<Array<string>> {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.key}`
            }
        }

        let suggestions: Array<string> = [];

        await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions',
        { prompt: text, max_tokens: this.maxTokens, temp: this.temp, stop: this.stop }, config)
            .then((res: any) => res.json())
            .then((res) => {
                suggestions = res;
                console.log(suggestions);
            })
            .catch((err) => vscode.window.showErrorMessage(err.toString()))
        
        return suggestions as Array<string>;

    }

}