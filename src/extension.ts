import * as vscode from 'vscode';
import { Davinci } from './davinci';
import { StatusBar } from './status';

export function activate(context: vscode.ExtensionContext) {

	const davinci = new Davinci("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");
	const statusBar = new StatusBar();

	const disposable = vscode.commands.registerCommand(
		'extension.inline-completion-settings',
		() => {
			vscode.window.showInformationMessage('Show settings');
		}
	);

	context.subscriptions.push(disposable);


	const handleGetCompletions = async( text: string, language: string): Promise<Array<string>> => {
		if(!text || text.length < 5) return [''];

		const completions = await davinci.complete(text, language);

		return completions;
	}


	const provider: vscode.InlineCompletionItemProvider<vscode.InlineCompletionItem> = {
		provideInlineCompletionItems: async (document, position, context, token) => {
			const text = document.getText(
				new vscode.Range(position.with(undefined, 0), position)
			);

			statusBar.showInProgress(document.languageId);

			const suggestions = [];

			const completions = await handleGetCompletions(text, document.languageId)
			.catch(err => vscode.window.showErrorMessage(err.toString()));

			if (!completions || !completions.length) {
				statusBar.showEmpty(document.languageId);
				return []
			}

			for (let i = 0; i < completions.length; i++) {
				suggestions.push({
				  text: text + completions[i],
				  trackingId: `Completion ${i}`,
				  range: new vscode.Range(position.with(undefined, 0), position)
				});
			  }
		
			  return suggestions as any;
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);

	vscode.window.getInlineCompletionItemController(provider).onDidShowCompletionItem(e => {	
		statusBar.showSuccess();
	});
}
