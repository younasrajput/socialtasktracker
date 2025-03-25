import { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
};

const StatCard = ({ title, value, icon, iconColor, iconBgColor }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
