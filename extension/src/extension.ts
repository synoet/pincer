import * as vscode from 'vscode';
import { Davinci } from './lib/davinci';
import {StatusBar} from './lib/status';
import {Clock} from './lib/clock';
import {Logger} from './lib/logger';

require('dotenv').config();

export async function activate(context: vscode.ExtensionContext) {
	const davinciOutput = vscode.window.createOutputChannel("Davinci");

  const openaiKey = process.env.OPENAI_KEY;
	const davinci = new Davinci(openaiKey || "");
  const status = new StatusBar();
  const clock = new Clock();
  const logger = new Logger();

  logger.initSession();

  let counter = 0;
  
  const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));


	const disposable = vscode.commands.registerCommand(
		'extension.inline-completion-settings',
		() => {
			vscode.window.showInformationMessage('Show settings');
		}
	);

	context.subscriptions.push(disposable);

	const handleGetCompletions = async( text: string, textContext: string, language: string): Promise<Array<string>> => {
    status.showInProgress(language);

    davinciOutput.appendLine(textContext);

		const completions = await davinci.complete(text, textContext, language);

		return completions;
	};

	const provider: vscode.InlineCompletionItemProvider<vscode.InlineCompletionItem> = {
		provideInlineCompletionItems: async (document, position, context, token) => {
      counter++;
      let localCounter = counter;
      await sleep();

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

	vscode.window.getInlineCompletionItemController(provider).onDidShowCompletionItem(e => {
    clock.endTimer("timeFromKeystoke");
		davinciOutput.appendLine("Gave Inline Reccomendation");
    logger.takeClockReport(clock.report())
    logger.sendSessionLogs();
	});
}
