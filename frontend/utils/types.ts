// types.ts
export interface Message {
    id: string;
    sender: "user" | "bot" | "bot-temp";
    content: string;
    timestamp?: number;
  }