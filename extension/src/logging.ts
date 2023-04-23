import axios from 'axios';

export class Logger {
  info(message: string) {
    axios.post('http://localhost:8000/log', { data: message, level: 'info' });
  }
  warn(message: string) {
    axios.post('http://localhost:8000/log', { data: message, level: 'warn' });
  }
  error(message: string) {
    axios.post('http://localhost:8000/log', { data: message, level: 'error' });
  }
}
