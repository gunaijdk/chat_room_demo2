// 添加消息
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import {MessageAddArgs} from '~/server/types'
import { time } from 'console';

const prisma = new PrismaClient();

// 添加消息的 API 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ code: -1 });
  }
  try {

    const { roomId, content, sender }: MessageAddArgs = req.body;

    await createMessage(roomId, content, sender);

    res.status(200).json({ code: 0 });
  } catch (error) {
    // 处理错误情况
    console.error(error);
    res.status(500).json({ code: -1});
  }
}

// 添加消息的函数
async function createMessage(roomId: number, content: string, sender: string): Promise<void> {
  await prisma.Message.create({
    data: {
        roomId: roomId,
        content: content,
        sender: sender,
        time: time,
        room: {
          connect: {
            id: roomId
          }
        },
        user: {
          connect: {
            name: sender
          }
        }
      }
    });
}