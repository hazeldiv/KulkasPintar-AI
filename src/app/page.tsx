'use client';

import React, { useEffect, useState } from 'react';
import { ToastProvider, useToast } from '@/components/Toast';
import { AuthView } from '@/components/AuthView';
import { DashboardView } from '@/components/DashboardView';
import { LeftPanel } from '@/components/LeftPanel';
import { InventoryPanel, InventoryItem } from '@/components/InventoryPanel';
import { RecipePanel, Recipe } from '@/components/RecipePanel';
import { DietaryModal } from '@/components/modals/DietaryModal';
import { AddItemModal } from '@/components/modals/AddItemModal';
import { ScanUploadModal } from '@/components/modals/ScanUploadModal';
import { ConfirmLoggingModal } from '@/components/modals/ConfirmLoggingModal';
import { RoomModal } from '@/components/modals/RoomModal';
import { GlobalLoader } from '@/components/GlobalLoader';
import { ScanIngredient } from '@/lib/gemini-service';

interface RoomMember {
  user_id: number;
  email: string;
}

interface RoomState {
  inRoom: boolean;
  roomId: string | null;
  members: RoomMember[];
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [strictMatch, setStrictMatch] = useState(false);
  const [saveTheFood, setSaveTheFood] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [detectedIngredients, setDetectedIngredients] = useState<ScanIngredient[]>([]);

  // Modal states
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [roomState, setRoomState] = useState<RoomState>({
    inRoom: false,
    roomId: null,
    members: [],
  });

