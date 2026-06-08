'use client';

import React, { useState, useEffect } from 'react';

interface RoomMember {
  user_id: number;
  email: string;
}

interface RoomState {
  inRoom: boolean;
  roomId: string | null;
  members: RoomMember[];
}

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomState: RoomState;
  currentUserEmail: string;
  onJoinRoom: (roomId: string) => Promise<void>;
  onLeaveRoom: () => Promise<void>;
  onInviteMember: (email: string) => Promise<void>;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  roomState,
  currentUserEmail,
  onJoinRoom,
  onLeaveRoom,
  onInviteMember,
}) => {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [inviteEmailInput, setInviteEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRoomIdInput('');
      setInviteEmailInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateRoom = () => {
    const randId = Math.random().toString(36).substring(2, 8);
    setRoomIdInput(randId);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = roomIdInput.trim().toLowerCase();
    if (!slug) return;

    setIsSubmitting(true);
    try {
      await onJoinRoom(slug);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmailInput.trim();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await onInviteMember(email);
      setInviteEmailInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="join-room-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div>
          <h3 id="room-modal-title" className="text-base font-bold text-slate-800">
            Workspace Room
          </h3>
          <p className="text-xs text-slate-500">Manage your shared inventory and workspace members.</p>
        </div>

        {/* View 1: Join / Create Room (Shown if not in a room) */}
        {!roomState.inRoom ? (
          <div id="room-join-view" className="space-y-4">
            <form onSubmit={handleJoinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Room ID / Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kitchen456"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-55 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-405 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-505"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-550 text-white font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Connecting...' : 'Connect Room'}
              </button>
            </form>
            <div className="pt-2 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-550 block mb-2">Want to start a new workspace?</span>
              <button
                type="button"
                onClick={handleGenerateRoom}
                className="text-xs font-semibold text-teal-650 hover:text-teal-700 hover:underline cursor-pointer"
              >
                Generate Random Room
              </button>
            </div>
          </div>
        ) : (
          /* View 2: Manage Room Members (Shown when roomState.inRoom is true) */
          <div id="room-members-view" className="space-y-4">
            <div className="bg-teal-50 border border-teal-200/50 rounded-xl p-3 text-xs">
              <div className="flex items-center justify-between font-semibold text-teal-850">
                <span>Connected Room:</span>
                <span id="active-room-slug" className="font-mono text-teal-650 font-bold uppercase">
                  {roomState.roomId}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Workspace Members</span>
              <div
                id="room-members-list"
                className="max-h-32 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 text-xs"
              >
                {roomState.members.map((member) => {
                  const isMe = member.email === currentUserEmail;
                  return (
                    <div
                      key={member.user_id}
                      className="py-2 px-2.5 bg-slate-55 border border-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-705 mt-1.5 shadow-sm"
                    >
                      <span className="font-mono truncate">{member.email}</span>
                      {isMe && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-teal-50 border border-teal-150/40 text-teal-650 font-bold rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invite Member Form */}
            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Add Member by Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="member@example.com"
                    value={inviteEmailInput}
                    onChange={(e) => setInviteEmailInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-55 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-405 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-505"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-550 text-white font-bold rounded-xl shadow-md transition cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
