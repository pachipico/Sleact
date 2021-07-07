import React, { useCallback, useState, VFC } from 'react';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';

interface Props {
  show: boolean;
  setShowCreateChannelModal: (flag: boolean) => void;
  onCloseModal: () => void;
  toggleWorkspaceModal: () => void;
}

const CreateChannelModal: VFC<Props> = ({ show, onCloseModal, setShowCreateChannelModal, toggleWorkspaceModal }) => {
  const [newChannel, setNewChannel] = useState('');
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: userData, error, revalidate, mutate } = useSWR<IUser | false>('/api/users', fetcher);
  const { data: channelData, revalidate: revalidateChannel } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );

  const onChangeChannel = useCallback((e) => {
    setNewChannel(e.target.value);
  }, []);

  const onCreateChannel = useCallback(
    (e) => {
      e.preventDefault();
      axios
        .post(`/api/workspaces/${workspace}/channels`, { name: newChannel }, { withCredentials: true })
        .then(() => {
          setShowCreateChannelModal(false);
          setNewChannel('');
          revalidateChannel();
          toggleWorkspaceModal();
        })
        .catch((err) => {
          console.dir(err);
          toast.error(err.response?.data, { position: 'bottom-center' });
        });
    },
    [newChannel],
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="workspace-label">
          <span>channel name</span>
          <Input id="workspace" value={newChannel} onChange={onChangeChannel}></Input>
        </Label>
        <Button type="submit">Add</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
