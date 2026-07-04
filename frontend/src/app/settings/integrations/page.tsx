"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useGetIntegrationSettings, 
  useUpdateRazorpay, 
  useUpdateWhatsapp, 
  useUpdateNotifications 
} from "@/hooks/api/useIntegrationSettings";
import { useProfile } from "@/hooks/api/useSettings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

function Toggle({ checked, onChange, disabled }: { checked: boolean, onChange: (c: boolean) => void, disabled?: boolean }) {
  return (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => !disabled && onChange(e.target.checked)} disabled={disabled} />
      <div className="w-11 h-6 bg-[#ebebeb] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--canvas-light)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#171717]"></div>
    </label>
  );
}

function PasswordInput({ value, onChange, disabled, placeholder }: any) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ash)] hover:text-[var(--on-primary)]"
        onClick={() => setShow(!show)}
        disabled={disabled}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

const razorpaySchema = z.object({
  razorpayEnabled: z.boolean(),
  razorpayKeyId: z.string().optional(),
  razorpayKeySecret: z.string().optional(),
  razorpayWebhookSecret: z.string().optional(),
});

const whatsappSchema = z.object({
  whatsappEnabled: z.boolean(),
  whatsappPhoneNumberId: z.string().optional(),
  whatsappAccessToken: z.string().optional(),
  whatsappBusinessAccountId: z.string().optional(),
});

const notificationsSchema = z.object({
  notifyDaysBeforeExpiry: z.number().min(1).max(30),
  notifyOnPaymentReceived: z.boolean(),
  notifyOnMembershipExpiry: z.boolean(),
});

