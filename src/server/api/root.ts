import { initTRPC } from '@trpc/server';
import { createExpressMiddleware } from '@trpc/server/adapters/express'; // 正确的导入
import RoomMessageGetUpdateRouter from '../api/room/message/getUpdate';
import MessageAddRouter from './message/add';
import RoomMessageListRouter from './room/message/list';
import RoomAddRouter from './room/add';
import RoomDeleteRouter from './room/delete';
import RoomListRouter from './room/list';

const t = initTRPC.create();

const appRouter = t.router({
  // 添加房间
  addRoom: RoomAddRouter,
  // 删除房间
  deleteRoom: RoomDeleteRouter,
  // 列出房间信息
  listRooms: RoomListRouter,
  // 获取房间消息更新
  getRoomMessageUpdate: RoomMessageGetUpdateRouter,
  // 添加消息
  addMessage: MessageAddRouter,
  // 列出房间消息
  listRoomMessages: RoomMessageListRouter,
  //设置名字
  setName:setNameRouter
});

export type AppRouter = typeof appRouter;

// 创建 tRPC 请求处理器
const handler = createExpressMiddleware({
  router: appRouter,
});


import express from 'express';
import { setNameRouter } from './setName';
const app = express();
app.use(handler);

// 启动 HTTP 服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});