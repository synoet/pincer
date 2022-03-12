import * as vscode from "vscode";
import * as config from "./config";
import { StatusBar } from "./lib/status";
import { Clock } from "./lib/clock";
import { Logger } from "./lib/logger";
import { includesCompletions, timeFromNow } from "./lib/utils";
import { ACTIVATED } from "./config";
import axios from "axios";

export async function activate(context: vscode.ExtensionContext) {
  const status = new StatusBar();
  const clock = new Clock();
  const logger = new Logger();

  const controller = new AbortController();

  const abortCompletionRequest = () => {
    controller.abort();
    status.clear();
  };

  await logger.initSession();

  const recentCompletions: any = [];
  let currentDocument = "";

  let counter = 0;

  const sleep = (ms = 2500) => new Promise((r) => setTimeout(r, ms));

  const disposable = vscode.commands.registerCommand(
    "extension.inline-completion-settings",
    () => {
      vscode.window.showInformationMessage("Show settings");
    }
  );

  context.subscriptions.push(disposable);

  const handleGetCompletions = async (
    textContext: string,
    language: string
  ): Promise<Array<string>> => {
    status.showInProgress(language);

    const completions = await axios
      .post(
        `${config.SERVER_URI}/complete`,
        {
          prompt: textContext,
          language: language,
        },
        {
          signal: controller.signal,
        }
      )
      .then((res) => res.data.suggestions)
      .catch(async (err: Error) => {
        vscode.window.showErrorMessage(err.toString());
        await logger.error(`Failed to get completion (Extension-47)`);
      });

    return completions;
  };

  const provider: vscode.InlineCompletionItemProvider<vscode.InlineCompletionItem> =
    {
      provideInlineCompletionItems: async (document, position) => {
        abortCompletionRequest();

        currentDocument = document.getText(
          new vscode.Range(position.with(0, 0), position)
        );

        counter++;
        let localCounter = counter;
        await sleep(750);

        if (localCounter < counter) return;

        const lastTime = await logger.getLastDocumentTime();

        if (!lastTime || timeFromNow(lastTime) > 1) {
          await logger.pushDocumentLog({
            document: currentDocument,
            timeStamp: new Date(),
          });
        }

        if (!ACTIVATED) return;

        logger.clear();
        clock.clear();
        clock.newTimer("timeFromKeystoke").startTimer();

        const text = document.getText(
          new vscode.Range(position.with(undefined, 0), position)
        );

        let textContext = document.getText(
          new vscode.Range(position.with(0, 0), position)
        );

        let completions = (await handleGetCompletions(
          textContext,
          document.languageId
        ).catch((err) =>
          vscode.window.showErrorMessage(err.toString())
        )) as Array<string>;

        if (!completions) {
          status.showEmpty(document.languageId);
        }

        recentCompletions.push(completions[0]);

        logger.addCompletionLog({
          input: text,
          language: document.languageId,
          suggestion: completions[0],
          taken: false,
        });

        logger.pingSession();
        status.showSuccess();

        return completions.map((completion: string, idx: number) => ({
          text: text + completion,
          trackindId: `Completion ${idx}`,
          range: new vscode.Range(position.with(undefined, 0), position),
        })) as Array<vscode.InlineCompletionItem>;
      },
    };

  vscode.languages.registerInlineCompletionItemProvider(
    { pattern: "**" },
    provider
  );

  vscode.window
    .getInlineCompletionItemController(provider)
    .onDidShowCompletionItem(async () => {
      clock.endTimer("timeFromKeystoke");

      await sleep();

      if (includesCompletions(currentDocument, recentCompletions))
        logger.setRecentLogAsTaken();

      logger.takeClockReport(clock.report());
      logger.sendSessionLogs();
    });
}
