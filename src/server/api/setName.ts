// server/setName.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const t = initTRPC.create();

export const setNameRouter = t.procedure
  .input(z.object({
    nickname: z.string().min(1).max(50),//
  }))
  .mutation(async ({ input }) => {
    try {
      // 验证用户是否存在
      const userExists = await prisma.user.findUnique({
        where: {
          name: input.nickname,
        },
      });

      if (userExists) {
        return { code: 1, message: '昵称已被占用' };
      }

      // 获取当前用户 ID
      const userId = 1; //TODO

      // 更新用户的昵称
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name: input.nickname,
        },
      });

      console.log('昵称设置为:', input.nickname);
      return { code: 0, message: '昵称设置成功', nickname: input.nickname };
    } catch (error:any) {
      console.error('设置昵称失败:', error);
      return { code: 1, message: '设置昵称失败', error: error.message };
    }
  });

export type SetNameRouter = typeof setNameRouter;