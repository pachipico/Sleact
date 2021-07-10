import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import { IChannel, IChat, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import makeSection from '@utils/makeSection';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useParams } from 'react-router-dom';
import gravatar from 'gravatar';

import useSWR, { useSWRInfinite } from 'swr';
import { Container, Header } from './styles';
import InviteChannelModal from '@components/InviteChannelModal';

const Channel = () => {
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: myData } = useSWR<IUser>(`/api/users`, fetcher);
  const { data: channelData } = useSWR<IChannel>(
    myData ? `/api/workspaces/${workspace}/channels/${channel}` : null,
    fetcher,
  );
  const { data: channelMembersData } = useSWR<IUser[]>(
    `/api/workspaces/${workspace}/channels/${channel}/members`,
    fetcher,
  );
  const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IChat[]>(
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const scrollbarRef = useRef<Scrollbars>(null);
  const [chat, onChangeChat, setChat] = useInput('');
  const [socket] = useSocket(workspace);

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData && myData && channelData) {
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            UserId: myData.id,
            User: myData,
            content: chat,
            ChannelId: channelData.id,
            Channel: channelData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          setChat('');
          scrollbarRef?.current?.scrollToBottom();
        });

        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, { content: chat })
          .then(() => {
            revalidate();
          })
          .catch((err) => {
            console.dir(err);
          });
      }
    },
    [chat, chatData, myData, channelData, workspace, channel],
  );
  const onMessage = useCallback(
    (data: IChat) => {
      if (data.Channel.name === channel && data.UserId !== myData?.id) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              console.log('scrollbar bottom', scrollbarRef.current.getValues);
              scrollbarRef.current.scrollToBottom();
            }
          }
        });
      }
    },
    [channel, myData],
  );

  useEffect(() => {
    socket?.on('dm', onMessage);

    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  if (!myData || !myData) {
    return null;
  }

  return (
    <Container>
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button onClick={onClickInviteChannel}>
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true"></i>
          </button>
        </div>
      </Header>
      <ChatList chatSections={chatSections} ref={scrollbarRef} setSize={setSize} isReachingEnd={isReachingEnd} />
      <ChatBox onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} chat={chat} />
      <InviteChannelModal
        onCloseModal={onCloseModal}
        show={showInviteChannelModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
    </Container>
  );
};

export default Channel;
