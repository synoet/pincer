## Running the extension

```
cd extension
npm install
vsce package
code . --enable-proposed-api synoet.vsc-telemetry
```

## Running the server

make sure you set the correct environment variables `['OPENAI_API_KEY', 'SUPABASE_KEY', SUPABASE_URL']`

```
cd server
npm install
npx ts-node-dev index.ts
```
