'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  CalendarCheck, 
  CreditCard, 
  LineChart, 
  QrCode, 
  RefreshCw, 
  MessageCircle, 
  Building2, 
  ChevronRight 
} from 'lucide-react';

const featuresList = [
  {
    id: 'members',
    title: 'Member Management',
    description: 'A 360-degree view of your community. Track active memberships, personal details, and engagement history in one clean interface.',
    icon: Users,
  },
  {
    id: 'attendance',
    title: 'Attendance Tracking',
    description: 'Say goodbye to physical registers. Capture every check-in with precision and prevent unauthorized access effortlessly.',
    icon: CalendarCheck,
  },
  {
    id: 'qr',
    title: 'QR Check-ins',
    description: 'Fast, secure, and contactless entry. Generate unique QR codes for every member to streamline front-desk operations.',
    icon: QrCode,
  },
  {
    id: 'subscriptions',
    title: 'Subscription Management',
    description: 'Automate billing cycles, handle pro-rata upgrades, and manage pause/resume requests without manual intervention.',
    icon: RefreshCw,
  },
  {
    id: 'payments',
    title: 'Payments & Invoices',
    description: 'Your cash flow, simplified. Automate reminders and let members pay online with integrated gateways.',
    icon: CreditCard,
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Automation',
    description: 'Engage members instantly. Trigger automated WhatsApp messages for renewals, offers, and absent alerts.',
    icon: MessageCircle,
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Data-driven decisions for gym owners. Understand peak hours, retention rates, and revenue trends at a glance.',
    icon: LineChart,
  },
  {
    id: 'multitenant',
    title: 'Multi-Tenant SaaS',
    description: 'Manage multiple branches from a single dashboard. Centralized reporting with location-specific access controls.',
    icon: Building2,
  }
];

