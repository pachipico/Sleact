import React, { FC, useCallback, useState } from 'react';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/styles';
import axios from 'axios';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteChannelModal: (flag: boolean) => void;
}

const InviteChannelModal: FC<Props> = ({ show, onCloseModal, setShowInviteChannelModal }) => {
  const [newMember, setNewMember] = useState('');
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher);
  const { revalidate: revalidateMembers } = useSWR<IUser[]>(
    userData && channel ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  const onInviteMember = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) return;
      axios
        .post(
          `/api/workspaces/${workspace}/channels/${channel}/members
          :`,
          { email: newMember },
          { withCredentials: true },
        )
        .then(() => {
          setNewMember('');
          setShowInviteChannelModal(false);
          revalidateMembers();
        })
        .catch((err) => {
          console.dir(err);
        });
    },
    [newMember],
  );

  const onChangeNewMember = useCallback((e) => {
    setNewMember(e.target.value);
  }, []);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="workspace-label">
          <span>e-mail</span>
          <Input id="workspace" value={newMember} onChange={onChangeNewMember}></Input>
        </Label>
        <Button type="submit">Invite</Button>
      </form>
    </Modal>
  );
};

export default InviteChannelModal;
