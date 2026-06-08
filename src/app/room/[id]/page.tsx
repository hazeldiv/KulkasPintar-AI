'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RoomDeepLink() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const roomId = params?.id;
    if (roomId && typeof roomId === 'string') {
      localStorage.setItem('kp_pending_room_id', roomId.toLowerCase());
    }
    router.replace('/');
  }, [params, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#FAF9F5]">
      <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-teal-650 animate-spin"></div>
      <p className="text-xs text-slate-500 mt-4">Connecting to room...</p>
    </div>
  );
}
