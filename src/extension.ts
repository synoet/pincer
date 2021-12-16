import * as vscode from 'vscode';
import { Davinci } from './davinci';

export function activate(context: vscode.ExtensionContext) {

	const davinci = new Davinci("");

	const disposable = vscode.commands.registerCommand(
		'extension.inline-completion-settings',
		() => {
			vscode.window.showInformationMessage('Show settings');
		}
	);

	context.subscriptions.push(disposable);


	const handleGetCompletions = async( text: string): Promise<Array<string>> => {
		vscode.window.showInformationMessage("Reteiving Completions")
		if(!text || text.length < 6) return [];

		return await davinci.complete(text);
	}


	const provider: vscode.InlineCompletionItemProvider<vscode.InlineCompletionItem> = {
		provideInlineCompletionItems: async (document, position, context, token) => {
			const text = document.getText(
				new vscode.Range(position.with(undefined, 0), position)
			);

			const suggestions = await handleGetCompletions(text);

			const items = suggestions.length ? suggestions.map((suggestion: string) => {
				return {
					text: suggestion,
					range: new vscode.Range(position.translate(0, -1), position),
				};
			}): [];

			return { items };
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);

	vscode.window.getInlineCompletionItemController(provider).onDidShowCompletionItem(e => {
		console.log(e);
	});
}
