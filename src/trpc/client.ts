// trpc/client.ts
import { createTRPCClient } from '@trpc/client';
import { httpLink } from '@trpc/client';
import {AppRouter} from '../server/api/root'; // 导入后端定义的路由器类型

// 创建一个 tRPC 客户端
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: '/api/trpc', // 后端 tRPC 端点
    }),
  ],
});