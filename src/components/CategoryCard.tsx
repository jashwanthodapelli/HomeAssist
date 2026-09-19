import React from 'react';
import { 
  Wrench, Zap, Wind, Fan, Droplets, Gauge, Hammer, 
  Paintbrush, Cpu, Disc, Box, Filter, Tv, Sparkles, 
  ShieldAlert, Layers 
} from 'lucide-react';
import { Category } from '../types';

const iconMap: Record<string, React.ReactNode> = {
  Wrench: <Wrench className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Wind: <Wind className="w-6 h-6" />,
  Fan: <Fan className="w-6 h-6" />,
  Droplets: <Droplets className="w-6 h-6" />,
  Gauge: <Gauge className="w-6 h-6" />,
  Hammer: <Hammer className="w-6 h-6" />,
  Paintbrush: <Paintbrush className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />,
  Disc: <Disc className="w-6 h-6" />,
  Box: <Box className="w-6 h-6" />,
  Filter: <Filter className="w-6 h-6" />,
  Tv: <Tv className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6" />,
};

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
  isSelected?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  isSelected = false,
}) => {
  const icon = iconMap[category.icon] || <Layers className="w-6 h-6" />;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-200 border flex flex-col items-center text-center justify-between min-h-[140px] ${
        isSelected
          ? 'bg-blue-50 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
          : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors mb-2 ${
          isSelected
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
        }`}
      >
        {icon}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
          {category.name}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
          {category.workerCount !== undefined
            ? `${category.workerCount} workers`
            : category.description}
        </p>
      </div>
    </div>
  );
};
