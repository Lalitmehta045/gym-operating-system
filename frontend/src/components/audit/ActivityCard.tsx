import React from 'react';
import { AuditLog } from '@/services/audit.service';
import { User, FileText, CreditCard, LogIn, LogOut, CheckCircle, XCircle, Trash, Edit, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityCardProps {
  log: AuditLog;
}

export function ActivityCard({ log }: ActivityCardProps) {
  const getIcon = () => {
    switch (log.action) {
      case 'CREATE':
        return <User className="w-4 h-4 text-green-500" />;
      case 'UPDATE':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'DELETE':
        return <Trash className="w-4 h-4 text-red-500" />;
      case 'LOGIN':
      case 'CHECK_IN':
        return <LogIn className="w-4 h-4 text-green-500" />;
      case 'LOGOUT':
      case 'CHECK_OUT':
        return <LogOut className="w-4 h-4 text-orange-500" />;
      case 'PAYMENT_SUCCESS':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'PAYMENT_FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'SUBSCRIPTION_RENEWED':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'UPLOAD':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-[var(--mute)]" />;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true });

  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[#f8f8f8] text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
        {getIcon()}
      </div>
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#fdfdfd] p-4 rounded-[12px] border border-[var(--hairline-soft)] shadow-sm">
        <div className="flex items-center justify-between space-x-2 mb-1">
          <div className="font-bold text-[var(--on-primary)] text-sm">{log.description}</div>
          <time className="text-xs font-medium text-[var(--ash)]">{timeAgo}</time>
        </div>
        <div className="text-sm text-[var(--ash)]">
          {log.entity} • {log.action}
        </div>
      </div>
    </div>
  );
}
