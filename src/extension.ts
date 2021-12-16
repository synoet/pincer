import * as vscode from 'vscode';
import { Davinci } from './davinci';
import { StatusBar } from './status';

export function activate(context: vscode.ExtensionContext) {

	const davinci = new Davinci("");
	const statusBar = new StatusBar();
	let timeout: any = null;

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

			let suggestions: any = [];

			// if user is typing we keep clearing previous timeouts
			clearTimeout(timeout);

			// wait until user stopped typing to run completion
			timeout = setTimeout(async () => {

				statusBar.showInProgress(document.languageId);

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

			}, 2000)

			return suggestions as any;
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);

	vscode.window.getInlineCompletionItemController(provider).onDidShowCompletionItem(e => {	
		statusBar.showSuccess();
	});
}
