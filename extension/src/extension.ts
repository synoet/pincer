import * as vscode from 'vscode';
import * as config from './config';
import {StatusBar} from './lib/status';
import {Clock} from './lib/clock';
import {Logger} from './lib/logger';
import axios from 'axios';

require('dotenv').config();

export async function activate(context: vscode.ExtensionContext) {
	const davinciOutput = vscode.window.createOutputChannel("Davinci");

  const status = new StatusBar();
  const clock = new Clock();
  const logger = new Logger();

  await logger.initSession();
  logger.debug('OUT');

  const recentCompletions: any = [];
  let currentDocument = '';

  let counter = 0;
  
  const sleep = (ms = 2500) => new Promise((r) => setTimeout(r, ms));


	const disposable = vscode.commands.registerCommand(
		'extension.inline-completion-settings',
		() => {
			vscode.window.showInformationMessage('Show settings');
		}
	);

	context.subscriptions.push(disposable);

	const handleGetCompletions = async( text: string, textContext: string, language: string): Promise<Array<string>> => {
    await logger.debug("EXTENSION handleGetCompletions");
    status.showInProgress(language);

    davinciOutput.appendLine(textContext);

    const completions = await axios.post(`${config.SERVER_URI}/complete`, {
      prompt: textContext,
      language: language,
    })
    .then((res)=>res.data.suggestions)
    .catch((err) => vscode.window.showErrorMessage(err.toString()));

    await axios.post(`${config.SERVER_URI}/debug`, {
      completions: completions,
    });

		return completions;
	};

	const provider: vscode.InlineCompletionItemProvider<vscode.InlineCompletionItem> = {
		provideInlineCompletionItems: async (document, position, context, token) => {
      currentDocument = document.getText(
        new vscode.Range(position.with(0, 0), position)
      );

      counter++;
      let localCounter = counter;
      await sleep(750);

      if (localCounter < counter) return;

      logger.clear();
      clock.clear();
      clock.newTimer("timeFromKeystoke").startTimer();

			const text = document.getText(
				new vscode.Range(position.with(undefined, 0), position)
			);

			let textContext = '';
			
      textContext = document.getText(
        new vscode.Range(position.with(0, 0), position)
      );

			if (textContext != '') davinciOutput.appendLine("CONTEXT: \n" + textContext);

			const suggestions: any = [];
      let completions: any = [];

      davinciOutput.appendLine("HIT");

      completions = await handleGetCompletions(
        text,
        textContext,
        document.languageId
        ).catch(err => vscode.window.showErrorMessage(err.toString()));

			if (!completions) {
        return [];
      }

      recentCompletions.push(`${completions[0]}`);

       logger.addCompletionLog({
         input: text,
         language: document.languageId,
         suggestion: completions[0],
         taken: false,
      })

      logger.pingSession();

      status.showSuccess();

			for (let i = 0; i < completions.length; i++) {
				suggestions.push({
				text: text + completions[i],
				trackingId: `Completion ${i}`,
				range: new vscode.Range(position.with(undefined, 0), position)
				})
			}

			return suggestions as any;
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);

	vscode.window.getInlineCompletionItemController(provider).onDidShowCompletionItem(async (e) => {
    clock.endTimer("timeFromKeystoke");
    await sleep();
    if(currentDocument.split('\n').join('').includes(recentCompletions.pop().split('\n').join(''))) {
      logger.setRecentLogAsTaken();
    }
		davinciOutput.appendLine("Gave Inline Reccomendation");
    logger.takeClockReport(clock.report())
    logger.sendSessionLogs();
	});
}
