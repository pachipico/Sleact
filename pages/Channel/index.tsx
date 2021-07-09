import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import { IDM } from '@typings/db';
import fetcher from '@utils/fetcher';
import makeSection from '@utils/makeSection';
import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import useSWR from 'swr';
import { Container, Header } from './styles';
export default function Channel() {
  const { data: myData } = useSWR(`/api/users`, fetcher);
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const [chat, onChangeChat, setChat] = useInput('');
  const { data: chatData, mutate: mutateChat, revalidate } = useSWR(
    `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=1`,
    fetcher,
  );
  const onSubmitForm = useCallback((e) => {
    e.preventDefault();
  }, []);

  const chatSections = makeSection(chatData ? [...chatData].reverse() : []);

  return (
    <Container>
      <Header>Channel</Header>
      {/* <ChatList chatSections={chatSections} /> */}
      <ChatBox onSubmitForm={onSubmitForm} chat={chat} onChangeChat={onChangeChat} />
    </Container>
  );
}
