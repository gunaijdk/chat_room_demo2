// 创建房间
import { NextApiRequest, NextApiResponse } from 'next';
import { RoomAddArgs, RoomAddRes } from '~/server/types'; // 假设类型定义在 ~/types 目录下
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createRoom(roomName: string): Promise<number> {
    const newRoom = await prisma.room.create({
        data: {
            name: roomName,
            messages: { create: [] }, //初始消息emmm
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });
    return newRoom.id;
}

// 创建房间的 API
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RoomAddRes>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ roomId: -1 });
  }

  try {
    // 解析请求体
    const { user, roomName }: RoomAddArgs = req.body;
    // 调用创建房间的逻辑
    const roomId = await createRoom(roomName);
    // 返回创建成功的响应
    res.status(200).json({
      roomId
    });
  } catch (error) {
    // 处理错误情况
    console.error(error);
    res.status(500).json({
      roomId: -1
    });
  }
}