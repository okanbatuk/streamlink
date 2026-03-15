export interface Logger {
  error(data: object, message: string): void;
  warn(data: object, message: string): void;
  info(data: object, message: string): void;
  debug(data: object, message: string): void;
}
