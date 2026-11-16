'use client';

import { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Bike,
  Clock,
  Phone,
  AlertCircle,
  Info,
  Check,
  Eye,
  EyeOff,
  Search,
  Filter,
  UserCheck,
  PackageCheck,
  Car,
  Store,
  Timer,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Power,
  Smartphone,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { foodGrocerySupplierService } from '@/services/food-grocery-supplier/food-grocery-supplier.service';

// ── Types ───────────────────────────────────────────────────────────────────

export type DeliveryStatus =
  | 'COURIER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'AT_RESTAURANT'
  | 'IN_TRANSIT'
  | 'DELIVERED';

export type HandoverStatus =
  | 'PREPARING'
  | 'READY_AT_COUNTER'
  | 'DRIVER_VERIFIED'
  | 'HANDED_OVER';

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  items: string[];
  totalAmount: number;
  deliveryStatus: DeliveryStatus;
  handoverStatus: HandoverStatus;
  driverName: string;
  driverPhone: string;
  driverVehicle: string;
  driverPlate: string;
  collectionTime: string;
  estimatedArrivalMins: number;
  collectionPin: string;
  dispatchType: 'GOZOLT_AI_DISPATCH';
  placedAt: string;
}

// ── Mock Initial Data ────────────────────────────────────────────────────────

const INITIAL_DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    id: 'del-1',
    orderNumber: '#GZ-9204',
    customerName: 'Luke Attard',
    customerAddress: '14 Triq San Pawl, Valletta',
    items: ['2x Diavola Pizza', '1x Truffle Fries', '2x Coca Cola Zero'],
    totalAmount: 32.5,
    deliveryStatus: 'AT_RESTAURANT',
    handoverStatus: 'READY_AT_COUNTER',
    driverName: 'Marco Borg',
    driverPhone: '+356 7982 4109',
    driverVehicle: 'Electric Scooter',
    driverPlate: 'AG-902',
    collectionTime: '12:45 PM',
    estimatedArrivalMins: 0,
    collectionPin: '4892',
    dispatchType: 'GOZOLT_AI_DISPATCH',
    placedAt: '12:20 PM',
  },
  {
    id: 'del-2',
    orderNumber: '#GZ-9198',
    customerName: 'Sophie Mifsud',
    customerAddress: 'Tower Road Apt 4B, Sliema',
    items: ['1x Quattro Formaggi', '1x Margherita', '1x Tiramisu'],
    totalAmount: 28.0,
    deliveryStatus: 'DRIVER_ARRIVING',
    handoverStatus: 'PREPARING',
    driverName: 'Elena Vella',
    driverPhone: '+356 7944 8831',
    driverVehicle: 'Honda PCX Scooter',
    driverPlate: 'GY-331',
    collectionTime: '12:52 PM',
    estimatedArrivalMins: 4,
    collectionPin: '7103',
    dispatchType: 'GOZOLT_AI_DISPATCH',
    placedAt: '12:26 PM',
  },
  {
    id: 'del-3',
    orderNumber: '#GZ-9189',
    customerName: 'Karl Farrugia',
    customerAddress: 'St. George’s Bay Villa 12, St. Julian’s',
    items: ['1x Prosciutto Crudo', '1x Burrata Pugliese', '1x San Pellegrino'],
    totalAmount: 36.8,
    deliveryStatus: 'COURIER_ASSIGNED',
    handoverStatus: 'PREPARING',
    driverName: 'Liam Zammit',
    driverPhone: '+356 7912 6650',
    driverVehicle: 'Toyota Yaris Hybrid',
    driverPlate: 'LZ-490',
    collectionTime: '01:05 PM',
    estimatedArrivalMins: 12,
    collectionPin: '2938',
    dispatchType: 'GOZOLT_AI_DISPATCH',
    placedAt: '12:35 PM',
  },
  {
    id: 'del-4',
    orderNumber: '#GZ-9175',
    customerName: 'Sarah Caruana',
    customerAddress: 'Marina View Block C, Ta’ Xbiex',
    items: ['1x Calzone Classico', '1x Garlic Rosemary Focaccia'],
    totalAmount: 21.5,
    deliveryStatus: 'IN_TRANSIT',
    handoverStatus: 'HANDED_OVER',
    driverName: 'Kurt Camilleri',
    driverPhone: '+356 7903 5521',
    driverVehicle: 'Electric Bike',
    driverPlate: 'EB-108',
    collectionTime: '12:38 PM',
    estimatedArrivalMins: 0,
    collectionPin: '5561',
    dispatchType: 'GOZOLT_AI_DISPATCH',
    placedAt: '12:10 PM',
  },
  {
    id: 'del-5',
    orderNumber: '#GZ-9160',
    customerName: 'Antoine Galea',
    customerAddress: 'Merchants Street 82, Valletta',
    items: ['1x Spaghetti Carbonara', '1x Tiramisu'],
    totalAmount: 24.0,
    deliveryStatus: 'DELIVERED',
    handoverStatus: 'HANDED_OVER',
    driverName: 'David Grech',
    driverPhone: '+356 7990 1144',
    driverVehicle: 'Vespa Primavera',
    driverPlate: 'VP-882',
    collectionTime: '12:25 PM',
    estimatedArrivalMins: 0,
    collectionPin: '8834',
    dispatchType: 'GOZOLT_AI_DISPATCH',
    placedAt: '11:55 AM',
  },
];