export default function IntegrationsSettingsPage() {
  const { data: profile } = useProfile();
  const { data: settings, isLoading } = useGetIntegrationSettings();
  
  const updateRazorpay = useUpdateRazorpay();
  const updateWhatsapp = useUpdateWhatsapp();
  const updateNotifications = useUpdateNotifications();
  
  const isOwner = profile?.role === 'OWNER';
  
  const [toasts, setToasts] = useState<{ id: number, type: 'success' | 'error', message: string }[]>([]);
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const formRazorpay = useForm({
    resolver: zodResolver(razorpaySchema),
    defaultValues: {
      razorpayEnabled: false,
      razorpayKeyId: "",
      razorpayKeySecret: "",
      razorpayWebhookSecret: "",
    }
  });
  
  const formWhatsapp = useForm({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      whatsappEnabled: false,
      whatsappPhoneNumberId: "",
      whatsappAccessToken: "",
      whatsappBusinessAccountId: "",
    }
  });
  
  const formNotifications = useForm({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      notifyDaysBeforeExpiry: 7,
      notifyOnPaymentReceived: true,
      notifyOnMembershipExpiry: true,
    }
  });

  useEffect(() => {
    if (settings) {
      formRazorpay.reset({
        razorpayEnabled: settings.razorpayEnabled || false,
        razorpayKeyId: settings.razorpayKeyId || "",
        razorpayKeySecret: settings.razorpayKeySecret || "",
        razorpayWebhookSecret: settings.razorpayWebhookSecret || "",
      });
      formWhatsapp.reset({
        whatsappEnabled: settings.whatsappEnabled || false,
        whatsappPhoneNumberId: settings.whatsappPhoneNumberId || "",
        whatsappAccessToken: settings.whatsappAccessToken || "",
        whatsappBusinessAccountId: settings.whatsappBusinessAccountId || "",
      });
      formNotifications.reset({
        notifyDaysBeforeExpiry: settings.notifyDaysBeforeExpiry ?? 7,
        notifyOnPaymentReceived: settings.notifyOnPaymentReceived ?? true,
        notifyOnMembershipExpiry: settings.notifyOnMembershipExpiry ?? true,
      });
    }
  }, [settings, formRazorpay, formWhatsapp, formNotifications]);

  const onRazorpaySubmit = async (values: any) => {
    if (!isOwner) return;
    try {
      await updateRazorpay.mutateAsync(values);
      showToast('success', 'Razorpay settings saved successfully');
    } catch (err) {
      showToast('error', 'Failed to save Razorpay settings');
    }
  };

  const onWhatsappSubmit = async (values: any) => {
    if (!isOwner) return;
    try {
      await updateWhatsapp.mutateAsync(values);
      showToast('success', 'WhatsApp settings saved successfully');
    } catch (err) {
      showToast('error', 'Failed to save WhatsApp settings');
    }
  };

  const onNotificationsSubmit = async (values: any) => {
    if (!isOwner) return;
    try {
      await updateNotifications.mutateAsync(values);
      showToast('success', 'Notification preferences saved successfully');
    } catch (err) {
      showToast('error', 'Failed to save Notification preferences');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6">
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-64 bg-gray-200 animate-pulse rounded mt-2"></div>
        <div className="h-64 bg-[var(--canvas-soft)] animate-pulse rounded-[6px] border border-[var(--hairline-soft)] mt-6"></div>
      </div>
    );
  }

  const rzEnabled = formRazorpay.watch("razorpayEnabled");
  const waEnabled = formWhatsapp.watch("whatsappEnabled");

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-[18px] font-medium text-[var(--on-primary)]">Integrations</h2>
        <p className="text-[14px] text-[var(--mute)] mt-1">
          Manage third-party integrations and notification preferences.
        </p>
      </div>

      <div className="max-w-2xl space-y-6 border-t border-[var(--hairline-soft)] pt-6">
        {/* Razorpay Settings Card */}
        <div className="border border-[var(--hairline-soft)] rounded-[6px] p-6 bg-[var(--canvas-light)]">
          <form onSubmit={formRazorpay.handleSubmit(onRazorpaySubmit)} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-medium text-[var(--on-primary)]"> Razorpay Integration</h3>
                <p className="text-[14px] text-[var(--mute)]">Accept online payments from members</p>
              </div>
              <Controller
                control={formRazorpay.control}
                name="razorpayEnabled"
                render={({ field }) => (
                  <Toggle checked={field.value} onChange={field.onChange} disabled={!isOwner} />
                )}
              />
            </div>
            
            {rzEnabled && (
              <div className="pt-4 border-t border-[var(--hairline-soft)] space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[var(--on-primary)]">Razorpay Key ID</label>
                  <Input {...formRazorpay.register("razorpayKeyId")} disabled={!isOwner} />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[var(--on-primary)]">Razorpay Key Secret</label>
                  <Controller
                    control={formRazorpay.control}
                    name="razorpayKeySecret"
                    render={({ field }) => <PasswordInput {...field} disabled={!isOwner} />}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[var(--on-primary)]">Webhook Secret</label>
                  <Controller
                    control={formRazorpay.control}
                    name="razorpayWebhookSecret"
                    render={({ field }) => <PasswordInput {...field} disabled={!isOwner} />}
                  />
                </div>
              </div>
            )}
            
            {isOwner && (
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={updateRazorpay.isPending} variant="primary">
                  {updateRazorpay.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* WhatsApp Settings Card */}
        <div className="border border-[var(--hairline-soft)] rounded-[6px] p-6 bg-[var(--canvas-light)]">
          <form onSubmit={formWhatsapp.handleSubmit(onWhatsappSubmit)} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-medium text-[var(--on-primary)]"> WhatsApp Integration</h3>
                <p className="text-[14px] text-[var(--mute)]">Send automated messages to members</p>
              </div>
              <Controller
                control={formWhatsapp.control}
                name="whatsappEnabled"
                render={({ field }) => (
                  <Toggle checked={field.value} onChange={field.onChange} disabled={!isOwner} />
                )}
              />
            </div>
            
            {waEnabled && (
              <div className="pt-4 border-t border-[var(--hairline-soft)] space-y-4 mt-4">
                <p className="text-[12px] text-[var(--ash)] italic">Get these from Meta Business Manager</p>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[var(--on-primary)]">Phone Number ID</label>
                  <Input {...formWhatsapp.register("whatsappPhoneNumberId")} disabled={!isOwner} />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[var(--on-primary)]">Access Token</label>
                  <Controller
                    control={formWhatsapp.control}
                    name="whatsappAccessToken"
                    render={({ field }) => <PasswordInput {...field} disabled={!isOwner} />}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[var(--on-primary)]">Business Account ID</label>
                  <Input {...formWhatsapp.register("whatsappBusinessAccountId")} disabled={!isOwner} />
                </div>
              </div>
            )}
            
            {isOwner && (
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={updateWhatsapp.isPending} variant="primary">
                  {updateWhatsapp.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Notification Preferences Card */}
        <div className="border border-[var(--hairline-soft)] rounded-[6px] p-6 bg-[var(--canvas-light)]">
          <form onSubmit={formNotifications.handleSubmit(onNotificationsSubmit)} className="space-y-4">
            <div className="mb-4">
              <h3 className="text-[16px] font-medium text-[var(--on-primary)]"> Notification Preferences</h3>
              <p className="text-[14px] text-[var(--mute)]">Configure when to send member notifications</p>
            </div>
            
            <div className="space-y-6 pt-4 border-t border-[var(--hairline-soft)]">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-medium text-[var(--on-primary)]">Notify members before expiry (days)</label>
                <div className="w-24">
                  <Input 
                    type="number" 
                    min={1} 
                    max={30} 
                    {...formNotifications.register("notifyDaysBeforeExpiry", { valueAsNumber: true })} 
                    disabled={!isOwner} 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-[var(--on-primary)]">Notify on payment received</span>
                <Controller
                  control={formNotifications.control}
                  name="notifyOnPaymentReceived"
                  render={({ field }) => (
                    <Toggle checked={field.value} onChange={field.onChange} disabled={!isOwner} />
                  )}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-[var(--on-primary)]">Notify on membership expiry</span>
                <Controller
                  control={formNotifications.control}
                  name="notifyOnMembershipExpiry"
                  render={({ field }) => (
                    <Toggle checked={field.value} onChange={field.onChange} disabled={!isOwner} />
                  )}
                />
              </div>
            </div>
            
            {isOwner && (
              <div className="flex justify-end pt-4 mt-4">
                <Button type="submit" disabled={updateNotifications.isPending} variant="primary">
                  {updateNotifications.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-3 rounded-[6px] shadow-lg text-[14px] font-medium text-white ${t.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
              {t.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
