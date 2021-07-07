import { Container, Header } from '@pages/Channel/styles';
import React, { FC, useCallback, useState } from 'react';
import gravatar from 'gravatar';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';

const DirectMessage: FC = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: userData } = useSWR<IUser>(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR<IUser>(`/api/users`, fetcher);
  const { data: chatData, mutate: mutateChat, revalidate } = useSWR(
    `/api/workspaces/${workspace}/dms/${id}/chats?perPage20&page=1`,
    fetcher,
  );
  const [chat, onChangeChat, setChat] = useInput('');

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      console.log(chat);
      if (chat?.trim()) {
        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, { content: chat }, { withCredentials: true })
          .then(() => {
            revalidate();
            setChat('');
          })
          .catch((err) => {
            console.dir(err);
          });
      }
    },
    [chat],
  );

  if (!userData || !myData) {
    return null;
  }

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList />
      <ChatBox setChat={setChat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} chat={chat} />
    </Container>
  );
};

export default DirectMessage;
