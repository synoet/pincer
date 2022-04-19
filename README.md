# Pincer

Pincer is a tool built to analyze the impact that ai generated code completions have on developer productivity.

`extension`: the vscode-insiders extension that uses the inlineCompletions api to gather input and make completion requests to the server which acts like a proxy for OPENAI codex. It is also responsible for doing various data collection and logging in corelation to productivity.

`bin`: A collection of scripts as well as the compiled vscode-insiders extension

`web`: A very simple web ui to visualize and represent the data collected by the logger and the extension.

`server`: A basic https server for colelcting data from the extension and exposing a couple of views for data visualization

`webtop`: A linuxserver webtop container that runs vs-code insiders with the pincer extension.
