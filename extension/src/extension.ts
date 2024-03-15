import * as vscode from "vscode";
import { ExtensionState } from "./state";
import { DocumentChange, Completion } from "shared";
import { getOrCreateUser, initializeUser, getUserSettings } from "./user";
import { getCompletion, syncCompletion } from "./completion";
import { v4 as uuid } from "uuid";
import * as mixpanel from "mixpanel";
import { readVersion } from "./utils";

if (!process.env.MIXPANEL_TOKEN) {
  throw new Error("MIXPANEL_TOKEN is not set");
}

const EXTENSION_VERSION = readVersion();
const NETID = process.env.NETID;
let state: ExtensionState = new ExtensionState();
let mp = mixpanel.init(process.env.MIXPANEL_TOKEN);

function onDidAcceptCompletion(completion: Completion) {
  if (!state.user) {
    mp.track("extension_error", {
      description:
        "completion was accepted but user was not found in local state",
      completion: completion.completion,
      completion_id: completion.id,
      language: completion.language,
      version: EXTENSION_VERSION,
    });
    return;
  }

  const acceptedCompletion = state.setCompletionAsTaken(completion.id);

  if (!acceptedCompletion) {
    mp.track("extension_error", {
      description: "completion was accepted but was not found in local state",
      completion: completion.completion,
      completion_id: completion.id,
      language: completion.language,
      version: EXTENSION_VERSION,
    });
    return;
  }

  mp.track("completion_accepted", {
    distinct_id: state.user.id,
    completion: completion.completion,
    completion_id: completion.id,
    language: completion.language,
    version: EXTENSION_VERSION,
  });

  syncCompletion(acceptedCompletion, state.user);
}

export function activate(_: vscode.ExtensionContext) {
  mp.track("extension_activated", {
    version: EXTENSION_VERSION,
    distinct_id: state.user?.id || "no_user",
  });

  if (!NETID) {
    mp.track("extension_error", {
      version: EXTENSION_VERSION,
      description: "NETID is not set",
      distinct_id: state.user?.id || "no_user",
    });
  }
  const provider: vscode.InlineCompletionItemProvider = {
    async provideInlineCompletionItems(document, position, _context, _token) {
      if (!NETID) {
        console.error("NETID is not set");
        return [];
      }

      if (!state.user) {
        state.user = await getOrCreateUser();
        initializeUser(state.user.id, NETID);
      }

      if (!state.settings) {
        const settings = await getUserSettings(NETID);
        if (!settings) {
          mp.track("extension_error", {
            description: "settings were not returned from server",
            user_id: state.user.id,
            version: EXTENSION_VERSION,
          });
          return [];
        }

        state.settings = settings;
      }

      let shouldGetCompletion: boolean =
        state.settings.enabled && state.shouldGetCompletion();
      let completion: Completion | null = null;

      let documentChange: DocumentChange = {
        id: uuid(),
        content: document.getText(),
        filePath: document.fileName,
        timestamp: Date.now(),
      };

      let currentContext: string = document.getText(
        new vscode.Range(position.line, 0, position.line, position.character)
      );

      state.addDocumentEvent(documentChange);

      // if (!shouldGetCompletion) return [];

      completion = await getCompletion(
        currentContext ?? "",
        document.getText(new vscode.Range(
          0,
          0,
          position.line,
          0
        )) ?? "",
        document.fileName.split(".").pop() ?? "",
        state.user.id,
        NETID
      );

      if (state.shouldSync()) {
        state.sync();
      }

      if (!completion) {
        mp.track("extension_error", {
          description: "completion was not returned from server",
          user_id: state.user.id,
          version: EXTENSION_VERSION,
        });
        return [];
      }

      // store the completion in the logs
      state.addCompletion(completion);
      syncCompletion(completion, state.user);

      mp.track("completion", {
        distinct_id: state.user.id,
        completion: completion.completion,
        language: document.fileName.split(".").pop() || "",
        version: EXTENSION_VERSION,
      });

      const finishingLine = position.line + completion.completion.split("\n").length - 1;
      const finishingCharacter = position.character + completion.completion.split("\n").pop()?.length || 0;

      const replaceRange = new vscode.Range(
        position.line,
        position.character,
        finishingLine,
        finishingCharacter 
      );

      return [
        new vscode.InlineCompletionItem(completion.completion, replaceRange, {
          title: "",
          command: "pincer.acceptCompletion",
          arguments: [completion],
        }),
      ];
    },
  };

  vscode.languages.registerInlineCompletionItemProvider(
    { pattern: "**" },
    provider
  );

  vscode.commands.registerCommand(
    "pincer.acceptCompletion",
    onDidAcceptCompletion
  );
}
