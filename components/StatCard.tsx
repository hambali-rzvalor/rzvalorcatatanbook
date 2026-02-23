import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  shadowColor?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  shadowColor = 'shadow-gray-200',
}: StatCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className={`${iconBgColor} p-2.5 rounded-xl shadow-sm`}>
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2.5} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}
