import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import fetcher from '@utils/fetcher';
import React, { useCallback } from 'react';
import useSWR from 'swr';
import { Container, Header } from './styles';
export default function Channel() {
  const { data: myData } = useSWR(`/api/users`, fetcher);
  const [chat, onChangeChat, setChat] = useInput('');

  const onSubmitForm = useCallback((e) => {
    e.preventDefault();
  }, []);
  return (
    <Container>
      <Header>Channel</Header>
      <ChatList />
      <ChatBox setChat={setChat} onSubmitForm={onSubmitForm} chat={chat} onChangeChat={onChangeChat} />
    </Container>
  );
}
