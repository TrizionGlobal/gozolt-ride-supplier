'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plane, Truck, CalendarCheck, Clock, CheckCircle2, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface DashboardMetrics {
  totalVehicles: number;
  availableVehicles: number;
  scheduledToday: number;
  activeTransfers: number;
  pendingApprovals: number;
  totalRevenue: number;
}

export default function AirportTransfersDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await apiClient.get('/airport-transfers/supplier/dashboard');
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to fetch airport transfer metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Plane className="h-8 w-8 text-[#FACC15]" />
            Airport Transport Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your airport transfer fleet, incoming flight schedules, and chauffeur operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/airport-transfers/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FACC15] text-black font-bold hover:bg-[#EAB308] transition-colors shadow-lg shadow-[#FACC15]/10"
          >
            <Plus className="h-4 w-4" />
            Add Transfer Vehicle
          </Link>
          <Link
            href="/airport-transfers/bookings"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] border border-[#27272A] text-white font-medium hover:bg-[#27272A] transition-colors"
          >
            <CalendarCheck className="h-4 w-4" />
            View Bookings
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-[#111111] border border-[#27272A] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled Today</span>
            <div className="p-2 rounded-xl bg-[#FACC15]/10 text-[#FACC15]">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">
            {loading ? '—' : metrics?.scheduledToday ?? 0}
          </p>
          <span className="text-xs text-gray-400 mt-1 block">Pickups & drop-offs today</span>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-[#27272A] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Transfers</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Plane className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">
            {loading ? '—' : metrics?.activeTransfers ?? 0}
          </p>
          <span className="text-xs text-gray-400 mt-1 block">Currently on the road</span>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-[#27272A] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Fleet</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">
            {loading ? '—' : metrics?.totalVehicles ?? 0}
          </p>
          <span className="text-xs text-gray-400 mt-1 block">
            {loading ? '—' : `${metrics?.availableVehicles ?? 0} active & available`}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-[#27272A] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#FACC15] mt-4">
            {loading ? '—' : `€${(metrics?.totalRevenue ?? 0).toFixed(2)}`}
          </p>
          <span className="text-xs text-gray-400 mt-1 block">Gross completed transfers</span>
        </div>
      </div>

      {/* Quick Access Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#111111] border border-[#27272A] flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#FACC15]" />
              Manage Transfer Fleet
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Configure vehicle classes (Go 5P, Premium 5P, SUV 7P, Van 8P, Electric), passenger & baggage capacity, and fixed trip tariffs.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#27272A] flex justify-between items-center">
            <span className="text-xs text-gray-400">{metrics?.totalVehicles ?? 0} registered vehicles</span>
            <Link href="/airport-transfers/fleet" className="text-[#FACC15] text-sm font-semibold hover:underline flex items-center gap-1">
              Go to Fleet <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-[#27272A] flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-[#FACC15]" />
              Transfer Bookings & Chauffeur Dispatch
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Review customer flight numbers, scheduled pickup dates, meet & greet requirements, and assign dedicated drivers.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#27272A] flex justify-between items-center">
            <span className="text-xs text-gray-400">{metrics?.pendingApprovals ?? 0} pending approvals</span>
            <Link href="/airport-transfers/bookings" className="text-[#FACC15] text-sm font-semibold hover:underline flex items-center gap-1">
              Go to Bookings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
