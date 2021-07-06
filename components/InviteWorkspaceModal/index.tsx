import React, { FC, useCallback, useState } from 'react';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/styles';
import axios from 'axios';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';
import { fetcher } from '@utils/fetcher';
import { useParams } from 'react-router';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteWorkspaceModal: (flag: boolean) => void;
}

const InviteWorkspaceModal: FC<Props> = ({ show, onCloseModal, setShowInviteWorkspaceModal }) => {
  const [newMember, setNewMember] = useState('');
  const { workspace } = useParams<{ workspace: string }>();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher);
  const { revalidate: revalidateMembers } = useSWR<IUser[]>(
    userData ? `http://localhost:3095/api/workspaces/${workspace}/members` : null,
    fetcher,
  );

  const onInviteMember = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) return;
      axios
        .post(
          `http://localhost:3095/api/workspaces/${workspace}/members`,
          { email: newMember },
          { withCredentials: true },
        )
        .then(() => {
          setNewMember('');
          setShowInviteWorkspaceModal(false);
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

export default InviteWorkspaceModal;
