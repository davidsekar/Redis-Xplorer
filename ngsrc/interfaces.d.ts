declare var acquireVsCodeApi: any;

interface ProcMessage {
  name: string;
  data: any;
}

interface VscodeMessageData<T> {
  command: string;
  data: T;
}

interface Vscode {
  postMessage<T>(message: ProcMessage): void;
}
