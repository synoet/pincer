import axios from 'axios';

export class Logger {
  info(message: string) {
    axios.post('https://pincer-server.fly.dev/log', { data: message, level: 'info' });
  }
  warn(message: string) {
    axios.post('https://pincer-server.fly.dev/log', { data: message, level: 'warn' });
  }
  error(message: string) {
    axios.post('https://pincer-server.fly.dev/log', { data: message, level: 'error' });
  }
}