function Counter({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const end = value;
    const duration = 1500;
    let startTime: number | null = null;
    let animationFrame: number;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * end));
      
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    
    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [value]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function AnalyticsDemo() {
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoopKey(prev => prev + 1);
    }, 9000); // Loop every 9 seconds
    return () => clearInterval(timer);
  }, []);

  const kpis = [
    { label: 'Monthly Revenue', value: 24500, prefix: '$', color: 'text-[#2563EB]', trend: '+12%' },
    { label: 'Active Members', value: 1250, prefix: '', color: 'text-[#14B8A6]', trend: '+5%' },
    { label: 'Attendance', value: 84, suffix: '%', color: 'text-[#001C41]', trend: '+2%' },
  ];

  return (
    <div key={loopKey} className="flex-1 flex flex-col h-full gap-2 relative">
      <div className="flex gap-2">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.15 }}
            className="flex-1 bg-[var(--canvas-light)] border border-slate-100 rounded-lg p-2.5 shadow-sm"
          >
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[9px] font-semibold text-slate-500">{kpi.label}</span>
              <span className={`text-[8px] font-bold ${kpi.color} bg-slate-50 px-1 py-0.5 rounded`}>{kpi.trend}</span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              <Counter value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 flex gap-2 min-h-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex-[2] bg-[var(--canvas-light)] border border-slate-100 rounded-lg p-2.5 shadow-sm flex flex-col relative overflow-hidden"
        >
          <div className="text-[9px] font-semibold text-slate-700 mb-1">Revenue Growth</div>
          <div className="flex-1 relative w-full mt-1">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <motion.path
                d="M 0 35 Q 15 32, 25 25 T 45 22 T 65 15 T 85 8 L 100 4"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
              />
              <motion.path
                d="M 0 35 Q 15 32, 25 25 T 45 22 T 65 15 T 85 8 L 100 4 L 100 40 L 0 40 Z"
                fill="url(#gradient-blue)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2 }}
              />
              <defs>
                <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            <motion.div
              className="absolute w-2.5 h-2.5 bg-[var(--canvas-light)] border-2 border-[#2563EB] rounded-full shadow-sm"
              style={{ top: '10%', right: '-2px', transformOrigin: 'center' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.3, type: "spring" }}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex-1 bg-[var(--canvas-light)] border border-slate-100 rounded-lg p-2.5 shadow-sm flex flex-col"
        >
          <div className="text-[9px] font-semibold text-slate-700 mb-1">Traffic</div>
          <div className="flex-1 flex items-end justify-between gap-1 pt-1">
            {[40, 60, 45, 80, 65, 90, 75].map((h, i) => (
              <div key={i} className="w-full bg-teal-50 rounded-t-sm relative h-full flex items-end overflow-hidden">
                <motion.div
                  className="w-full bg-[#14B8A6] rounded-t-sm"
                  initial={{ height: '0%' }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.7, delay: 1.5 + i * 0.08, ease: "easeOut" }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-1 left-1 right-1 bg-[#001C41] text-white p-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 3.5, type: "spring", stiffness: 90 }}
      >
        <div className="h-6 w-6 rounded-full bg-[#2563EB]/20 flex items-center justify-center shrink-0 relative">
          <div className="absolute inset-0 rounded-full border border-[#2563EB]/40 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="h-2 w-2 rounded-full bg-[#2563EB]" />
        </div>
        <div>
          <div className="text-[8px] font-medium text-slate-400 mb-0.5 uppercase tracking-wider">Business Insight</div>
          <div className="text-[10px] font-medium leading-tight text-slate-100">Peak retention is linked to users attending 3+ classes/wk. <span className="text-[#14B8A6]">Action recommended.</span></div>
        </div>
      </motion.div>
    </div>
  );
}

function ModuleVisual({ moduleId }: { moduleId: string }) {
  switch (moduleId) {
    case 'members':
      const membersData = [
        { name: 'Sarah Jenkins', plan: 'Pro Annual', status: 'Active', color: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700' },
        { name: 'Mike Ross', plan: 'Monthly Flex', status: 'Pending', color: 'bg-amber-500', bg: 'bg-amber-100', text: 'text-amber-700' },
        { name: 'David Chen', plan: 'Pro Annual', status: 'Active', color: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700' },
      ];
      return (
        <div className="flex-1 flex flex-col gap-3 h-full">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-slate-800">Recent Members</h4>
            <div className="px-3 py-1 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors border border-blue-200 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-semibold text-blue-600">+ Add Member</span>
            </div>
          </div>
          {membersData.map((member, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[var(--canvas-light)] border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200">
                  <span className="text-xs font-bold text-slate-500">{member.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-0.5">{member.name}</div>
                  <div className="text-[10px] font-medium text-slate-500">{member.plan}</div>
                </div>
              </div>
              <div className={`px-2 py-0.5 ${member.bg} border border-white/50 rounded-full flex items-center justify-center`}>
                <span className={`text-[9px] font-bold ${member.text}`}>{member.status}</span>
              </div>
            </div>
          ))}
        </div>
      );
    case 'attendance':
      const scans = [
        { name: 'Emma W.', time: '08:15 AM', type: 'Check-in' },
        { name: 'James L.', time: '08:12 AM', type: 'Check-in' },
        { name: 'Sophia R.', time: '08:05 AM', type: 'Check-in' }
      ];
      return (
        <div className="flex-1 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold text-slate-800">Live Attendance</h4>
            <span className="text-[10px] font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full border border-teal-100">42 Active Now</span>
          </div>
          <div className="flex-1 border border-teal-200/60 rounded-xl bg-teal-50/30 flex flex-col items-center justify-center relative overflow-hidden mb-3 group">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
            <div className="h-16 w-16 border-2 border-teal-400 rounded-xl relative z-10 flex items-center justify-center bg-[var(--canvas-light)] shadow-sm overflow-hidden">
              <div className="w-full h-0.5 bg-teal-500 shadow-[0_0_12px_2px_rgba(20,184,166,0.8)] animate-[bounce_2s_infinite]" />
              <div className="absolute inset-2 border-2 border-dashed border-teal-200 rounded-md"></div>
            </div>
            <div className="mt-4 text-xs font-semibold text-teal-700 z-10 group-hover:scale-105 transition-transform">Ready to Scan</div>
          </div>
          <div className="flex gap-2">
            {scans.map((scan, i) => (
              <div key={i} className="flex-1 py-2 bg-[var(--canvas-light)] border border-slate-100 rounded-lg flex flex-col items-center shadow-sm">
                 <div className="text-[10px] font-bold text-slate-800">{scan.name}</div>
                 <div className="text-[9px] text-slate-500">{scan.time}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'qr':
      return (
        <div className="flex-1 flex flex-col items-center justify-center h-full gap-4 relative">
          <div className="relative w-36 h-56 border-[6px] border-slate-800 rounded-[2rem] bg-[var(--canvas-light)] flex flex-col items-center py-4 shadow-2xl overflow-hidden z-10">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-6" />
            <div className="w-24 h-24 bg-slate-100 rounded-lg p-2 relative">
              <div className="w-full h-full border-[3px] border-slate-800 border-dashed rounded-sm opacity-60" />
              <div className="absolute top-2 left-2 w-3 h-3 bg-slate-800" />
              <div className="absolute top-2 right-2 w-3 h-3 bg-slate-800" />
              <div className="absolute bottom-2 left-2 w-3 h-3 bg-slate-800" />
              
              <motion.div 
                className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.6)]"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <div className="mt-6 text-[10px] font-bold text-slate-400">NexUp Fit Member</div>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full z-10 shadow-sm"
          >
            Scan Successful
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400/10 blur-3xl rounded-full" />
        </div>
      );
    case 'subscriptions':
      const plans = [
        { name: 'Monthly Flex', price: '$49', active: true },
        { name: 'Pro Annual', price: '$399', active: false },
      ];
      return (
        <div className="flex-1 flex flex-col h-full gap-3">
          <div className="text-sm font-semibold text-slate-800 mb-1">Plan Management</div>
          {plans.map((plan, i) => (
            <div key={i} className={`p-4 rounded-xl border ${plan.active ? 'border-blue-500 bg-blue-50/30 shadow-sm' : 'border-slate-100 bg-[var(--canvas-light)]'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-800 text-sm">{plan.name}</span>
                <span className="font-bold text-blue-600 text-sm">{plan.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">{plan.active ? 'Renews in 12 days' : 'Inactive'}</span>
                <div className={`text-[9px] px-2.5 py-1 rounded-full font-bold ${plan.active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer transition-colors'}`}>
                  {plan.active ? 'Active Plan' : 'Upgrade'}
                </div>
              </div>
            </div>
          ))}
          <div className="mt-auto bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col gap-2">
             <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
               <span>Annual Plan Adoption</span>
               <span className="text-blue-600">65%</span>
             </div>
             <div className="h-1.5 bg-slate-200 rounded-full w-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-blue-500 rounded-full" 
                />
             </div>
          </div>
        </div>
      );
    case 'payments':
      const invoices = [
        { id: 'INV-2024', amount: '$120.00', status: 'Paid' },
        { id: 'INV-2025', amount: '$45.00', status: 'Pending' },
        { id: 'INV-2026', amount: '$299.00', status: 'Paid' },
      ];
      return (
        <div className="flex-1 flex flex-col gap-3 h-full">
          <div className="flex gap-3 mb-1">
            <div className="flex-1 bg-[var(--canvas-light)] border border-slate-100 rounded-lg p-3 shadow-sm relative overflow-hidden">
              <div className="text-[10px] font-medium text-slate-500 mb-1">Monthly Revenue</div>
              <div className="text-lg font-bold text-slate-800">$12,450</div>
              <div className="absolute top-0 right-0 p-2 text-emerald-500 text-[10px] font-bold bg-emerald-50 rounded-bl-lg">+14%</div>
            </div>
            <div className="flex-1 bg-[var(--canvas-light)] border border-slate-100 rounded-lg p-3 shadow-sm relative overflow-hidden">
              <div className="text-[10px] font-medium text-slate-500 mb-1">Outstanding</div>
              <div className="text-lg font-bold text-amber-600">$840</div>
              <div className="absolute top-0 right-0 p-2 text-amber-600 text-[10px] font-bold bg-amber-50 rounded-bl-lg">5 Invoices</div>
            </div>
          </div>
          <div className="flex-1 bg-[var(--canvas-light)] border border-slate-100 rounded-lg shadow-sm flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50">
              <div className="text-[9px] font-semibold text-slate-500 w-1/3">INVOICE</div>
              <div className="text-[9px] font-semibold text-slate-500 w-1/3 text-right">AMOUNT</div>
              <div className="text-[9px] font-semibold text-slate-500 w-1/3 text-right">STATUS</div>
            </div>
            {invoices.map((inv, i) => (
              <div key={i} className="flex p-2 gap-2 border-b border-slate-50 last:border-0 items-center hover:bg-slate-50/50 transition-colors">
                <div className="text-[10px] font-medium text-slate-800 w-1/3">{inv.id}</div>
                <div className="text-[10px] font-bold text-slate-700 w-1/3 text-right">{inv.amount}</div>
                <div className="w-1/3 flex justify-end">
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {inv.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'whatsapp':
      return (
        <div className="flex-1 flex flex-col h-full gap-2 relative">
          <div className="flex justify-between items-center mb-2">
             <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
               <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                  <MessageCircle className="w-4 h-4 text-white" />
               </div>
               Automated Flows
             </div>
             <div className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-full">Active</div>
          </div>
          <div className="flex-1 bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:12px_12px]" />
            <motion.div 
              initial={{ opacity: 0, x: -10, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative self-start max-w-[85%] bg-[var(--canvas-light)] border border-slate-200 p-3 rounded-2xl rounded-tl-none text-[11px] text-slate-700 shadow-sm"
            >
              Hi Mike, your Pro Annual plan expires in 3 days. Tap to renew! 🚀
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="relative self-start max-w-[85%] bg-blue-50 border border-blue-100 p-3 rounded-xl text-[11px] text-blue-700 font-semibold cursor-pointer hover:bg-blue-100 transition-colors shadow-sm"
            >
              💳 Pay $399 via secure link
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 10, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.5 }}
              className="relative self-end max-w-[85%] bg-emerald-500 text-white p-3 rounded-2xl rounded-tr-none text-[11px] shadow-sm font-medium mt-2"
            >
              Payment successful. Thanks!
            </motion.div>
          </div>
        </div>
      );
    case 'analytics':
      return <AnalyticsDemo />;
    case 'multitenant':
      const branches = [
        { name: 'Downtown Studio', rev: '$12k', perf: '+5%' },
        { name: 'Westside Gym', rev: '$8.5k', perf: '+2%' },
        { name: 'East End Arena', rev: '$15k', perf: '+12%' },
      ];
      return (
        <div className="flex-1 flex flex-col h-full gap-3 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm font-semibold text-slate-800">Global Overview</div>
            </div>
          </div>
          <div className="space-y-2">
            {branches.map((b, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex justify-between items-center p-3.5 bg-[var(--canvas-light)] border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{b.name}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">{b.perf} growth</div>
                </div>
                <div className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">{b.rev}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-auto flex justify-center">
            <div className="px-4 py-2 bg-slate-800 text-white text-[10px] font-bold rounded-full cursor-pointer hover:bg-slate-700 transition-colors shadow-md">
              Switch Branch
            </div>
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-slate-200/40 blur-3xl rounded-full -z-10" />
        </div>
      );
    default:
      return null;
  }
}

export function ModulesSection() {
  const [activeFeature, setActiveFeature] = useState(featuresList[0].id);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((current) => {
        const currentIndex = featuresList.findIndex(f => f.id === current);
        const nextIndex = (currentIndex + 1) % featuresList.length;
        return featuresList[nextIndex].id;
      });
    }, 2000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="features" className="bg-[var(--canvas)] py-[var(--spacing-5xl)] px-[var(--spacing-lg)] relative">
      <div className="mx-auto w-full max-w-[1640px]">
        
        <div className="mb-[var(--spacing-section)] max-w-2xl">
          <div className="text-caption-mono text-[var(--mute)] mb-[var(--spacing-sm)] uppercase tracking-wider">Features</div>
          <h2 className="text-display-lg text-[var(--ink)] mb-[var(--spacing-md)]">
            Everything you need.<br/>
            <span className="text-[var(--mute)]">Nothing you don't.</span>
          </h2>
          <p className="text-body-lg text-[var(--ink-soft)]">
            A comprehensive suite of tools designed to scale your fitness business.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-[var(--spacing-section)] relative">
          
          {/* Left: Feature List */}
          <div className="w-full lg:w-5/12 flex flex-col gap-2 relative z-10 h-[750px]">
            {featuresList.map((feature) => {
              const isActive = activeFeature === feature.id;
              return (
                <div 
                  key={feature.id} 
                  onMouseEnter={() => setActiveFeature(feature.id)}
                  className={`relative p-[var(--spacing-md)] rounded-[var(--radius-marketing)] cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'card-marketing shadow-md' 
                      : 'hover:bg-[var(--canvas-paper)] border border-transparent'
                  }`}
                >
                  {/* Active Indicator Line */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeFeatureIndicator"
                      className="absolute left-0 top-1/4 bottom-1/4 w-[4px] bg-[var(--brand)] rounded-r-[var(--radius-full)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[var(--spacing-md)]">
                      <div className={`p-2.5 rounded-[var(--radius-app-md)] transition-colors ${isActive ? 'bg-[var(--ink)] text-[var(--on-primary)] shadow-sm' : 'bg-[var(--canvas-paper)] text-[var(--mute)]'}`}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`text-body-md-strong transition-colors ${isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]'}`}>
                          {feature.title}
                        </h3>
                      </div>
                    </div>
                    {isActive && <ChevronRight className="w-5 h-5 text-[var(--mute)]" />}
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-[var(--spacing-sm)] pl-[3.5rem] pr-[var(--spacing-sm)] text-body-sm text-[var(--ink-soft)] leading-relaxed">
                          {feature.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right: Preview Panel */}
          <div className="w-full lg:w-7/12 sticky top-24 h-[550px] lg:h-[650px] z-10">
            <div className="w-full h-full rounded-[var(--radius-marketing)] bg-[var(--canvas-paper)] overflow-hidden relative p-[var(--spacing-xl)] flex items-center justify-center">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="w-full h-full max-h-[500px] max-w-[500px] studio-window flex flex-col relative z-20"
                >
                  {/* MacOS style header */}
                  <div className="flex gap-[var(--spacing-xs)] mb-[var(--spacing-md)] items-center">
                    <div className="w-3 h-3 rounded-[var(--radius-full)] bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-[var(--radius-full)] bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-[var(--radius-full)] bg-[#27c93f]" />
                  </div>
                  
                  {/* Dynamic Content */}
                  <div className="flex-1 relative overflow-hidden flex flex-col bg-[var(--canvas-light)] rounded-[var(--radius-app-md)] p-[var(--spacing-md)] text-[var(--ink)]">
                    <ModuleVisual moduleId={activeFeature} />
                  </div>
                </motion.div>
              </AnimatePresence>
              
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
