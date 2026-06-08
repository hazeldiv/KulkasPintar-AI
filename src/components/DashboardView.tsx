'use client';

import React from 'react';

interface RoomState {
  inRoom: boolean;
  roomId: string | null;
  membersCount: number;
}

interface DashboardViewProps {
  userEmail: string;
  onSignOut: () => void;
  roomState: RoomState;
  onLeaveRoom: () => void;
  onJoinRoomClick: () => void;
  children: React.ReactNode;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userEmail,
  onSignOut,
  roomState,
  onLeaveRoom,
  onJoinRoomClick,
  children,
}) => {
  return (
    <div id="dashboard-view" className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 border border-teal-200/50 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <svg className="w-6 h-6 text-teal-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            KulkasPintar <span className="text-teal-650 font-extrabold">AI</span>
          </h1>
        </div>

        {/* Collaboration Widget */}
        <div className="flex items-center gap-3">
          {roomState.inRoom && (
            <div id="room-status" className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Room: <strong id="room-id-display" className="text-teal-650">{roomState.roomId}</strong>
              </span>
              <span id="room-members-count" className="text-slate-500">
                ({roomState.membersCount} member{roomState.membersCount !== 1 ? 's' : ''})
              </span>
              <button
                type="button"
                onClick={onLeaveRoom}
                className="ml-2 text-rose-650 hover:text-rose-700 hover:underline cursor-pointer font-medium"
              >
                Leave
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onJoinRoomClick}
            className="text-xs px-3.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-850 hover:bg-slate-50 rounded-full transition cursor-pointer"
          >
            {roomState.inRoom ? 'Workspace Room' : 'Connect Room'}
          </button>

          <div className="h-5 w-[1px] bg-slate-200"></div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            <span id="user-email-display" className="hidden md:inline text-xs text-slate-505 font-mono">
              {userEmail}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="text-xs px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-650 border border-rose-200 rounded-full transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-y-auto lg:overflow-hidden flex-col lg:flex-row">
        {children}
      </main>
    </div>
  );
};
