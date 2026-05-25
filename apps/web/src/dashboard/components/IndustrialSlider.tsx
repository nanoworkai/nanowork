import { LucideIcon } from "lucide-react";

interface IndustrialSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  icon: LucideIcon;
  color: 'emerald' | 'blue' | 'purple' | 'orange';
  displayValue: string;
  minLabel: string;
  maxLabel: string;
}

const colorConfig = {
  emerald: {
    iconClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    thumbClass: 'bg-emerald-500 border-emerald-400 shadow-emerald-500/50',
    gradient: 'rgb(16 185 129)'
  },
  blue: {
    iconClass: 'text-blue-400',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    thumbClass: 'bg-blue-500 border-blue-400 shadow-blue-500/50',
    gradient: 'rgb(59 130 246)'
  },
  purple: {
    iconClass: 'text-purple-400',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    thumbClass: 'bg-purple-500 border-purple-400 shadow-purple-500/50',
    gradient: 'rgb(168 85 247)'
  },
  orange: {
    iconClass: 'text-orange-400',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    thumbClass: 'bg-orange-500 border-orange-400 shadow-orange-500/50',
    gradient: 'rgb(249 115 22)'
  }
};

export default function IndustrialSlider({
  label,
  value,
  min,
  max,
  onChange,
  disabled = false,
  icon: Icon,
  color,
  displayValue,
  minLabel,
  maxLabel
}: IndustrialSliderProps) {
  const config = colorConfig[color];
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${config.iconClass}`} />
          <span className="text-xs font-semibold text-white/80">{label}</span>
        </div>
        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${config.badgeClass}`}>
          {displayValue}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={`
            w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:${config.thumbClass}
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:${config.thumbClass}
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:shadow-lg
          `}
          style={{
            background: `linear-gradient(to right, ${config.gradient} 0%, ${config.gradient} ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <div className="flex justify-between mt-1.5 px-1">
          <span className="text-[9px] text-white/30 uppercase font-mono">{minLabel}</span>
          <span className="text-[9px] text-white/30 uppercase font-mono">{maxLabel}</span>
        </div>
      </div>
    </div>
  );
}
