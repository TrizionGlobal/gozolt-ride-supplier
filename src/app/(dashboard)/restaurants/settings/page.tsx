'use client';

import { useState } from 'react';
import {
  Settings,
  Bell,
  Printer,
  Volume2,
  Lock,
  Save,
  CheckCircle2,
  Smartphone,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function RestaurantSettingsPage() {
  const [autoAccept, setAutoAccept] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [printerEnabled, setPrinterEnabled] = useState(true);
  const [printerIp, setPrinterIp] = useState('192.168.1.150');
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Restaurant operational settings saved');
    }, 600);
  };

  return (
    <div className="space-y-6 pb-16 max-w-3xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <Settings className="h-7 w-7 text-[#FCD223]" />
            Restaurant Settings
          </h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Kitchen hardware, audio alarms, automated order dispatch, and receipt printer setup
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Order Automation & Alarms */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#FCD223]" />
            Order Alerts &amp; Kitchen Sounds
          </h2>

          <div className="divide-y divide-white/5 space-y-3">
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold text-white">Loud Sound Alarm for New Orders</p>
                <p className="text-xs text-zinc-400">Continuous ring until order is acknowledged by kitchen</p>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="h-5 w-5 accent-[#FCD223]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold text-white">Auto-Accept Incoming Orders</p>
                <p className="text-xs text-zinc-400">Automatically accept orders and send straight to prep queue</p>
              </div>
              <input
                type="checkbox"
                checked={autoAccept}
                onChange={(e) => setAutoAccept(e.target.checked)}
                className="h-5 w-5 accent-[#FCD223]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold text-white">SMS Notification for Delayed Orders</p>
                <p className="text-xs text-zinc-400">Alert store manager if an order remains unaccepted for 5+ mins</p>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="h-5 w-5 accent-[#FCD223]"
              />
            </div>
          </div>
        </div>

        {/* Thermal Receipt Printer */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Printer className="h-5 w-5 text-blue-400" />
            Kitchen Thermal Receipt Printer (ESC/POS)
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Auto-Print Kitchen Docket on Order Acceptance</p>
                <p className="text-xs text-zinc-400">Print 80mm kitchen receipt automatically</p>
              </div>
              <input
                type="checkbox"
                checked={printerEnabled}
                onChange={(e) => setPrinterEnabled(e.target.checked)}
                className="h-5 w-5 accent-[#FCD223]"
              />
            </div>

            {printerEnabled && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-zinc-400">Thermal Printer Network IP Address</label>
                <div className="flex items-center gap-3 mt-1">
                  <Input
                    value={printerIp}
                    onChange={(e) => setPrinterIp(e.target.value)}
                    placeholder="192.168.1.100"
                    className="border-white/10 bg-[#0A0A0A] text-white font-mono max-w-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success('Test docket printed successfully')}
                    className="border-white/10 text-white"
                  >
                    Test Print
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