export default function RestaurantDeliveryPage() {
  // Navigation: Screen 30 (Orders) vs Screen 29 (Configuration)
  const [activeTab, setActiveTab] = useState<'orders' | 'config'>('orders');

  // ── Screen 29: Restaurant Ordering Availability State ──
  const [isOrderingEnabled, setIsOrderingEnabled] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Gozolt Partner Restaurant');

  // Load current store status from profile
  useEffect(() => {
    async function fetchStatus() {
      try {
        const profile = await foodGrocerySupplierService.getProfile();
        if (profile?.business) {
          if (profile.business.name) setRestaurantName(profile.business.name);
          const isOpen =
            profile.business.status === 'OPEN' ||
            profile.business.status === 'BUSY' ||
            profile.business.status === 'CLOSING_SOON';
          setIsOrderingEnabled(isOpen);
        }
      } catch (err) {
        console.error('Failed to load profile ordering status:', err);
      }
    }
    fetchStatus();
  }, []);

  // ── Screen 30: Delivery Orders State ──
  const [orders, setOrders] = useState<DeliveryOrder[]>(INITIAL_DELIVERY_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'AT_COUNTER' | 'HANDED_OVER'>('ALL');
  const [revealedContacts, setRevealedContacts] = useState<Record<string, boolean>>({});

  // Handover PIN Modal State
  const [selectedOrderForHandover, setSelectedOrderForHandover] = useState<DeliveryOrder | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  // View Full Products Modal State
  const [viewingProductsOrder, setViewingProductsOrder] = useState<DeliveryOrder | null>(null);

  // Toggle reveal phone contact
  const toggleContactReveal = (orderId: string) => {
    setRevealedContacts((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Open Handover Verification Modal
  const openHandoverModal = (order: DeliveryOrder) => {
    setSelectedOrderForHandover(order);
    setEnteredPin('');
    setIsHandoverModalOpen(true);
  };

  // Confirm Handover
  const confirmHandover = () => {
    if (!selectedOrderForHandover) return;
    if (enteredPin.trim() !== selectedOrderForHandover.collectionPin) {
      toast.error('Invalid Driver Handover PIN', {
        description: `Please verify the 4-digit code shown on courier's GOZOLT Driver App. Expected: ${selectedOrderForHandover.collectionPin}`,
      });
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderForHandover.id
          ? {
              ...o,
              handoverStatus: 'HANDED_OVER',
              deliveryStatus: 'IN_TRANSIT',
            }
          : o
      )
    );

    toast.success(`Handover Verified for ${selectedOrderForHandover.orderNumber}`, {
      description: `Package released to courier ${selectedOrderForHandover.driverName}. Customer notified order is on the way!`,
    });
    setIsHandoverModalOpen(false);
  };

  // Toggle ordering availability with instant sync
  const toggleOrderingStatus = async () => {
    if (isUpdatingStatus) return;
    const nextState = !isOrderingEnabled;
    setIsOrderingEnabled(nextState);
    setIsUpdatingStatus(true);
    try {
      await foodGrocerySupplierService.updateProfile({
        status: nextState ? 'OPEN' : 'CLOSED',
        isActive: nextState,
      });
      toast.success(
        nextState
          ? 'Restaurant is Online & Accepting Orders'
          : 'Restaurant is Offline / Ordering Disabled',
        {
          description: nextState
            ? 'Restaurant details and menu are now active on the GOZOLT customer app.'
            : 'Restaurant is marked as closed. Orders are paused on the GOZOLT customer app.',
        }
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setIsOrderingEnabled(!nextState);
      toast.error('Failed to update ordering status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') {
      return (
        order.deliveryStatus === 'COURIER_ASSIGNED' ||
        order.deliveryStatus === 'DRIVER_ARRIVING' ||
        order.deliveryStatus === 'AT_RESTAURANT'
      );
    }
    if (statusFilter === 'AT_COUNTER') {
      return order.deliveryStatus === 'AT_RESTAURANT';
    }
    if (statusFilter === 'HANDED_OVER') {
      return order.handoverStatus === 'HANDED_OVER';
    }
    return true;
  });

  const activeDeliveriesCount = orders.filter(
    (o) => o.deliveryStatus !== 'DELIVERED'
  ).length;

  return (
    <div className="space-y-6 pb-24 w-full">
      {/* ──────────────────────────────────────────────────────────────────────────
          HEADER & SCREEN TOGGLE
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#FCD223]/10 p-2 text-[#FCD223]">
              <Truck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              Delivery Management
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Live courier handover board and delivery service radius configuration powered by the GOZOLT dispatch system.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center rounded-xl border border-white/10 bg-[#121214] p-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'orders'
                  ? 'bg-[#FCD223] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              <PackageCheck className="h-3.5 w-3.5" />
              Delivery Orders
              {activeDeliveriesCount > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-black',
                    activeTab === 'orders' ? 'bg-black text-[#FCD223]' : 'bg-[#FCD223] text-black'
                  )}
                >
                  {activeDeliveriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'config'
                  ? 'bg-[#FCD223] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              <Power className="h-3.5 w-3.5" />
              Store Ordering Status
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  isOrderingEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 30: DELIVERY ORDERS (LIVE DISPATCH & HANDOVER BOARD)
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Active Deliveries
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{activeDeliveriesCount}</span>
                <span className="text-xs text-amber-400 font-bold">In Progress</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Couriers at Counter
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-purple-400">
                  {orders.filter((o) => o.deliveryStatus === 'AT_RESTAURANT').length}
                </span>
                <span className="text-xs text-zinc-500">Awaiting Handover</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Avg. Handover Speed
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-400">2.1m</span>
                <span className="text-xs text-emerald-400 font-bold">Fast</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                GOZOLT Fleet Health
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#FCD223]">99.2%</span>
                <span className="text-xs text-zinc-500">On-Time SLA</span>
              </div>
            </div>
          </div>

          {/* Autonomous Dispatch Policy Banner */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2 text-blue-400 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">GOZOLT Automated Fleet Dispatch</span>
                  <Badge className="border-blue-500/30 bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                    SYSTEM MANAGED
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Courier matching, route optimization, and driver payouts are controlled autonomously by the GOZOLT AI dispatch engine. Driver payout rates cannot be manually adjusted by restaurant staff.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge className="border-white/10 bg-white/5 text-zinc-300 font-mono text-[11px] px-2.5 py-1">
                Live Dispatch: Active
              </Badge>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'ACTIVE', label: 'In Progress' },
                { id: 'AT_COUNTER', label: 'At Counter' },
                { id: 'HANDED_OVER', label: 'Handed Over' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all border cursor-pointer',
                    statusFilter === tab.id
                      ? 'border-[#FCD223] bg-[#FCD223]/10 text-[#FCD223]'
                      : 'border-white/10 bg-[#121214] text-zinc-400 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <Input
                placeholder="Search Order ID, Driver, Customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs border-white/10 bg-[#121214] text-white"
              />
            </div>
          </div>

          {/* Orders Table / Cards */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#121214] p-12 text-center">
                <Truck className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="font-bold text-white text-sm">No Delivery Orders Found</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  There are no delivery orders matching your filter criteria right now.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isContactRevealed = revealedContacts[order.id];

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-white/10 bg-[#121214] p-5 hover:border-white/20 transition-all shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Order Info & Items */}
                      <div className="space-y-2 max-w-md">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-sm text-[#FCD223]">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">• {order.placedAt}</span>

                          {/* Delivery Status Badge */}
                          <Badge
                            className={cn(
                              'text-[10px] font-bold border font-mono',
                              order.deliveryStatus === 'AT_RESTAURANT' &&
                                'border-purple-500/30 bg-purple-500/10 text-purple-400 animate-pulse',
                              order.deliveryStatus === 'DRIVER_ARRIVING' &&
                                'border-amber-500/30 bg-amber-500/10 text-amber-400',
                              order.deliveryStatus === 'COURIER_ASSIGNED' &&
                                'border-blue-500/30 bg-blue-500/10 text-blue-400',
                              order.deliveryStatus === 'IN_TRANSIT' &&
                                'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
                              order.deliveryStatus === 'DELIVERED' &&
                                'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            )}
                          >
                            {order.deliveryStatus.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-white">
                            Customer: {order.customerName}
                          </p>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                            {order.customerAddress}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <span
                              key={idx}
                              className="rounded-md border border-white/5 bg-[#18181B] px-2 py-0.5 text-[11px] text-zinc-300"
                            >
                              {item}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setViewingProductsOrder(order)}
                              className="inline-flex items-center gap-1 rounded-md border border-[#FCD223]/30 bg-[#FCD223]/10 px-2 py-0.5 text-[11px] font-bold text-[#FCD223] hover:bg-[#FCD223]/20 transition-all cursor-pointer shadow-sm"
                            >
                              <span>+{order.items.length - 2} more</span>
                              <span className="text-zinc-500">•</span>
                              <span className="underline decoration-[#FCD223]/40 hover:decoration-[#FCD223]">
                                View Full Products
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Middle: Driver & Contact (Subject to permissions) */}
                      <div className="rounded-xl border border-white/5 bg-[#18181B] p-3.5 space-y-2 lg:min-w-[280px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-[#FCD223]/10 p-1.5 text-[#FCD223]">
                              <UserCheck className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                {order.driverName}
                                <span className="text-[10px] text-zinc-500 font-normal">
                                  ({order.driverVehicle})
                                </span>
                              </p>
                              <p className="text-[10px] text-zinc-400 font-mono">
                                Plate: {order.driverPlate}
                              </p>
                            </div>
                          </div>

                          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
                            GOZOLT FLEET
                          </Badge>
                        </div>

                        {/* Driver Contact - Subject to Permissions */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <Phone className="h-3.5 w-3.5 text-zinc-500" />
                            <span className="font-mono text-xs text-white">
                              {isContactRevealed
                                ? order.driverPhone
                                : `${order.driverPhone.slice(0, 8)}••••`}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleContactReveal(order.id)}
                            className="flex items-center gap-1 text-[11px] text-[#FCD223] hover:underline cursor-pointer"
                            title="Driver contact protected by privacy policy"
                          >
                            {isContactRevealed ? (
                              <>
                                <EyeOff className="h-3 w-3" /> Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" /> Reveal Contact
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Right: Collection Time & Handover Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3">
                        <div className="text-left lg:text-right">
                          <div className="flex items-center gap-1.5 lg:justify-end text-xs text-zinc-400">
                            <Clock className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Collection Time:</span>
                            <strong className="text-white font-mono">{order.collectionTime}</strong>
                          </div>

                          <div className="mt-1">
                            {order.estimatedArrivalMins > 0 ? (
                              <span className="text-[11px] text-amber-400 font-semibold">
                                Courier arriving in {order.estimatedArrivalMins} mins
                              </span>
                            ) : order.handoverStatus === 'HANDED_OVER' ? (
                              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 lg:justify-end">
                                <Check className="h-3 w-3" /> Handed Over &amp; Dispatched
                              </span>
                            ) : (
                              <span className="text-[11px] text-purple-400 font-semibold animate-pulse">
                                Courier waiting at counter
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Handover Action */}
                        <div className="flex items-center gap-2">
                          {order.handoverStatus === 'HANDED_OVER' ? (
                            <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs py-1 px-3">
                              Handover Completed
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => openHandoverModal(order)}
                              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
                            >
                              <PackageCheck className="mr-1.5 h-3.5 w-3.5" />
                              Verify &amp; Hand Over
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 29: DELIVERY CONFIGURATION
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="h-5 w-5 text-[#FCD223]" />
                Restaurant Ordering Availability
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Enable or disable ordering from your restaurant. This directly controls your restaurant's visibility and checkout status on the GOZOLT customer app.
              </p>
            </div>
          </div>

          {/* Master Ordering Switch Card */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-white">Accept Customer Orders</span>
                  {isOrderingEnabled ? (
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      ONLINE &amp; ACCEPTING ORDERS
                    </Badge>
                  ) : (
                    <Badge className="border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold px-2.5 py-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      OFFLINE &amp; NOT ACCEPTING ORDERS
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  {isOrderingEnabled
                    ? 'Your restaurant is live and accepting orders. Customers can view dishes and complete checkout.'
                    : 'Your restaurant is temporarily closed. Customers will see you as closed and cannot place orders.'}
                </p>
              </div>

              {/* Master Toggle */}
              <div className="flex items-center gap-3 shrink-0">
                <span className={cn('text-xs font-bold', isOrderingEnabled ? 'text-emerald-400' : 'text-zinc-500')}>
                  {isOrderingEnabled ? 'Ordering Enabled' : 'Ordering Disabled'}
                </span>
                <button
                  type="button"
                  onClick={toggleOrderingStatus}
                  disabled={isUpdatingStatus}
                  className={cn(
                    'relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none disabled:opacity-50',
                    isOrderingEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 transform rounded-full bg-black shadow transition-transform',
                      isOrderingEnabled ? 'translate-x-8' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Live Customer App Impact Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Enabled State Indicator */}
              <div
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  isOrderingEnabled
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-white/5 bg-[#18181B]/50 opacity-40'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">When Enabled (Online)</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  • Restaurant appears in the GOZOLT Customer App listing with ratings, delivery time, and cuisines.
                  <br />
                  • Customers can open your restaurant, view menu categories, select food items, customize add-ons, and proceed to checkout.
                </p>
              </div>

              {/* Disabled State Indicator */}
              <div
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  !isOrderingEnabled
                    ? 'border-red-500/40 bg-red-500/5'
                    : 'border-white/5 bg-[#18181B]/50 opacity-40'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-bold text-white">When Disabled (Offline)</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  • Restaurant is displayed as <strong>Closed</strong> on the customer app.
                  <br />
                  • Customers see banner: <em>"Closed. This restaurant is currently not accepting orders."</em>
                  <br />
                  • Checkout button is disabled so no unexpected orders are placed.
                </p>
              </div>
            </div>

            {/* Mobile App Sync Status Note */}
            <div className="rounded-xl border border-white/5 bg-[#18181B] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#FCD223]/10 p-2 text-[#FCD223]">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">Real-Time Mobile App Synchronization</span>
                  <p className="text-[11px] text-zinc-400">
                    Status changes reflect instantly across customer iOS and Android apps connected to the GOZOLT network.
                  </p>
                </div>
              </div>
              <Badge className="border-white/10 bg-white/5 text-zinc-400 text-[10px] font-mono shrink-0">
                SYNC: REAL-TIME
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: HANDOVER VERIFICATION WITH DRIVER PIN
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isHandoverModalOpen} onOpenChange={setIsHandoverModalOpen}>
        <DialogContent className="max-w-md border-white/10 bg-[#0E0E10] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-[#FCD223]" />
              Verify &amp; Hand Over Package
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Confirm order handover with the assigned GOZOLT delivery courier.
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForHandover && (
            <div className="space-y-4 py-3">
              {/* Order Info Card */}
              <div className="rounded-xl border border-white/10 bg-[#18181B] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-[#FCD223]">
                    {selectedOrderForHandover.orderNumber}
                  </span>
                  <span className="text-xs text-zinc-400">
                    Total: €{selectedOrderForHandover.totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-white">
                  Customer: <strong>{selectedOrderForHandover.customerName}</strong>
                </p>
                <div className="text-[11px] text-zinc-400 border-t border-white/5 pt-1.5">
                  Items: {selectedOrderForHandover.items.join(', ')}
                </div>
              </div>

              {/* Driver Details */}
              <div className="rounded-xl border border-white/10 bg-[#18181B] p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-[#FCD223]" />
                    Courier: {selectedOrderForHandover.driverName}
                  </span>
                  <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px]">
                    {selectedOrderForHandover.driverVehicle}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Plate: {selectedOrderForHandover.driverPlate} • Phone: {selectedOrderForHandover.driverPhone}
                </p>
              </div>

              {/* PIN Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-200">
                    Driver Handover PIN (4-Digits) *
                  </label>
                  <span className="text-[10px] text-zinc-500">
                    Shown on driver's phone
                  </span>
                </div>
                <Input
                  type="text"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="Enter 4-Digit PIN"
                  className="text-center font-mono text-lg font-black tracking-widest border-white/10 bg-[#18181B] text-white"
                />
                <p className="text-[11px] text-zinc-400 text-center">
                  Ask courier to display the 4-digit verification code on their GOZOLT Driver app.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsHandoverModalOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmHandover}
              className="bg-[#FCD223] text-black font-bold text-xs hover:bg-[#FCD223]/90 shadow-md shadow-[#FCD223]/10"
            >
              Confirm Handover &amp; Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: VIEW FULL PRODUCTS LIST
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={!!viewingProductsOrder} onOpenChange={() => setViewingProductsOrder(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#FCD223]" />
                All Ordered Items
              </span>
              <span className="font-mono text-sm text-[#FCD223]">
                {viewingProductsOrder?.orderNumber}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Complete itemized manifest for customer {viewingProductsOrder?.customerName} ({viewingProductsOrder?.items.length} items total)
            </DialogDescription>
          </DialogHeader>

          {viewingProductsOrder && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-xl border border-white/5 bg-[#18181B] p-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Customer</span>
                  <span className="text-white font-semibold">{viewingProductsOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Delivery Address</span>
                  <span className="text-white text-right max-w-[220px] truncate">{viewingProductsOrder.customerAddress}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5">
                  <span className="text-zinc-400">Total Order Value</span>
                  <span className="text-emerald-400 font-mono font-bold">€{viewingProductsOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Ordered Dishes &amp; Drinks ({viewingProductsOrder.items.length})
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 divide-y divide-white/5">
                  {viewingProductsOrder.items.map((item, idx) => (
                    <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 font-mono text-[10px] font-bold text-[#FCD223]">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-white">{item}</span>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] py-0 px-1.5 font-semibold">
                        Prepared
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewingProductsOrder(null)}
              className="rounded-xl border-white/10 text-zinc-300 hover:text-white text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
