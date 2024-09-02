import { initTRPC } from '@trpc/server';
import { postRouter } from "~/server/api/routers/post";
import { userRouter } from "~/server/api/routers/user";
import { roomRouter } from "~/server/api/routers/room";
import { messageRouter } from "~/server/api/routers/message";

// 初始化 tRPC 实例
const t = initTRPC.create();

// 创建路由器
export const appRouter = t.router({
  post: postRouter,
  user: userRouter,
  room: roomRouter,
  message: messageRouter,
});

// 导出类型定义
export type AppRouter = typeof appRouter;


export const createCaller = t.createCallerFactory(appRouter);