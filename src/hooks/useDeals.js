import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import {
  isRemote,
  newId,
  fetchDeals,
  createDeal,
  joinDealRemote,
  leaveDealRemote,
  declareDealPayment,
  reviewDealPayment,
  uploadDealBill,
  attachDealBill,
  deleteDeal,
  pushNotification,
} from '../lib/api';
import { loadDeals, saveDeals } from '../lib/demoData';
import { useCurrentUser } from './useCurrentUser';

export function useDeals() {
  const currentUser = useCurrentUser();
  const channelName = useRef(`unisave-deals-${Math.random().toString(36).slice(2, 10)}`).current;
  const [deals, setDeals] = useState(() => (isRemote() ? [] : loadDeals()));
  const [loading, setLoading] = useState(isRemote());

  const reload = useCallback(async () => {
    if (!isRemote()) {
      setDeals(loadDeals());
      return;
    }
    setLoading(true);
    try {
      setDeals(await fetchDeals());
    } catch (error) {
      toast.error(`Không tải được kèo gom đơn: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    if (!isRemote()) return undefined;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, reload)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deal_participants' },
        reload
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  const persistDemo = useCallback((next) => {
    saveDeals(next);
    setDeals(next);
  }, []);

  const addDeal = useCallback(
    async (deal) => {
      const item = {
        id: newId(),
        current_members: 1,
        status: 'open',
        owner_id: currentUser.id,
        owner_name: currentUser.full_name,
        owner_verified: currentUser.is_verified,
        joined_ids: [currentUser.id],
        paid_ids: [currentUser.id],
        created_at: new Date().toISOString(),
        ...deal,
      };

      if (!isRemote()) {
        persistDemo([item, ...loadDeals()]);
        return item;
      }

      setDeals((prev) => [item, ...prev]);
      try {
        const saved = await createDeal(item);
        setDeals((prev) => prev.map((row) => (row.id === item.id ? { ...item, ...saved } : row)));
        return { ...item, ...saved };
      } catch (error) {
        setDeals((prev) => prev.filter((row) => row.id !== item.id));
        toast.error(`Không thể tạo kèo: ${error.message}`);
        throw error;
      }
    },
    [currentUser, persistDemo]
  );

  const notifyOwner = useCallback(
    async (deal, type, title, body) => {
      if (!deal || deal.owner_id === currentUser.id) return;
      await pushNotification({
        id: newId(),
        recipient_id: deal.owner_id,
        actor_id: currentUser.id,
        actor_name: currentUser.full_name,
        type,
        title,
        body,
        link: '/deals',
        read: false,
        created_at: new Date().toISOString(),
      });
    },
    [currentUser]
  );

  const joinDeal = useCallback(
    async (id) => {
      const source = isRemote() ? deals : loadDeals();
      const target = source.find((deal) => deal.id === id);
      if (!target) return null;
      if ((target.joined_ids || []).includes(currentUser.id)) return target;

      const joinedIds = [...(target.joined_ids || []), currentUser.id];
      const isFull = joinedIds.length >= (Number(target.min_members) || 2);
      const next = {
        ...target,
        joined_ids: joinedIds,
        current_members: joinedIds.length,
        status: isFull ? 'full' : 'open',
      };

      if (!isRemote()) {
        persistDemo(loadDeals().map((deal) => (deal.id === id ? next : deal)));
        await notifyOwner(
          target,
          'deal_join',
          `${currentUser.full_name} đã tham gia kèo của bạn`,
          `Kèo “${target.title}” hiện có ${joinedIds.length}/${target.min_members} người.`
        );
        if (isFull) {
          await notifyOwner(
            target,
            'deal_full',
            'Kèo của bạn đã đủ người 🎉',
            `“${target.title}” đã đủ ${target.min_members} người. Mở công cụ chia tiền ngay.`
          );
        }
        return next;
      }

      setDeals((prev) => prev.map((deal) => (deal.id === id ? next : deal)));
      try {
        await joinDealRemote(id, currentUser.id);
      } catch (error) {
        toast.error(`Không thể tham gia kèo: ${error.message}`);
        reload();
        return null;
      }
      return next;
    },
    [currentUser, deals, notifyOwner, persistDemo, reload]
  );

  const leaveDeal = useCallback(
    async (id) => {
      const source = isRemote() ? deals : loadDeals();
      const target = source.find((deal) => deal.id === id);
      if (!target) return null;

      const joinedIds = (target.joined_ids || []).filter((userId) => userId !== currentUser.id);
      const next = {
        ...target,
        joined_ids: joinedIds,
        current_members: joinedIds.length,
        status: joinedIds.length >= (Number(target.min_members) || 2) ? 'full' : 'open',
      };

      if (!isRemote()) {
        persistDemo(loadDeals().map((deal) => (deal.id === id ? next : deal)));
        return next;
      }

      setDeals((prev) => prev.map((deal) => (deal.id === id ? next : deal)));
      try {
        await leaveDealRemote(id, currentUser.id);
      } catch (error) {
        toast.error(`Không thể rời kèo: ${error.message}`);
        reload();
        return null;
      }
      return next;
    },
    [currentUser, deals, persistDemo, reload]
  );

  /** Người tham gia báo đã chuyển tiền — chưa phải là "đã trả", chờ chủ kèo xác nhận. */
  const declarePayment = useCallback(
    async (id) => {
      const apply = (deal) => ({
        ...deal,
        members: (deal.members || []).map((member) =>
          member.id === currentUser.id && !member.is_owner
            ? { ...member, paid: false, payment_status: 'declared' }
            : member
        ),
      });

      if (!isRemote()) {
        persistDemo(loadDeals().map((deal) => (deal.id === id ? apply(deal) : deal)));
        return;
      }

      const snapshot = deals;
      setDeals((prev) => prev.map((deal) => (deal.id === id ? apply(deal) : deal)));
      try {
        await declareDealPayment(id);
      } catch (error) {
        setDeals(snapshot);
        toast.error(`Không ghi nhận được: ${error.message}`);
      }
    },
    [currentUser.id, persistDemo, deals]
  );

  /** Chủ kèo xác nhận đã nhận tiền (accept) hoặc báo chưa nhận (dispute). */
  const reviewPayment = useCallback(
    async (id, memberId, accept) => {
      const apply = (deal) => ({
        ...deal,
        members: (deal.members || []).map((member) =>
          member.id === memberId
            ? { ...member, paid: accept, payment_status: accept ? 'confirmed' : 'disputed' }
            : member
        ),
      });

      if (!isRemote()) {
        persistDemo(loadDeals().map((deal) => (deal.id === id ? apply(deal) : deal)));
        return;
      }

      const snapshot = deals;
      setDeals((prev) => prev.map((deal) => (deal.id === id ? apply(deal) : deal)));
      try {
        await reviewDealPayment(id, memberId, accept);
      } catch (error) {
        setDeals(snapshot);
        toast.error(`Không cập nhật được thanh toán: ${error.message}`);
      }
    },
    [persistDemo, deals]
  );

  /** Tải bill chuyển khoản: upload bucket riêng tư rồi gắn vào lượt tham gia. */
  const attachBill = useCallback(
    async (id, dataUrl) => {
      const apply = (billPath) => (deal) => ({
        ...deal,
        members: (deal.members || []).map((member) =>
          member.id === currentUser.id ? { ...member, bill_url: billPath } : member
        ),
      });

      if (!isRemote()) {
        persistDemo(loadDeals().map((deal) => (deal.id === id ? apply(dataUrl)(deal) : deal)));
        return;
      }

      const snapshot = deals;
      setDeals((prev) => prev.map((deal) => (deal.id === id ? apply(dataUrl)(deal) : deal)));
      try {
        const path = await uploadDealBill(currentUser.id, id, dataUrl);
        await attachDealBill(id, path);
        setDeals((prev) => prev.map((deal) => (deal.id === id ? apply(path)(deal) : deal)));
      } catch (error) {
        setDeals(snapshot);
        toast.error(`Không tải được bill: ${error.message}`);
        throw error;
      }
    },
    [currentUser.id, persistDemo, deals]
  );

  const removeDeal = useCallback(
    async (id) => {
      if (!isRemote()) {
        persistDemo(loadDeals().filter((deal) => deal.id !== id));
        return;
      }
      const snapshot = deals;
      setDeals((prev) => prev.filter((deal) => deal.id !== id));
      try {
        await deleteDeal(id);
      } catch (error) {
        setDeals(snapshot);
        toast.error(`Không thể xóa kèo: ${error.message}`);
      }
    },
    [deals, persistDemo]
  );

  return {
    deals,
    loading,
    currentUser,
    reload,
    addDeal,
    joinDeal,
    leaveDeal,
    declarePayment,
    reviewPayment,
    attachBill,
    removeDeal,
  };
}
