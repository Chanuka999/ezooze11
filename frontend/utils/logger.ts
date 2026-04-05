import { Page } from '../types';

interface LogEntry {
  timestamp: string;
  page: Page;
  action: string;
  userAgent: string;
  referrer: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  log(page: Page, action: string = 'visit') {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      page,
      action,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct',
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${entry.timestamp}] ${action.toUpperCase()} - Page: ${page}`);
    }

    // Send to backend
    this.sendToBackend(entry);

    return entry;
  }

  private async sendToBackend(entry: LogEntry) {
    try {
      await fetch('http://localhost:5000/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send log to backend:', error);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