  const { showToast } = useToast();

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          addedAt: item.added_at,
          expiresAt: item.expires_at,
        }));
        setInventory(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }
  };

  const fetchRoomStatus = async () => {
    try {
      const res = await fetch('/api/rooms/active');
      if (res.ok) {
        const data = await res.json();
        setRoomState({
          inRoom: data.in_room,
          roomId: data.room_id,
          members: data.members || [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch room status:', err);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserEmail(data.email);
        setDietaryRestrictions(data.dietary_restrictions || []);
        setIsAuthenticated(true);
        fetchInventory();
        fetchRoomStatus();

        // Check for pending room links in local storage
        const pendingRoomId = localStorage.getItem('kp_pending_room_id');
        if (pendingRoomId) {
          localStorage.removeItem('kp_pending_room_id');
          await handleJoinRoom(pendingRoomId);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUserEmail('');
      setInventory([]);
      setRecipes([]);
      setRoomState({ inRoom: false, roomId: null, members: [] });
      showToast('Signed out successfully.', 'info');
    } catch (err) {
      showToast('Sign out failed.', 'error');
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId }),
      });

      if (res.ok) {
        showToast(`Joined shared room: ${roomId}`, 'success');
        history.pushState(null, '', `/room/${roomId}`);
        await fetchRoomStatus();
        await fetchInventory();
      } else {
        const data = await res.json();
        showToast(data.detail || 'Failed to join room', 'error');
      }
    } catch (err) {
      showToast('Failed to join room', 'error');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const res = await fetch('/api/rooms/leave', {
        method: 'POST',
      });

      if (res.ok) {
        showToast('Left collaborative room session.', 'info');
        history.pushState(null, '', '/');
        await fetchRoomStatus();
        await fetchInventory();
      } else {
        const data = await res.json();
        showToast(data.detail || 'Failed to leave room', 'error');
      }
    } catch (err) {
      showToast('Failed to leave room', 'error');
    }
  };

  const handleInviteMember = async (email: string) => {
    try {
      const res = await fetch('/api/rooms/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(`Added ${email} to workspace!`, 'success');
        await fetchRoomStatus();
        await fetchInventory();
      } else {
        showToast(data.detail || 'Failed to add member', 'error');
      }
    } catch (err) {
      showToast('Failed to add member', 'error');
    }
  };

  const handleAddItem = async (
    name: string,
    quantity: number,
    unit: string,
    category: string,
    expDays: number
  ) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expDays);

      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          quantity,
          unit,
          category,
          expires_at: expiresAt.toISOString(),
        }),
      });

      if (res.ok) {
        showToast('Ingredient added!', 'success');
        fetchInventory();
      } else {
        const data = await res.json();
        showToast(data.detail || 'Failed to add ingredient', 'error');
      }
    } catch (err) {
      showToast('Failed to add ingredient', 'error');
    }
  };

  const handleIncrementQty = async (id: number, currentQty: number) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: currentQty + 1 }),
      });

      if (res.ok) {
        fetchInventory();
      } else {
        const data = await res.json();
        showToast(data.detail || 'Failed to update quantity', 'error');
      }
    } catch (err) {
      showToast('Failed to update quantity', 'error');
    }
  };

  const handleDecrementQty = async (id: number, currentQty: number) => {
    if (currentQty <= 1) {
      handleDelete(id);
      return;
    }

    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: currentQty - 1 }),
      });

      if (res.ok) {
        fetchInventory();
      } else {
        const data = await res.json();
        showToast(data.detail || 'Failed to update quantity', 'error');
      }
    } catch (err) {
      showToast('Failed to update quantity', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('Item deleted from inventory', 'info');
        fetchInventory();
      } else {
        const data = await res.json();
        showToast(data.detail || 'Failed to delete item', 'error');
      }
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleSaveDietary = async (restrictions: string[]) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dietary_restrictions: restrictions }),
      });

      if (res.ok) {
        const data = await res.json();
        setDietaryRestrictions(data.dietary_restrictions);
        showToast('Dietary profile updated!', 'success');
      } else {
        const data = await res.json();
        showToast(data.detail || 'Failed to update dietary profile', 'error');
      }
    } catch (err) {
      showToast('Failed to update dietary profile', 'error');
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsScanModalOpen(false);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('strict_match', String(strictMatch));
      formData.append('save_the_food', String(saveTheFood));
      formData.append('image', file);

      const res = await fetch('/api/analyze-fridge', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Fridge analysis failed.');
      }

      showToast('Fridge analysis completed!', 'success');
      setRecipes(data.recipes || []);
      setDetectedIngredients(data.ingredients || []);
      setIsConfirmModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Scan analysis failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmLogging = async (
    itemsToSave: {
      name: string;
      quantity: number;
      unit: string;
      category: string;
      expDays: number;
    }[]
  ) => {
    setIsAnalyzing(true);
    let addedCount = 0;

    try {
      for (const item of itemsToSave) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + item.expDays);

        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category,
            expires_at: expiresAt.toISOString(),
          }),
        });
        addedCount++;
      }
      showToast(`Successfully added ${addedCount} ingredients to inventory!`, 'success');
      fetchInventory();
    } catch (err) {
      console.error(err);
      showToast('Failed to add some items', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FAF9F5]">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-teal-650 animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView onLoginSuccess={checkAuth} />;
  }

  return (
    <>
      <DashboardView
        userEmail={userEmail}
        onSignOut={handleSignOut}
        roomState={{
          inRoom: roomState.inRoom,
          roomId: roomState.roomId,
          membersCount: roomState.members.length,
        }}
        onLeaveRoom={handleLeaveRoom}
        onJoinRoomClick={() => setIsRoomModalOpen(true)}
      >
        <LeftPanel
          dietaryRestrictions={dietaryRestrictions}
          onEditDietClick={() => setIsDietModalOpen(true)}
          strictMatch={strictMatch}
          onStrictMatchChange={setStrictMatch}
          saveTheFood={saveTheFood}
          onSaveTheFoodChange={setSaveTheFood}
          onScanClick={() => setIsScanModalOpen(true)}
        />
        <InventoryPanel
          items={inventory}
          onAddItemClick={() => setIsAddItemModalOpen(true)}
          onIncrementQty={handleIncrementQty}
          onDecrementQty={handleDecrementQty}
          onDeleteClick={handleDelete}
        />
        <RecipePanel recipes={recipes} />
      </DashboardView>

      {/* Modals */}
      <DietaryModal
        isOpen={isDietModalOpen}
        onClose={() => setIsDietModalOpen(false)}
        initialRestrictions={dietaryRestrictions}
        onSave={handleSaveDietary}
      />

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAdd={handleAddItem}
      />

      <ScanUploadModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onUpload={handleImageUpload}
      />

      <ConfirmLoggingModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        detectedIngredients={detectedIngredients}
        onConfirm={handleConfirmLogging}
      />

      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        roomState={roomState}
        currentUserEmail={userEmail}
        onJoinRoom={handleJoinRoom}
        onLeaveRoom={handleLeaveRoom}
        onInviteMember={handleInviteMember}
      />

      <GlobalLoader isOpen={isAnalyzing} />
    </>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}



