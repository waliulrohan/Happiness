import React, { useCallback, useEffect, useRef, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import './pages.css'
import { IconButton, Stack } from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import MessageItem from '../components/shared/MessageItem';
import FileMenu from '../components/dialogs/FileMenu';

import { getSocket } from '../utils/socketContext';
import axios from 'axios';
import { server } from '../components/constants/config';
import { ALERT, CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE, START_TYPING, STOP_TYPING } from '../components/constants/event'
import { useSocketEvents } from '../hooks/hook';
import { useMyContext } from '../utils/context';
import { useFetchData, useInfiniteScrollTop } from '6pp';
import { TypingLoader } from '../components/layout/Loaders';
import { useNavigate } from 'react-router-dom';
import { notifyError } from '../lib/Toasting';
import messageSound from '../assets/sound/messageSound.mp3'

const messageTone = new Audio(messageSound)

const Chat = ({ chatId }) => {
  const navigate = useNavigate();
  const socket = getSocket();
  const { myData, newMessageAlert, setNewMessageAlert } = useMyContext()

  const [isFileOpen, setIsFileOpen] = useState(false)
  const [fileMenuAnchor, setFileMenuAnchor] = useState(false)

  const containerRef = useRef(null)
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([])
  const [page, setPage] = useState(1)

  const [chatDetails, setChatDetails] = useState({})
  const chatDetailsRef = useRef(chatDetails)

  const [IamTyping, setIamTyping] = useState(false)
  const [userTyping, setUserTyping] = useState(false)
  const typingTimeout = useRef(null)

  const bottomRef = useRef(null)

  const fetchChatDetails = async () => {
    try {
      const { data } = await axios.get(`${server}/api/v1/chat/${chatId}`, { withCredentials: true });
      setChatDetails(data.chat);
      chatDetailsRef.current = data.chat;
    } catch (err) {
      notifyError(err.response.data.message || "Something went wrong")
    }
  };

  const cacheKey = `chat_messages_${chatId}_page_${page}`;

  const { data: oldMessagesChunk, error, clearCache } = useFetchData(
    `${server}/api/v1/chat/messages/${chatId}?page=${page}`,
    cacheKey,
    [chatId, page]);

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk?.totalPages,
    page,
    setPage,
    oldMessagesChunk?.messages
  );

  useEffect(() => {
    if (error) return navigate('/')
  }, [error])

  useEffect(() => {
    fetchChatDetails();
    setNewMessageAlert(newMessageAlert.filter(item => item.chatId !== chatId));
    clearCache()
    return () => {
      clearCache()
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      socket.emit(CHAT_LEAVED, { userId: myData._id, members: chatDetailsRef.current.members });
    };
  }, [chatId]);

  useEffect(() => {
    if (chatDetails.members && chatDetails.members.length > 0) {
      socket.emit(CHAT_JOINED, { userId: myData._id, members: chatDetails.members });
    }
  }, [chatDetails]);

  const handleMessageInput = (e) => {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket.emit(START_TYPING, { members: chatDetails.members, chatId });
      setIamTyping(true)
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current)

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members: chatDetails.members, chatId });
      setIamTyping(false)
    }, [2000])
  }

  // socket handling

  const newMessageHandler = useCallback((data) => {
    if (data.chatId === chatId) {
      setMessages(prev => [...prev, data.message]);
      messageTone.play();
    }
  }, [chatId])

  const startTypingListener = useCallback((data) => {
    if (data.chatId === chatId) {
      setUserTyping(true)
    }
  }, [chatId])

  const stopTypingListener = useCallback((data) => {
    if (data.chatId === chatId) {
      setUserTyping(false)
    }
  }, [chatId])

  const alertListener = useCallback((data) => {
    if (data.chatId === chatId) {
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "randomIdCauseThisIsNotImportant",
          name: "admin",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, messageForAlert])
    }
  }, [chatId])

  const eventHandler = {
    [NEW_MESSAGE]: newMessageHandler,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
    [ALERT]: alertListener,
  }

  useSocketEvents(socket, eventHandler)

  const submitHandler = (e) => {
    e.preventDefault()
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return notifyError('no message');
    socket.emit(NEW_MESSAGE, { chatId, members: chatDetails.members, message: trimmedMessage });
    setMessage("");
    setUserTyping(false);
  }

  const allMessages = [...oldMessages, ...messages];

  // scrolling to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <>
      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={'#fcfffa'}
        sx={{
          overflowX: "hidden",
          overflowY: "auto",
          flex: '.9'
        }}
      >
        {
          allMessages.map((i) => {
            return <MessageItem key={i._id} message={i} user={myData} />
          })
        }
        {
          userTyping && <TypingLoader name={myData.name} />
        }
        <div ref={bottomRef} />
      </Stack>
      <form
        style={{
          flex: '.1'
        }}
        onSubmit={(e) => submitHandler(e)}
      >
        <Stack
          direction={'row'}
          padding={'.5rem'}
          alignItems={'center'}
          justifyContent={'center'}
          position={'relative'}
          height={'100%'}
          bgcolor='#c2f09d'
        >
          <IconButton
            position={'absolute'}
            onClick={(e) => {
              setIsFileOpen((prev) => !prev);
              setFileMenuAnchor(e.currentTarget)
            }}
          >
            <AttachFileIcon />
          </IconButton>
          <textarea onChange={(e) => handleMessageInput(e)} value={message} name="message" placeholder='Type message...' id="" className="chat-input"></textarea>
          <IconButton
            type="submit"
            sx={{
              rotate: "-30deg",
              bgcolor: 'pink',
              color: "white",
              marginLeft: "1rem",
              padding: "0.5rem",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            <SendIcon />
          </IconButton>
          <FileMenu chatId={chatId} isFileOpen={isFileOpen} setIsFileOpen={setIsFileOpen} anchorE1={fileMenuAnchor} />
        </Stack>
      </form>
    </>
  );

};

export default AppLayout()(Chat);
