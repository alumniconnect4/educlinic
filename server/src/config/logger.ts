import chalk from 'chalk';
import logSymbols from 'log-symbols';

type LogFn = (...args: any[]) => void;

const createLogger =
  (symbol: string, color: (s: string) => string): LogFn =>
  (...args) => {
    console.log(
      symbol,
      ...args.map((arg) => (typeof arg === 'string' ? color(arg) : arg))
    );
  };

export const logger = {
  success: createLogger(logSymbols.success, chalk.green),
  error: createLogger(logSymbols.error, chalk.red),
  warn: createLogger(logSymbols.warning, chalk.yellow),
  info: createLogger(logSymbols.info, chalk.blue),
};
