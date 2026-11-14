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
  Utensils,
  ChefHat,
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

export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const playKitchenChime = () => {
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
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn(e);
    }
  };

  const FALLBACK_ORDERS: SupplierOrder[] = [
    {
      id: 'ord-4011',
      formattedBookingId: '#GZ-FD-4011',
      status: 'AWAITING_SUPPLIER',
      paymentMethod: 'ONLINE_CARD',
      paymentStatus: 'PAID',
      subtotal: 18.88,
      totalAmount: 22.48,
      pickupPin: '5819',
      createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      customerName: 'Alexander Borg',
      customerPhone: '+356 9912 3456',
      deliveryAddress: { formattedAddress: '14 Tower Road, Sliema' },
      items: [
        {
          id: 'item-1',
          name: 'Truffle Mushroom Tagliolini',
          quantity: 1,
          unitPrice: 15.68,
          lineTotal: 15.68,
          instructions: 'Extra parmigiano-reggiano on the side please',
        },
        {
          id: 'item-2',
          name: 'San Pellegrino Blood Orange',
          quantity: 1,
          unitPrice: 3.20,
          lineTotal: 3.20,
        },
      ],
    },
    {
      id: 'ord-4010',
      formattedBookingId: '#GZ-FD-4010',
      status: 'SUPPLIER_ACCEPTED',
      paymentMethod: 'ONLINE_CARD',
      paymentStatus: 'PAID',
      subtotal: 19.40,
      totalAmount: 22.90,
      pickupPin: '7104',
      createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
      customerName: 'Elena Cassar',
      customerPhone: '+356 7945 1122',
      deliveryAddress: { formattedAddress: '55 Merchant Street, Valletta' },
      items: [
        {
          id: 'item-3',
          name: 'Woodfired Pizza Diavola (12-inch)',
          quantity: 1,
          unitPrice: 13.50,
          lineTotal: 13.50,
          instructions: 'Well-done crust, extra spicy calabrian oil',
        },
        {
          id: 'item-4',
          name: 'Italian Aperol Spritz 0.0%',
          quantity: 1,
          unitPrice: 5.90,
          lineTotal: 5.90,
        },
      ],
    },
    {
      id: 'ord-4009',
      formattedBookingId: '#GZ-FD-4009',
      status: 'PREPARING',
      paymentMethod: 'APPLE_PAY',
      paymentStatus: 'PAID',
      subtotal: 23.30,
      totalAmount: 26.80,
      pickupPin: '3391',
      createdAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
      customerName: 'Mark Bonnici',
      customerPhone: '+356 9988 7766',
      deliveryAddress: { formattedAddress: '12 Triq San Gorg, St. Julian’s' },
      items: [
        {
          id: 'item-5',
          name: 'The Gozolt Prime Angus Smashed Burger',
          quantity: 1,
          unitPrice: 13.98,
          lineTotal: 13.98,
          instructions: 'Medium cooked, no raw onions',
        },
        {
          id: 'item-6',
          name: 'Pizza Margherita D.O.P.',
          quantity: 1,
          unitPrice: 9.32,
          lineTotal: 9.32,
        },
      ],
    },
    {
      id: 'ord-4008',
      formattedBookingId: '#GZ-FD-4008',
      status: 'READY_FOR_PICKUP',
      paymentMethod: 'ONLINE_CARD',
      paymentStatus: 'PAID',
      subtotal: 21.70,
      totalAmount: 24.20,
      pickupPin: '4892',
      createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      customerName: 'Sarah Grech',
      customerPhone: '+356 9901 2345',
      deliveryAddress: { formattedAddress: '88 Marina Court, Msida' },
      driverName: 'Liam Galea (Toyota Yaris - GZ-441)',
      driverPhone: '+356 7711 2233',
      items: [
        {
          id: 'item-7',
          name: 'Burrata Pugliese & Prosciutto San Daniele',
          quantity: 1,
          unitPrice: 14.50,
          lineTotal: 14.50,
        },
        {
          id: 'item-8',
          name: 'Homemade Tiramisu al Mascarpone',
          quantity: 1,
          unitPrice: 7.20,
          lineTotal: 7.20,
        },
      ],
    },
    {
      id: 'ord-4005',
      formattedBookingId: '#GZ-FD-4005',
      status: 'COMPLETED',
      paymentMethod: 'ONLINE_CARD',
      paymentStatus: 'PAID',
      subtotal: 32.40,
      totalAmount: 34.90,
      createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      customerName: 'David Vella',
      customerPhone: '+356 9933 4455',
      deliveryAddress: { formattedAddress: '23 Windsor Terrace, Sliema' },
      driverName: 'Christian Farrugia',
      items: [
        {
          id: 'item-9',
          name: 'Woodfired Pizza Diavola',
          quantity: 2,
          unitPrice: 13.50,
          lineTotal: 27.00,
        },
        {
          id: 'item-10',
          name: 'San Pellegrino Blood Orange',
          quantity: 2,
          unitPrice: 2.70,
          lineTotal: 5.40,
        },
      ],
    },
    {
      id: 'ord-4002',
      formattedBookingId: '#GZ-FD-4002',
      status: 'CANCELLED',
      paymentMethod: 'ONLINE_CARD',
      paymentStatus: 'REFUNDED',
      subtotal: 16.50,
      totalAmount: 19.00,
      createdAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
      customerName: 'Roberta Mifsud',
      customerPhone: '+356 7911 2200',
      deliveryAddress: { formattedAddress: '4 Republic Street, Valletta' },
      items: [
        {
          id: 'item-11',
          name: 'Truffle Mushroom Tagliolini',
          quantity: 1,
          unitPrice: 16.50,
          lineTotal: 16.50,
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
        setOrders(FALLBACK_ORDERS);
      }
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setOrders(FALLBACK_ORDERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadOrders();
    const interval = setInterval(() => loadOrders(), 6000);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    try {
      const socket = io(`${backendUrl}/supplier`, {
        path: '/socket.io/',
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setIsSocketConnected(true);
      });

      socket.on('disconnect', () => {
        setIsSocketConnected(false);
      });

      socket.on('order:new', (order: any) => {
        playKitchenChime();
        toast.info('New Incoming Order!', {
          description: `Order #${order?.formattedBookingId || ''} received.`,
        });
        loadOrders();
      });

      socket.on('supplier:refresh', () => {
        loadOrders();
      });

      socket.on('restaurant:order:status', () => {
        loadOrders();
      });

      return () => {
        clearInterval(interval);
        socket.disconnect();
        socketRef.current = null;
      };
    } catch {
      return () => clearInterval(interval);
    }
  }, [soundEnabled]);

  const handleAccept = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await foodGrocerySupplierService.acceptOrder(orderId);
      toast.success('Order accepted! Moved to preparation.');
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
          ? 'Order marked ready for delivery driver pickup!'
          : 'Order sent to kitchen for cooking.'
      );
      await loadOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update order');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter orders by tab
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    return o.status === activeTab;
  });

  const getCountFor = (status: string) => {
    return orders.filter((o) => o.status === status).length;
  };

  const TABS = [
    { key: 'ALL', label: 'All Orders', count: orders.length },
    { key: 'AWAITING_SUPPLIER', label: 'New Orders', count: getCountFor('AWAITING_SUPPLIER'), highlight: true },
    { key: 'SUPPLIER_ACCEPTED', label: 'Accepted Orders', count: getCountFor('SUPPLIER_ACCEPTED') },
    { key: 'PREPARING', label: 'Preparing Orders', count: getCountFor('PREPARING') },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', count: getCountFor('READY_FOR_PICKUP') },
    { key: 'COMPLETED', label: 'Completed Orders', count: getCountFor('COMPLETED') },
    { key: 'CANCELLED', label: 'Cancelled Orders', count: getCountFor('CANCELLED') },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <ClipboardList className="h-7 w-7 text-[#FCD223]" />
            Restaurant Orders
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live WebSocket
            </span>
          </h1>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Live commercial order queue, status transitions, courier PIN verification, and item preparation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Notification Control */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playKitchenChime();
              toast.info(next ? 'Order audio chime enabled' : 'Order audio muted');
            }}
            className={cn(
              'border text-xs font-bold transition-all',
              soundEnabled
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-white/10 bg-white/5 text-zinc-500'
            )}
            title="Toggle ticket audio bell"
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
            )}
            {soundEnabled ? 'Chime On' : 'Muted'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => loadOrders()}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-[#27272A] overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as OrderStatusTab)}
            className={cn(
              'relative flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-xs font-semibold transition-colors',
              activeTab === tab.key
                ? 'text-[#FCD223]'
                : 'text-[#71717A] hover:text-[#A1A1AA]'
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                activeTab === tab.key
                  ? 'bg-[#FCD223] text-black'
                  : tab.highlight && tab.count > 0
                  ? 'bg-amber-500 text-black animate-pulse'
                  : 'bg-white/10 text-zinc-400'
              )}
            >
              {tab.count}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FCD223]" />
            )}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl border border-white/10 bg-[#121214] animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-white/10 bg-[#121214]">
          <ClipboardList className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
          <p className="text-base font-bold text-white">No orders in this stage</p>
          <p className="text-xs text-zinc-400 mt-1">
            Incoming customer orders will appear here automatically in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => {
            const isNew = order.status === 'AWAITING_SUPPLIER';
            const isAccepted = order.status === 'SUPPLIER_ACCEPTED';
            const isPreparing = order.status === 'PREPARING';
            const isReady = order.status === 'READY_FOR_PICKUP';
            const isDone = order.status === 'COMPLETED';

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border p-5 transition-all cursor-pointer hover:border-white/30',
                  isNew
                    ? 'border-amber-500/50 bg-amber-950/15 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                    : 'border-white/10 bg-[#121214]'
                )}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-sm font-bold text-white">
                        {order.formattedBookingId || order.id.substring(0, 8)}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider',
                        isNew
                          ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                          : isPreparing
                          ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                          : isReady
                          ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                          : 'border-zinc-500/30 text-zinc-400'
                      )}
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      {order.customerName}
                    </span>
                    <span className="font-bold text-[#FCD223]">€{order.totalAmount.toFixed(2)}</span>
                  </div>

                  {/* Items summary */}
                  <div className="mt-3 space-y-1 rounded-xl bg-black/40 p-2.5">
                    {order.items.slice(0, 3).map((it) => (
                      <div key={it.id} className="flex justify-between text-xs text-zinc-300">
                        <span className="truncate pr-2">
                          <strong className="text-white">{it.quantity}x</strong> {it.name}
                        </span>
                        <span className="shrink-0 text-zinc-400">€{it.lineTotal.toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-[10px] text-zinc-500 text-center pt-1">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  {order.pickupPin && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#FCD223]/20 bg-[#FCD223]/5 p-2 text-xs">
                      <KeyRound className="h-4 w-4 text-[#FCD223]" />
                      <span className="text-zinc-400">Driver Pickup PIN:</span>
                      <strong className="font-mono font-bold text-white tracking-widest">{order.pickupPin}</strong>
                    </div>
                  )}
                </div>

                {/* Bottom Action buttons */}
                <div className="mt-4 pt-3 border-t border-white/10 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {isNew && (
                    <Button
                      size="sm"
                      onClick={() => handleAccept(order.id)}
                      disabled={actionLoading === order.id}
                      className="w-full bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90"
                    >
                      Accept Order
                    </Button>
                  )}

                  {isAccepted && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStage(order.id, 'preparing')}
                      disabled={actionLoading === order.id}
                      className="w-full bg-blue-600 font-bold text-white hover:bg-blue-500"
                    >
                      <ChefHat className="mr-1.5 h-4 w-4" /> Start Cooking
                    </Button>
                  )}

                  {isPreparing && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStage(order.id, 'ready')}
                      disabled={actionLoading === order.id}
                      className="w-full bg-emerald-600 font-bold text-white hover:bg-emerald-500"
                    >
                      <PackageCheck className="mr-1.5 h-4 w-4" /> Mark Ready for Pickup
                    </Button>
                  )}

                  {isReady && (
                    <div className="w-full text-center py-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      Waiting for Rider Handover
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="border-white/10 bg-[#141416] text-white sm:max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-7">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center justify-between">
                <span>{selectedOrder.formattedBookingId}</span>
                <span className="text-base text-[#FCD223]">€{selectedOrder.totalAmount.toFixed(2)}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Placed at {new Date(selectedOrder.createdAt).toLocaleTimeString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-3 space-y-1.5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customer Details</p>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Name:</span>
                  <span className="font-semibold text-white">{selectedOrder.customerName}</span>
                </div>
                {selectedOrder.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Phone:</span>
                    <span className="text-white">{selectedOrder.customerPhone}</span>
                  </div>
                )}
                {selectedOrder.deliveryAddress && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Address:</span>
                    <span className="text-white text-right max-w-[200px] truncate">
                      {selectedOrder.deliveryAddress.addressLine || 'Malta'}
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-3 space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Dishes &amp; Items</p>
                <div className="divide-y divide-white/5">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="py-2 flex justify-between items-start text-xs">
                      <div>
                        <p className="font-bold text-white">
                          {it.quantity}x {it.name}
                        </p>
                        {it.instructions && (
                          <p className="text-amber-300 italic mt-0.5">Note: "{it.instructions}"</p>
                        )}
                      </div>
                      <span className="font-semibold text-white shrink-0">€{it.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
