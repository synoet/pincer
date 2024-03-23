import axios from "axios";

export class Logger {
  info(message: string) {
    axios.post(
      `${process.env.BASE_URL}/log`,
      {
        data: message,
        level: "info",
      },
      { headers: { "auth-key": process.env.AUTH_KEY } }
    );
  }
  warn(message: string) {
    axios.post(
      `${process.env.BASE_URL}/log`,
      {
        data: message,
        level: "warn",
      },
      { headers: { "auth-key": process.env.AUTH_KEY } }
    );
  }
  error(message: string) {
    axios.post(
      `${process.env.BASE_URL}/log`,
      {
        data: message,
        level: "error",
      },
      { headers: { "auth-key": process.env.AUTH_KEY } }
    );
  }
}
