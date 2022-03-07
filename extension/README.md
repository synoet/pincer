# Extension

### Intro

The Pincer extension utilizes the vscode proposed inlineCompletion api, to provide inline completions.

> The extension current requires you to use code-insiders to allow the proposed api to function.

Occassionally it will require you to grant api permissions, to do this run the following.

`code-insiders --no-sandbox --enable-proposed-api nysteo.davinci`

## How to compile the extension
`cd extension` cd into the extension folder

`npm install` install necesarry dependencies

`npm run compile //compile `

## How to package and run the extension
`npm install -g vsce` visual studio package

`vsce package` this should have generated a .vsix file in the extension folder
