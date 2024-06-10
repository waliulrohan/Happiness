import moment from 'moment';
import React, { memo } from 'react';
import './shared.css'
import { Box } from '@mui/material';
import { fileFormat } from '../../lib/features';
import RenderAttachment from './RenderAttachment';
import { MessageItemEasterEgg } from '../../lib/esaterEgg';


const MessageItem = ({ message, user }) => {
    const { sender, content, attachments = [], createdAt } = message;
    const sameSender = sender?._id === user?._id;
    const timeAgo = moment(createdAt).fromNow()
    return (
        <div
            onDoubleClick={()=> MessageItemEasterEgg(content)}
            className='messageItem'
            style={{
                alignSelf: sameSender ? "flex-end" : "flex-start",
                backgroundColor: sameSender ? "#eaefe6" : "#bbe39f5c",
                color: "black",
                borderRadius: sameSender ? "5px 5px 0px 5px" : "5px 5px 5px 0px" ,
                padding: "0.5rem",
                width: "fit-content",
                maxWidth: "95%"
            }}
        >
            {
                !sameSender && <p className='message-sender' >{sender.name}</p>
            }

            {
                content && <p className='message-content' >{content}</p>
            }
            {attachments.length > 0 &&
                attachments.map((attachment, index) => {
                    const url = attachment.url;
                    const file = fileFormat(url);

                    return (
                        <Box key={index}>
                            <a
                                href={url}
                                target="_blank"
                                download
                                style={{
                                    color: "black",
                                }}
                            >
                                <RenderAttachment file={file} url={url}/>
                            </a>
                        </Box>
                    );
                })}

             <p className="time-stamp">{timeAgo}</p>   

        </div>
    );
};

export default memo(MessageItem);