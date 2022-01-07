import * as vscode from 'vscode';
import { Davinci } from './davinci';

export function activate(context: vscode.ExtensionContext) {

	const davinci = new Davinci("");
	let timeout: any = null;

	const disposable = vscode.commands.registerCommand(
		'extension.inline-completion-settings',
		() => {
			vscode.window.showInformationMessage('Show settings');
		}
	);

	context.subscriptions.push(disposable);


	const handleGetCompletions = async( text: string, language: string): Promise<Array<string>> => {
		vscode.window.showInformationMessage("Reteiving Completions")
		if(!text || text.length < 6) return [''];

		const completions = await davinci.complete(text, language);

		return completions;
	}


	const provider: vscode.InlineCompletionItemProvider<vscode.InlineCompletionItem> = {
		provideInlineCompletionItems: async (document, position, context, token) => {
			const text = document.getText(
				new vscode.Range(position.with(undefined, 0), position)
			);


			let suggestions: any = [];


			const completions = await handleGetCompletions(text, document.languageId).catch(err => vscode.window.showErrorMessage(err.toString()));

			if (!completions) return [];

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
	});
}