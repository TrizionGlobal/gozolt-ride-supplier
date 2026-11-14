'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardList,
  Store,
  CheckCircle2,
  Truck,
  User,
  KeyRound,
  RefreshCw,
  Phone,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  foodGrocerySupplierService,
  type SupplierOrder,
} from '@/services/food-grocery-supplier/food-grocery-supplier.service';

export default function GroceryOrdersPage() {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [filter, setFilter] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadOrders = async (currentFilter = filter) => {
    try {
      const data = await foodGrocerySupplierService.getOrders(currentFilter);
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load grocery orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadOrders(filter);
    const interval = setInterval(() => loadOrders(filter), 7000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleAccept = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await foodGrocerySupplierService.acceptOrder(orderId);
      toast.success('Order accepted! Started item picking.');
      await loadOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to accept order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStage = async (orderId: string, stage: 'preparing' | 'ready') => {
    setActionLoading(orderId);
    try {
      await foodGrocerySupplierService.updatePreparation(orderId, stage);
      toast.success(
        stage === 'ready'
          ? 'Grocery bags packed & ready for driver pickup!'
          : 'Started picking & packing items'
      );
      await loadOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update order');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <ClipboardList className="h-7 w-7 text-emerald-400" />
            Grocery Order & Packing Management
          </h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Real-time aisle picking, item substitutions, bag packing, and driver dispatch
          </p>
        </div>

        <button
          onClick={() => loadOrders()}
          className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-4">
        {(['active', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-xl px-5 py-2 text-sm font-bold capitalize transition-all ${
              filter === tab
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab} Orders
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center text-[#71717A] rounded-2xl border border-white/10 bg-[#111111]/40">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#27272A] mb-3" />
          <p className="text-base font-bold text-white">No {filter} orders</p>
          <p className="text-sm mt-1">Orders in this category will show up here automatically.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {orders.map((order) => {
            const isPending = order.status === 'AWAITING_SUPPLIER';
            const isAccepted = order.status === 'SUPPLIER_ACCEPTED';
            const isPicking =
              order.status === 'PREPARING' ||
              order.status === 'PICKING_ITEMS' ||
              order.status === 'PACKING';
            const isReady = order.status === 'READY_FOR_PICKUP';

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]/80 p-6 backdrop-blur-xl shadow-lg transition-all hover:border-white/20"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-emerald-500/15 px-3 py-1 text-sm font-black text-emerald-400 tracking-wider border border-emerald-500/30">
                        {order.formattedBookingId}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          isPending
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : isPicking
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : isReady
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/10 text-white/80'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#A1A1AA]">
                      <span className="flex items-center gap-1.5 text-white font-medium">
                        <User className="h-3.5 w-3.5 text-emerald-400" />
                        {order.customerName}
                      </span>
                      {order.customerPhone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-[#A1A1AA]" />
                          {order.customerPhone}
                        </span>
                      )}
                      <span>
                        Ordered at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-white">€{order.totalAmount.toFixed(2)}</p>
                    <p className="text-xs font-semibold text-[#A1A1AA] uppercase mt-0.5">
                      {order.paymentMethod} • {order.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="py-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-2">
                    Grocery Items to Pick ({order.items.length})
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/5 bg-white/5 p-3 text-xs"
                      >
                        <div className="flex justify-between font-bold text-white">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-emerald-400">€{item.lineTotal.toFixed(2)}</span>
                        </div>
                        {item.instructions && (
                          <p className="mt-1 text-[11px] text-amber-300 italic">
                            &quot;{item.instructions}&quot;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pickup PIN & Action */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-4">
                  <div className="flex items-center gap-4">
                    {order.pickupPin && (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5">
                        <KeyRound className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-white/80">Pickup PIN:</span>
                        <span className="text-sm font-black text-emerald-400 tracking-widest">
                          {order.pickupPin}
                        </span>
                      </div>
                    )}

                    {order.driverName && (
                      <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                        <Truck className="h-4 w-4 text-emerald-400" />
                        <span>Driver: <strong className="text-white">{order.driverName}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => handleAccept(order.id)}
                        disabled={actionLoading === order.id}
                        className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
                      >
                        {actionLoading === order.id ? 'Accepting...' : 'Accept Order'}
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleUpdateStage(order.id, 'preparing')}
                        disabled={actionLoading === order.id}
                        className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-600 disabled:opacity-50"
                      >
                        {actionLoading === order.id ? 'Updating...' : 'Start Picking Items'}
                      </button>
                    )}

                    {isPicking && (
                      <button
                        onClick={() => handleUpdateStage(order.id, 'ready')}
                        disabled={actionLoading === order.id}
                        className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
                      >
                        {actionLoading === order.id ? 'Updating...' : 'Mark Packed & Ready'}
                      </button>
                    )}

                    {isReady && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Packed & ready for driver pickup
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

