import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../trpc/client'; // 导入 tRPC 客户端
import { useMutation } from '@tanstack/react-query'; // 正确导入 useMutation 钩子

function SetName() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [setNicknameMutation] = useMutation(
    () => trpc.mutation('setName', { nickname }), // 传递参数
    {
      onSuccess: () => {
        navigate('/index', { replace: true });
      },
      onError: (error:any) => {
        console.error('Mutation error:', error);
      },
    }
  ); // 使用 tRPC 钩子

  const handleSetNickname = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNicknameMutation.mutate(); // 调用 mutate 来执行 mutation
  };

  return (
    <div className="set-name-page">
      <h1>设置昵称</h1>
      <form onSubmit={handleSetNickname}>
        <input
          type="text"
          placeholder="输入您的昵称"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        {setNicknameMutation.error && <p className="error">无法设置昵称: {setNicknameMutation.error?.message}</p>} {/* 显示错误消息 */}
        <button type="submit" disabled={setNicknameMutation.isLoading}>设置昵称并进入</button>
      </form>
    </div>
  );
}

export default SetName;