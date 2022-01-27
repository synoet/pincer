import * as vscode from 'vscode';


const PREFIX = 'Davinci: ';

export class StatusBar {
    name: string = 'Davinci Completion';
    command: string = 'extension.inline-completion-settings';
    text: string = 'Davinci: ✔️';
    bar: any;

    constructor(){
        this.bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.bar.text = this.text;
        this.bar.command = this.command;
        this.bar.name = 'Davinci Completion';
        this.bar.show();
    }

    showInProgress(language: string){
        this.bar.text =  PREFIX + `Loading Completion (${language})`
        this.bar.show();
    }

    showSuccess(){
        this.bar.text = this.text;
        this.bar.show();
    }

    showFailed(){
        this.bar.text = PREFIX + '✘';
        this.bar.show();
    }

    showEmpty(language: string){
        this.bar.text = PREFIX + `No Results Found (${language})`
    }
}