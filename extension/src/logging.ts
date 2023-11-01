import axios from "axios";

export class Logger {
  info(message: string) {
    axios.post(
      "https://pincer-server.fly.dev/log",
      {
        data: message,
        level: "info",
      },
      { headers: { "auth-key": process.env.AUTH_KEY } }
    );
  }
  warn(message: string) {
    axios.post(
      "https://pincer-server.fly.dev/log",
      {
        data: message,
        level: "warn",
      },
      { headers: { "auth-key": process.env.AUTH_KEY } }
    );
  }
  error(message: string) {
    axios.post(
      "https://pincer-server.fly.dev/log",
      {
        data: message,
        level: "error",
      },
      { headers: { "auth-key": process.env.AUTH_KEY } }
    );
  }
}
