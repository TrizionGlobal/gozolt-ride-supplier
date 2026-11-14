'use client';

import { useState } from 'react';
import {
  Truck,
  MapPin,
  Save,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Bike,
  Clock,
  Phone,
  AlertCircle,
  Lock,
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

  // ── Screen 29: Delivery Configuration State ──
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('8.5');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('15.00');
  const [estimatedDeliveryTimeMins, setEstimatedDeliveryTimeMins] = useState('35');
  const [restaurantPrepTimeMins, setRestaurantPrepTimeMins] = useState('20');
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    'Enter via Republic Street rear delivery bay. Ring buzzer #2 for kitchen counter pickup. Scooters can park temporarily in loading bay 4.'
  );
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // ── Screen 30: Delivery Orders State ──
  const [orders, setOrders] = useState<DeliveryOrder[]>(INITIAL_DELIVERY_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'AT_COUNTER' | 'HANDED_OVER'>('ALL');
  const [revealedContacts, setRevealedContacts] = useState<Record<string, boolean>>({});

  // Handover PIN Modal State
  const [selectedOrderForHandover, setSelectedOrderForHandover] = useState<DeliveryOrder | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

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

  // Save Configuration (Screen 29)
  const handleSaveConfig = () => {
    setIsSavingConfig(true);
    setTimeout(() => {
      setIsSavingConfig(false);
      toast.success('Delivery Configurations Saved', {
        description: 'New service radius, prep buffer, and customer instructions are immediately active.',
      });
    }, 600);
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
              <Navigation className="h-3.5 w-3.5" />
              Delivery Configuration
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

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {order.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="rounded-md border border-white/5 bg-[#18181B] px-2 py-0.5 text-[11px] text-zinc-300"
                            >
                              {item}
                            </span>
                          ))}
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Navigation className="h-5 w-5 text-[#FCD223]" />
                Delivery &amp; Collection Parameters
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Set customer ordering availability, service radius, preparation timing, and driver counter instructions.
              </p>
            </div>

            <Button
              onClick={handleSaveConfig}
              disabled={isSavingConfig}
              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {isSavingConfig ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Service Activation Modes */}
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-5 shadow-xl">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-[#FCD223]" />
                  Service Fulfillment Channels
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Control which ordering channels are open for your restaurant on the customer app.
                </p>
              </div>

              {/* Delivery Enabled Switch */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#18181B]">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#FCD223]" />
                    <span className="text-xs font-bold text-white">Delivery Enabled</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Accept on-demand delivery orders fulfilled by the GOZOLT automated courier dispatch fleet.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDeliveryEnabled(!deliveryEnabled)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer',
                    deliveryEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-black transition-transform',
                      deliveryEnabled ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Pickup Enabled Switch */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#18181B]">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-[#FCD223]" />
                    <span className="text-xs font-bold text-white">Pickup Enabled</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Allow local customers to order ahead and collect directly from the restaurant counter.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPickupEnabled(!pickupEnabled)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer',
                    pickupEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-black transition-transform',
                      pickupEnabled ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Card 2: Coverage Radius & Minimum Order Amount */}
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-5 shadow-xl">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#FCD223]" />
                  Delivery Radius &amp; Cart Minimums
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Define geographic reach and minimum basket size required for delivery checkout.
                </p>
              </div>

              {/* Delivery Radius */}
              <div className="space-y-2 p-4 rounded-xl border border-white/10 bg-[#18181B]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Delivery Radius</label>
                  <span className="text-xs font-mono font-bold text-[#FCD223]">
                    {deliveryRadiusKm} km
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={deliveryRadiusKm}
                    onChange={(e) => setDeliveryRadiusKm(e.target.value)}
                    className="w-full accent-[#FCD223] cursor-pointer"
                  />
                  <Input
                    type="number"
                    step="0.5"
                    value={deliveryRadiusKm}
                    onChange={(e) => setDeliveryRadiusKm(e.target.value)}
                    className="w-20 text-xs border-white/10 bg-[#0E0E10] text-white font-mono text-center"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Covers Valletta, Floriana, Msida, Gzira, Sliema, and St. Julian's perimeter.
                </p>
              </div>

              {/* Minimum Order Amount */}
              <div className="space-y-2 p-4 rounded-xl border border-white/10 bg-[#18181B]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Minimum Order Amount (€)</label>
                  <span className="text-xs text-zinc-400">Required subtotal</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">
                    €
                  </span>
                  <Input
                    type="number"
                    step="1.00"
                    min="0"
                    value={minimumOrderAmount}
                    onChange={(e) => setMinimumOrderAmount(e.target.value)}
                    placeholder="15.00"
                    className="pl-7 text-xs border-white/10 bg-[#0E0E10] text-white font-mono"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Customers cannot place delivery orders if their cart subtotal is less than this value.
                </p>
              </div>
            </div>

            {/* Card 3: Preparation & Delivery Timings */}
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-5 shadow-xl">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Timer className="h-4 w-4 text-[#FCD223]" />
                  Service Time Estimates &amp; Kitchen Buffer
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Provides realistic countdown estimates to customers and coordinates courier arrival timing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Restaurant Preparation Time */}
                <div className="space-y-2 p-4 rounded-xl border border-white/10 bg-[#18181B]">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#FCD223]" />
                    Restaurant Prep Time
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="5"
                      max="120"
                      value={restaurantPrepTimeMins}
                      onChange={(e) => setRestaurantPrepTimeMins(e.target.value)}
                      className="text-xs border-white/10 bg-[#0E0E10] text-white font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">
                      mins
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Average time needed by the kitchen from accepting order to bag packaging.
                  </p>
                </div>

                {/* Estimated Delivery Time */}
                <div className="space-y-2 p-4 rounded-xl border border-white/10 bg-[#18181B]">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-[#FCD223]" />
                    Estimated Delivery Time
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="10"
                      max="180"
                      value={estimatedDeliveryTimeMins}
                      onChange={(e) => setEstimatedDeliveryTimeMins(e.target.value)}
                      className="text-xs border-white/10 bg-[#0E0E10] text-white font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">
                      mins
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Displayed to customers in app as the total order-to-door ETA.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Delivery Handover Instructions */}
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-5 shadow-xl">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-[#FCD223]" />
                  Courier Collection Instructions
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Sent to the assigned courier's GOZOLT Driver App when they arrive at your location.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Enter through side alley, counter pickup..."
                  className="w-full rounded-xl border border-white/10 bg-[#18181B] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FCD223]/50 transition-colors"
                />
                <p className="text-[11px] text-zinc-500">
                  Include parking spots for scooters, entrance buzzer codes, or specific counter lanes.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: Platform Pricing & Driver Payouts (System-Enforced Lock) */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-400">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    GOZOLT Platform Delivery Pricing &amp; Driver Compensation
                    <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                      CENTRAL DISPATCH POLICY
                    </Badge>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Platform delivery pricing and courier payout rates are locked and cannot be manually modified by the restaurant.
                  </p>
                </div>
              </div>

              <span className="text-[11px] text-zinc-500 font-mono">
                System Rule: Section 4.2 Rider Agreement
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl border border-white/5 bg-[#18181B] p-4 space-y-1">
                <span className="text-[11px] text-zinc-400 font-medium">Standard Customer Delivery Fee</span>
                <p className="text-lg font-black text-white font-mono">€2.50 + €0.85/km</p>
                <p className="text-[10px] text-zinc-500">
                  Calculated dynamically at checkout based on distance and weather.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#18181B] p-4 space-y-1">
                <span className="text-[11px] text-zinc-400 font-medium">Driver Earnings Guarantee</span>
                <p className="text-lg font-black text-emerald-400 font-mono">100% Platform Payout</p>
                <p className="text-[10px] text-zinc-500">
                  Dispatched couriers receive 100% of the delivery fare plus customer tips.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#18181B] p-4 space-y-1">
                <span className="text-[11px] text-zinc-400 font-medium">Restaurant Liability</span>
                <p className="text-lg font-black text-[#FCD223] font-mono">€0.00 Fleet Cost</p>
                <p className="text-[10px] text-zinc-500">
                  Gozolt covers all courier insurance, dispatch routing, and fleet support.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#18181B] p-3 text-xs text-zinc-400 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-[#FCD223] shrink-0 mt-0.5" />
              <span>
                <strong>System Transparency Notice:</strong> Restaurants do not set or charge custom driver payouts or delivery rates. If your restaurant operates an in-house fleet for specific corporate contracts, contact your GOZOLT merchant account partner for dedicated enterprise routing permissions.
              </span>
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
                  placeholder={`e.g. ${selectedOrderForHandover.collectionPin}`}
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
    </div>
  );
}
