
import { Box } from '@mui/material';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarCard from './AvatarCard';

const ChatItem = ({
    avatar =[],
    name,
    _id,
    groupChat = false,
    sameSender,
    isChatOnline,
    newAlert,
    index = 0,
    handleDeleteChat,
    isOnline,
}) => {
    const navigate = useNavigate()
    return (
        <div 
          onContextMenu={(e)=> handleDeleteChat(e , _id , groupChat )}
          onClick={()=> navigate(`/chat/${_id}`)}
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            backgroundColor: sameSender ? "#c8d2bb" : "unset",
            color: sameSender ? "white" : "unset",
            position: "relative",
            padding: "1rem",
          }}
        >
            <AvatarCard isOnline={isOnline} avatar={avatar}/>
            
            <p>{name}</p>
            {
              newAlert &&  
              <p>{newAlert.count} new message</p>
            }
        {isChatOnline && (
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "green",
              position: "absolute",
              top: "50%",
              right: "1rem",
              transform: "translateY(-50%)",
            }}
          />
        )}
        </div>
    );
};

export default memo(ChatItem);