import React from 'react';
import { useEffect,useState } from 'react';
import "./ChatRoom.css"
import useSWR from 'swr';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import {  roomPreviewInfoSchema, messageSchema, roomAddArgsSchema, roomDeleteArgsSchema } from '../server/types';
import { getFetcher } from './fetcher';
import {trpc} from '../trpc/client'
interface RoomEntryProps {
  isActive:boolean;
  roomId: number;
  room: {
    roomName: string;
    lastMessage?: {
      content: string;
      time: number;
    };
  };
  onRoomClick:(roomId:number,room:RoomEntryProps['room'])=>void
}

interface MessageProps {
  message: {
    sender: string;
    content: string;
    time: number;
  };
}

// RoomEntry 组件
function RoomEntry(props: RoomEntryProps) {
  const activeRoomColor = '#d9d9d9';
  const inactiveRoomColor = '#ffffff';
  const roomColor = props.isActive ? activeRoomColor : inactiveRoomColor;

  // 使用 tRPC mutation 钩子
  const [deleteRoomMutation] = trpc.deleteRoom.useMutaion();//TODO

  const handleDeleteRoom = async () => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        // 调用 mutateAsync 并传递所需的参数
        const response = await deleteRoomMutation.mutateAsync({
          user: 'currentUser', // TODO
          roomId: props.roomId,
        });
        if (response.code === 0) {
          console.log('Room deleted successfully');
        } else {
          throw new Error(response.message || 'Failed to delete room');
        }
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
  };

  return (
    <div
      className="room-entry"
      style={{ backgroundColor: roomColor }}
      onClick={() => props.onRoomClick(props.roomId, props.room)}
    >
      <div className="room-icon" style={{ backgroundColor: roomColor, width: "30px", height: "30px", borderRadius: "50%" }} />
      <div className="room-info">
        <div className="room-name">{props.room.roomName}</div>
        <div className="last-chat-time">
          {props.room.lastMessage ? new Date(props.room.lastMessage.time).toLocaleTimeString() : 'No activity'}
        </div>
      </div>
      <button onClick={handleDeleteRoom} className="delete-room-btn">Delete</button>
    </div>
  );
}



// MessageItem 组件
function MessageItem(props: MessageProps) {
  return (
    <div className="message-item">
      <img src="message-icon.svg" alt="Message Icon" />
      <div className="message-info">
        <div className="sender-name">{props.message.sender}</div>
        <div className="message-content">{props.message.content}</div>
        <div className="message-time">{new Date(props.message.time).toLocaleTimeString()}</div>
      </div>
    </div>
  );
}



export default function ChatRoom() {
  const [selectedRoom, setSelectedRoom] = useState<RoomEntryProps | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [showNewRoomInput, setShowNewRoomInput] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const queryClient = new QueryClient();

  const { data: roomListData, error: roomListError } = useQuery(
    'rooms',
    () => trpc.listRooms.query(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: messageListData, error: messageError } = useQuery(
    ['messages', selectedRoom?.roomId],
    () => selectedRoom ? trpc.message.listMessages.query({ roomId: selectedRoom.roomId }) : null,
    {
      refetchOnWindowFocus: false,
    }
  );

  const [addRoomMutation] = useMutation<
    RoomAddRes,
    Error,
    RoomAddArgs, 
    void
  >(
    ({ user, roomName }) => trpc.room.addRoom.mutateAsync({ user, roomName }),
    {
      onSuccess: () => {
        setShowNewRoomInput(false);
        queryClient.invalidateQueries('rooms'); // 使房间列表失效，触发重新获取
      },
      onError: (error) => {
        console.error('Failed to add room:', error);
      },
    }
  );

  const handleRoomClick = (roomId: number, roomData: RoomEntryProps['room']) => {
    setSelectedRoom({ isActive: true, roomId, room: roomData, onRoomClick: handleRoomClick });
  };

  const handleToggleNewRoomInput = () => {
    setShowNewRoomInput(!showNewRoomInput);
  };

  const handleAddRoom = () => {
    if (!newRoomName) return;
    addRoomMutation({ user: 'currentUser', roomName: newRoomName });
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: MessageProps = {
        message: {
          sender: 'You',
          content: inputValue,
          time: Date.now(),
        },
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
    }
  };

  const renderMessages = () => {
    if (messageError) {
      return <div>Error: {messageError.message}</div>;
    }
    if (!messageListData || messageListData.length === 0) return <div>No messages</div>;

    return messageListData.map((message) => (
      <MessageItem key={message.time} message={message} />
    ));
  };

  useEffect(() => {
    if (roomListData) {
      const firstRoomData = roomListData.rooms[0];
      if (firstRoomData) {
        setSelectedRoom({
          isActive: false,
          roomId: firstRoomData.roomId,
          room: firstRoomData,
          onRoomClick: handleRoomClick,
        });
      }
    }
  }, [roomListData]);

  return (
    <div className="chat-room">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="header-content">
            <span className='message-prompt'>消息：</span>
            <button className='new-room-btn' onClick={handleToggleNewRoomInput}>
              {showNewRoomInput ? '取消' : '+'}
            </button>
          </div>
        </div>
        <ul className="room-list">
          {roomListData?.rooms.map((room) => (
            <RoomEntry
              key={room.roomId}
              isActive={room.roomId === selectedRoom?.roomId}
              roomId={room.roomId}
              room={room}
              onRoomClick={handleRoomClick}
            />
          ))}
        </ul>
      </div>
      {showNewRoomInput && (
        <div className="new-room-input">
          <input
            type="text"
            placeholder="Enter new room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <button onClick={handleAddRoom}>Add Room</button>
        </div>
      )}
      <div className="chat-window">
        {selectedRoom && (
          <>
            <div className="chat-header">
              <img src="room-icon.svg" alt="Room Icon" />
              <h2>{selectedRoom.room.roomName}</h2>
            </div>
            <div className="message-list">
              {renderMessages()}
            </div>
            <div className='chat-input'>
              <input
                type="text"
                placeholder="Type your message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}