"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const uuid_1 = require("uuid");
const openai_1 = require("openai");
dotenv.config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const supabase_js_1 = require("@supabase/supabase-js");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
if (!supabaseKey) {
    throw new Error('Missing SUPABASE_KEY env variable');
}
if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL env variable');
}
if (!openaiKey) {
    throw new Error('Missing OPENAI_API_KEY env variable');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const configuration = new openai_1.Configuration({
    apiKey: openaiKey,
});
app.post("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield supabase
        .from('User')
        .insert([
        {
            id: req.body.id,
        }
    ]);
    res.status(200).send('ok');
}));
app.post('/completion', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt } = req.body;
    const openai = new openai_1.OpenAIApi(configuration);
    const response = yield openai.createCompletion({
        model: "text-davinci-003",
        prompt: "complete the following code snippet" + prompt,
    });
    const completion = response.data.choices[0].text;
    if (!completion) {
        console.warn("was not able to generate a completion");
        return res.status(500).send();
    }
    return res.status(200).json({ completion });
}));
app.post('/sync/documents', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { documents, user } = req.body;
    documents.forEach((doc) => __awaiter(void 0, void 0, void 0, function* () {
        const { error } = yield supabase
            .from('Document')
            .insert([
            {
                id: (0, uuid_1.v4)(),
                timestamp: doc.timestamp,
                content: doc.content,
                filePath: doc.filePath,
                userId: user.id,
            },
        ]);
        if (error) {
            console.error(error);
            return res.status(500).send();
        }
    }));
    res.status(200).send('ok');
}));
app.post('/sync/completion', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { completion, user } = req.body;
    let { data } = yield supabase
        .from('Completion')
        .select('*')
        .eq('id', completion.id);
    if (data && data.length > 0) {
        const { error } = yield supabase
            .from('Completion')
            .update({
            timestamp: completion.timestamp,
            completion: completion.completion,
            accepted: completion.accepted,
            language: completion.language,
            acceptedTimestamp: completion.acceptedTimestamp,
            userId: user.id,
        })
            .eq('id', completion.id);
        if (error) {
            console.error(error);
            return res.status(500).send();
        }
    }
    else {
        const { error } = yield supabase
            .from('Completion')
            .insert([
            {
                id: completion.id,
                timestamp: completion.timestamp,
                completion: completion.completion,
                accepted: completion.accepted,
                language: completion.language,
                acceptedTimestamp: completion.acceptedTimestamp,
                input: completion.input,
                userId: user.id,
            },
        ]);
        if (error) {
            console.error(error);
            return res.status(500).send();
        }
    }
    res.status(200).send('ok');
}));
app.post("/log", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { data, level } } = req;
    if (level === 'error') {
        console.error(data);
    }
    else if (level === 'warn') {
        console.warn(data);
    }
    else {
        console.info(data);
    }
    res.status(200).send('ok');
}));
app.get("/health", (req, res) => {
    res.status(200).send('ok');
});
app.listen(8000, '0.0.0.0', () => {
    console.log('Server started on port 8000');
});
