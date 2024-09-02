// types.ts
export interface Message {
    messageId: number;
    roomId: number;
    sender: string;
    content: string;
    time: number;
  }
  
  export interface RoomPreviewInfo {//TODO:preview是否保留
    roomId: number;
    roomName: string | null;
    lastMessage: Message | null;
  }
  
  export interface RoomAddArgs {
    user: string;
    roomName: string;
  }
  
  export interface RoomAddRes {
    roomId: number;
  }
  export interface MessageAddArgs {
    roomId: number;
    content: string;
    sender: string;
  }