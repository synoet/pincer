import * as vscode from 'vscode';
import { ExtensionState } from './state';
import {DocumentChange, Completion} from 'shared';
import { getOrCreateUser, initializeUser} from './user';
import { getCompletion, syncCompletion} from './completion'; 
import {v4 as uuid} from 'uuid';
import { Logger } from './logging';

let state: ExtensionState  = new ExtensionState();
const logger = new Logger();


export function activate(_: vscode.ExtensionContext) {
	const provider: vscode.InlineCompletionItemProvider = {
		async provideInlineCompletionItems(document, position, context, token) {
      if (!state.user) {
        state.user = await getOrCreateUser();
        initializeUser(state.user.id);
      }

      logger.info(`user id: ${state.user.id}`);


      let shouldGetCompletion: boolean = state.shouldGetCompletion();
      let completion: Completion | undefined = undefined;

      // the current state of the document
      let documentChange: DocumentChange = {
        id: uuid(),
        content: document.getText(),
        filePath: document.fileName,
        timestamp: Date.now(),
      }

      // text up until the current position
      let currentContext: string = document.getText(
        new vscode.Range(position.with(undefined, 0), position)
      )

      // if the user hasn't types 5 characters, don't get a completion
      if (documentChange.content.length < 5) {
        shouldGetCompletion = false;
      }

      state.addDocumentEvent(documentChange);

      // if we havent synced their documents in 3 seconds then sync them
      if (state.shouldSync()) {
        state.sync()
      }

      if (!shouldGetCompletion) return [];

      completion = await getCompletion(
        currentContext,
        document.getText(),
        document.fileName.split('.').pop() || "",
      );

      if (!completion) {
        logger.warn("completion is undefined");
        return [];
      }

      // store the completion in the logs
      state.addCompletion(completion);
      syncCompletion(completion, state.user);

      const result: vscode.InlineCompletionList = {
				items: [
          {
            insertText: completion.completion,
            range: new vscode.Range(position.line, position.character, position.line, position.character + completion.completion.length),
          }
        ],
				commands: [],
			};



			return result;
		},

    handleDidPartiallyAcceptCompletionItem(completionItem: vscode.InlineCompletionItem) {
      // try and fetch the original completion by its text
      const completion = state.setCompletionAsTaken(completionItem.insertText as string);

      if (!completion) {
        logger.warn("completion is undefined");
        return;
      }

      // update the completion and mark it as accepted
      if (!state.user) {
        logger.error("user is undefined");
        return;
      }

      syncCompletion(completion, state.user)
    }
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);
}

