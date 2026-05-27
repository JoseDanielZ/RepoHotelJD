import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  message: string;
  className?: string;
}

export function Alert({ type = 'error', message, className = '' }: AlertProps) {
  const styles = {
    error:   'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info:    'bg-blue-50 border-blue-200 text-blue-700',
  };
  const Icon = type === 'success' ? CheckCircle2 : type === 'info' ? Info : AlertCircle;

  return (
    <div className={`flex items-start gap-3 border rounded-lg px-4 py-3 text-sm ${styles[type]} ${className}`}>
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
