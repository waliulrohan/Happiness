import { Stack } from '@mui/material';
import React from 'react';
import ChatItem from '../shared/ChatItem';
import { useMyContext } from '../../utils/context';

const ChatList = ({
    chats=[],
    chatId,
    chatOnlineUsers = [],
    onlineUsers=[],
    newMessageAlert = [
        {
            chatId: '',
            count: 0,
        }
    ],
    w="100%",
    handleDeleteChat,
}) => {
    const { myData } = useMyContext();
    return (
            <Stack height={'100%'} overflow={'auto'} width={w} bgcolor='#f7fdf0' >
                {chats.map((data ,i)=>{
                    const {avatar , name , _id , groupChat , members} = data;
                    const newAlert = newMessageAlert.find(
                        ({ chatId }) => chatId === _id
                      );
                      const isChatOnline = members?.some((member) => member !== myData._id && chatOnlineUsers.includes(member) );
                      const isOnline = members?.some((member) => member !== myData._id && onlineUsers.includes(member))
                    return <ChatItem
                    index={i}
                     newAlert={newAlert}
                     isChatOnline={isChatOnline}  
                     isOnline={isOnline}
                      avatar = {avatar}
                      name={name}
                      _id={_id}
                      key={_id}
                      groupChat = {groupChat}
                      sameSender ={chatId === _id}
                      handleDeleteChat={handleDeleteChat}
                      />
                })}
            </Stack>
    );
};

export default ChatList;