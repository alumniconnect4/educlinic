import chalk from 'chalk';
import logSymbols from 'log-symbols';

class Logger {
  private format(
    symbol: string,
    colorFn: (text: string) => string,
    args: any[]
  ) {
    const formattedArgs = args.map((arg) =>
      typeof arg === 'string' ? colorFn(arg) : arg
    );
    console.log(symbol, ...formattedArgs);
  }

  success(...args: any[]) {
    this.format(logSymbols.success, chalk.green, args);
  }

  error(...args: any[]) {
    this.format(logSymbols.error, chalk.red, args);
  }

  warn(...args: any[]) {
    this.format(logSymbols.warning, chalk.yellow, args);
  }

  info(...args: any[]) {
    this.format(logSymbols.info, chalk.blue, args);
  }
}

export const logger = new Logger();
