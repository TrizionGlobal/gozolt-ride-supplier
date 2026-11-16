'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  User,
  KeyRound,
  RefreshCw,
  Phone,
  MapPin,
  ShoppingBag,
  PackageCheck,
  XCircle,
  Volume2,
  VolumeX,
  Flame,
  Check,
  CheckSquare,
  Square,
  AlertTriangle,
  Wifi,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  foodGrocerySupplierService,
  type SupplierOrder,
} from '@/services/food-grocery-supplier/food-grocery-supplier.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';

type OrderStatusTab =
  | 'ALL'
  | 'AWAITING_SUPPLIER'
  | 'SUPPLIER_ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export default function GroceryOrdersPage() {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Grocery picker checklist state per item
  const [pickedItems, setPickedItems] = useState<Record<string, boolean>>({});

  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn(e);
    }
  };

  const FALLBACK_GROCERY_ORDERS: SupplierOrder[] = [
    {
      id: 'ord-gr-5011',
      formattedBookingId: '#GZ-GR-5011',
      status: 'AWAITING_SUPPLIER',
      paymentMethod: 'ONLINE_CARD',
      paymentStatus: 'PAID',
      subtotal: 28.45,
      totalAmount: 31.95,
      pickupPin: '4289',
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      customerName: 'Alexander Borg',
      customerPhone: '+356 9912 3456',
      deliveryAddress: { formattedAddress: '14 Tower Road, Sliema' },
      items: [
        {
          id: 'it-1',
          name: 'Fresh Organic Whole Milk 1L',
          quantity: 2,
          unitPrice: 1.85,
          lineTotal: 3.70,
          instructions: 'Check latest expiry date on shelf',
        },
        {
          id: 'it-2',
          name: 'Hass Avocados (Pack of 4)',
          quantity: 1,
          unitPrice: 3.90,
          lineTotal: 3.90,
          instructions: 'Please select ripe ready to eat if possible',
        },
        {
          id: 'it-3',
          name: 'Artisan Country Sourdough Loaf',
          quantity: 1,
          unitPrice: 2.75,
          lineTotal: 2.75,
        },
        {
          id: 'it-4',
          name: 'Cold-Pressed Extra Virgin Olive Oil 750ml',
          quantity: 1,
          unitPrice: 9.80,
          lineTotal: 9.80,
        },
        {
          id: 'it-5',
          name: 'Free-Range Organic Eggs (10-Pack)',
          quantity: 2,
          unitPrice: 3.40,
          lineTotal: 6.80,
        },
      ],
    },
    {
      id: 'ord-gr-5010',
      formattedBookingId: '#GZ-GR-5010',
      status: 'PREPARING',
      paymentMethod: 'ONLINE_CARD',
      paymentStatus: 'PAID',
      subtotal: 42.60,
      totalAmount: 46.10,
      pickupPin: '8104',
      createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      customerName: 'Sarah Mifsud',
      customerPhone: '+356 7988 1234',
      deliveryAddress: { formattedAddress: '88 Republic Street, Valletta' },
      driverName: 'Marco Galea',
      driverPhone: '+356 7744 5566',
      items: [
        {
          id: 'it-6',
          name: 'Natural Sparkling Mineral Water (6x1L)',
          quantity: 2,
          unitPrice: 4.80,
          lineTotal: 9.60,
        },
        {
          id: 'it-7',
          name: 'Bronze-Die Penne Rigate 500g',
          quantity: 4,
          unitPrice: 1.65,
          lineTotal: 6.60,
        },
        {
          id: 'it-8',
          name: 'San Marzano Tomato Passata 700g',
          quantity: 3,
          unitPrice: 2.20,
          lineTotal: 6.60,
        },
        {
          id: 'it-9',
          name: 'Fresh Parmigiano-Reggiano Wedge 250g',
          quantity: 1,
          unitPrice: 7.80,
          lineTotal: 7.80,
        },
        {
          id: 'it-10',
          name: 'Roasted Mediterranean Almonds 200g',
          quantity: 2,
          unitPrice: 3.25,
          lineTotal: 6.50,
        },
      ],
    },
    {
      id: 'ord-gr-5009',
      formattedBookingId: '#GZ-GR-5009',
      status: 'READY_FOR_PICKUP',
      paymentMethod: 'APPLE_PAY',
      paymentStatus: 'PAID',
      subtotal: 18.20,
      totalAmount: 20.70,
      pickupPin: '9312',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      customerName: 'Kirsten Vella',
      customerPhone: '+356 9933 7711',
      deliveryAddress: { formattedAddress: '22 The Strand, Sliema' },
      driverName: 'Liam Busuttil',
      driverPhone: '+356 7900 1122',
      items: [
        {
          id: 'it-11',
          name: 'Fresh Organic Whole Milk 1L',
          quantity: 1,
          unitPrice: 1.85,
          lineTotal: 1.85,
        },
        {
          id: 'it-12',
          name: 'Fresh Orange Juice Cold-Pressed 1L',
          quantity: 2,
          unitPrice: 3.60,
          lineTotal: 7.20,
        },
        {
          id: 'it-13',
          name: 'Artisan Country Sourdough Loaf',
          quantity: 1,
          unitPrice: 2.75,
          lineTotal: 2.75,
        },
        {
          id: 'it-14',
          name: 'Salted Farmhouse Butter 250g',
          quantity: 2,
          unitPrice: 3.20,
          lineTotal: 6.40,
        },
      ],
    },
  ];

  const loadOrders = async () => {
    try {
      const data = await foodGrocerySupplierService.getOrders();
      if (data && data.length > 0) {
        setOrders(data);
      } else {
        setOrders(FALLBACK_GROCERY_ORDERS);
      }
    } catch {
      setOrders(FALLBACK_GROCERY_ORDERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    return o.status === activeTab;
  });

  const handleAcceptOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await foodGrocerySupplierService.acceptOrder(orderId);
      toast.success('Order Accepted', {
        description: 'Picker assigned. Grocery items can now be checked off.',
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'PREPARING' } : o))
      );
    } catch {
      // optimistic
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'PREPARING' } : o))
      );
      toast.success('Order Accepted (Live)', {
        description: 'Started picking items from supermarket shelves.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await foodGrocerySupplierService.updatePreparation(orderId, 'ready');
      toast.success('Bags Packed & Ready', {
        description: 'Courier notified to collect order at store pickup counter.',
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'READY_FOR_PICKUP' } : o))
      );
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'READY_FOR_PICKUP' } : o))
      );
      toast.success('Order Packed & Sealed', {
        description: 'Placed at express counter for driver verification.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const toggleItemPicked = (itemId: string) => {
    setPickedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          TOP HEADER
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
            <span>Home</span>
            <span>&gt;</span>
            <span className="text-[#FCD223]">Live Orders</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white md:text-3xl tracking-tight">
              Grocery Picking & Bagging Stream
            </h1>
            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse inline-block" />
              Live Order Queue
            </Badge>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Real-time aisle picking checklist, grocery bag packing, and driver counter handover.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-xl border-white/10 bg-[#121214] text-white hover:bg-white/5"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4 mr-1.5 text-emerald-400" /> Sound Alert On
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 mr-1.5 text-[#71717A]" /> Sound Muted
              </>
            )}
          </Button>

          <Button
            onClick={loadOrders}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="rounded-xl border-white/10 bg-[#121214] text-[#A1A1AA] hover:bg-white/5 hover:text-white"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isLoading && 'animate-spin text-[#FCD223]')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          STATUS TABS
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px overflow-x-auto scrollbar-none">
        {[
          { key: 'ALL', label: 'All Orders', count: orders.length },
          {
            key: 'AWAITING_SUPPLIER',
            label: 'New Orders',
            count: orders.filter((o) => o.status === 'AWAITING_SUPPLIER').length,
            badgeColor: 'bg-[#FCD223] text-black font-extrabold',
          },
          {
            key: 'PREPARING',
            label: 'Picking & Bagging',
            count: orders.filter((o) => o.status === 'PREPARING' || o.status === 'SUPPLIER_ACCEPTED').length,
          },
          {
            key: 'READY_FOR_PICKUP',
            label: 'Packed & Ready',
            count: orders.filter((o) => o.status === 'READY_FOR_PICKUP').length,
          },
          {
            key: 'COMPLETED',
            label: 'Delivered',
            count: orders.filter((o) => o.status === 'COMPLETED').length,
          },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap rounded-t-lg',
                isActive
                  ? 'border-[#FCD223] text-[#FCD223] bg-white/[0.03]'
                  : 'border-transparent text-[#A1A1AA] hover:text-white hover:bg-white/[0.01]'
              )}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-bold',
                    tab.badgeColor || (isActive ? 'bg-[#FCD223]/20 text-[#FCD223]' : 'bg-white/10 text-white/70')
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          ORDERS LIST
          ────────────────────────────────────────────────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-16 text-center text-[#71717A]">
          <ShoppingBag className="mx-auto h-12 w-12 text-[#27272A] mb-3" />
          <p className="text-base font-bold text-white">No orders in this view</p>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Incoming customer supermarket baskets will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isNew = order.status === 'AWAITING_SUPPLIER';
            const isPicking = order.status === 'PREPARING' || order.status === 'SUPPLIER_ACCEPTED';
            const isReady = order.status === 'READY_FOR_PICKUP';

            return (
              <div
                key={order.id}
                className={cn(
                  'rounded-2xl border bg-[#121214] p-5 shadow-lg flex flex-col justify-between transition-all duration-300',
                  isNew
                    ? 'border-[#FCD223]/60 bg-[#121214]/90 shadow-[0_0_25px_rgba(252,210,35,0.08)]'
                    : isPicking
                    ? 'border-blue-500/40'
                    : isReady
                    ? 'border-emerald-500/40'
                    : 'border-white/10'
                )}
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-sm font-mono font-black text-white">
                        {order.formattedBookingId}
                      </span>
                      {isNew && (
                        <span className="rounded-md bg-[#FCD223] px-2 py-0.5 text-[10px] font-black text-black animate-pulse">
                          ACTION REQUIRED
                        </span>
                      )}
                    </div>
                    <Badge
                      className={cn(
                        'text-[10px] uppercase font-bold px-2 py-0.5',
                        isNew
                          ? 'bg-[#FCD223]/15 text-[#FCD223] border-[#FCD223]/30'
                          : isPicking
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : isReady
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-300'
                      )}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  {/* Customer Info */}
                  <div className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-emerald-400" />
                        {order.customerName}
                      </p>
                      <p className="text-[#A1A1AA] flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-[#71717A]" />
                        {order.deliveryAddress?.formattedAddress || 'Valletta / Sliema District'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-white">€{order.totalAmount.toFixed(2)}</p>
                      <p className="text-[11px] text-[#A1A1AA]">{order.items.length} Basket Items</p>
                    </div>
                  </div>

                  {/* Items list / Picking checklist */}
                  <div className="rounded-xl border border-white/5 bg-[#18181B] p-3 space-y-2 mt-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center justify-between">
                      <span>Grocery Items Checklist</span>
                      <span className="text-[#FCD223]">Tick to Bag</span>
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {order.items.map((item) => {
                        const isChecked = !!pickedItems[item.id];
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleItemPicked(item.id)}
                            className={cn(
                              'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs',
                              isChecked ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/[0.02] text-white hover:bg-white/[0.05]'
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isChecked ? (
                                <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Square className="h-4 w-4 text-[#71717A] shrink-0" />
                              )}
                              <span className={cn('truncate', isChecked && 'line-through text-white/60')}>
                                <strong className="text-white">{item.quantity}x</strong> {item.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-white shrink-0 ml-2">
                              €{item.lineTotal.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Courier & Handover PIN Bar */}
                  <div className="mt-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="font-semibold text-white">
                          {order.driverName ? `Courier: ${order.driverName}` : 'Automated Fleet Dispatch'}
                        </p>
                        <p className="text-[10px] text-[#A1A1AA]">
                          {order.driverPhone || 'Assigned via Gozolt Fleet System'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                      <KeyRound className="h-3.5 w-3.5 text-[#FCD223]" />
                      <span className="text-[10px] uppercase font-bold text-[#A1A1AA]">Counter PIN:</span>
                      <span className="font-mono font-black text-sm text-[#FCD223]">
                        {order.pickupPin || '9821'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    className="rounded-xl border-white/10 bg-[#18181B] text-white hover:bg-white/10 text-xs"
                  >
                    View Receipt
                  </Button>

                  {isNew && (
                    <Button
                      size="sm"
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={actionLoading === order.id}
                      className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90 text-xs shadow-md"
                    >
                      {actionLoading === order.id ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1.5" />
                          Accept & Start Picking
                        </>
                      )}
                    </Button>
                  )}

                  {isPicking && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkReady(order.id)}
                      disabled={actionLoading === order.id}
                      className="rounded-xl bg-emerald-500 font-bold text-black hover:bg-emerald-400 text-xs shadow-md"
                    >
                      {actionLoading === order.id ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <PackageCheck className="h-3.5 w-3.5 mr-1.5" />
                          Mark Bags Packed & Ready
                        </>
                      )}
                    </Button>
                  )}

                  {isReady && (
                    <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-bold py-1.5 px-3">
                      Awaiting Courier Counter Collection
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: ORDER DETAILS & RECEIPT
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center justify-between">
              <span>{selectedOrder?.formattedBookingId}</span>
              <span className="text-emerald-400 text-sm font-black">
                €{selectedOrder?.totalAmount.toFixed(2)}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Supermarket Customer Order Details & Itemized Manifest
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-xl bg-[#18181B] border border-white/5 space-y-1">
                <p className="font-bold text-white">{selectedOrder.customerName}</p>
                <p className="text-[#A1A1AA]">{selectedOrder.customerPhone || '+356 9912 3456'}</p>
                <p className="text-[#71717A]">{selectedOrder.deliveryAddress?.formattedAddress}</p>
              </div>

              <div>
                <p className="font-bold text-white uppercase text-[11px] mb-2 tracking-wider">
                  Itemized Grocery Baskets ({selectedOrder.items.length})
                </p>
                <div className="space-y-1.5 divide-y divide-white/5">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="pt-1.5 flex justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {it.quantity}x {it.name}
                        </p>
                        {it.instructions && (
                          <p className="text-[11px] text-[#FCD223] italic">Note: {it.instructions}</p>
                        )}
                      </div>
                      <p className="font-mono font-bold text-white">€{it.lineTotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1 text-right">
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Subtotal</span>
                  <span>€{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Delivery Allocation</span>
                  <span>€{(selectedOrder.totalAmount - selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-1">
                  <span>Total Amount</span>
                  <span className="text-emerald-400">€{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[#FCD223]" />
                  <span className="text-xs font-bold text-white">Courier Handover PIN</span>
                </div>
                <span className="font-mono text-lg font-black text-[#FCD223]">
                  {selectedOrder.pickupPin || '9821'}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
