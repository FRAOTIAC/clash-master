"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  formatDateTimeForInput,
  formatDateTimeDisplay,
  getPresetTimeRange,
  type TimeRange,
} from "@/lib/api";

type PresetType = '7d' | '30d' | '24h' | 'today' | 'custom';

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange, preset: PresetType) => void;
  className?: string;
}

const PRESETS: { value: PresetType; label: string }[] = [
  { value: '24h', label: '最近24小时' },
  { value: '7d', label: '最近7天' },
  { value: '30d', label: '最近30天' },
  { value: 'today', label: '今天' },
  { value: 'custom', label: '自定义' },
];

export function TimeRangePicker({ value, onChange, className }: TimeRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('24h');
  const [customStart, setCustomStart] = useState(value.start.slice(0, 16));
  const [customEnd, setCustomEnd] = useState(value.end.slice(0, 16));

  // Update custom inputs when value changes externally
  useEffect(() => {
    setCustomStart(value.start.slice(0, 16));
    setCustomEnd(value.end.slice(0, 16));
  }, [value]);

  const handlePresetClick = (preset: PresetType) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const range = getPresetTimeRange(preset);
      onChange(range, preset);
      setOpen(false);
    }
  };

  const handleCustomApply = () => {
    const range: TimeRange = {
      start: new Date(customStart).toISOString(),
      end: new Date(customEnd).toISOString(),
    };
    onChange(range, 'custom');
    setOpen(false);
  };

  const handleClear = () => {
    const range = getPresetTimeRange('24h');
    setSelectedPreset('24h');
    onChange(range, '24h');
    setOpen(false);
  };

  const displayText = () => {
    if (selectedPreset === 'custom') {
      return `${formatDateTimeDisplay(value.start)} - ${formatDateTimeDisplay(value.end)}`;
    }
    const preset = PRESETS.find(p => p.value === selectedPreset);
    return preset?.label || '最近24小时';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between min-w-[200px] bg-background/50 backdrop-blur-sm",
            className
          )}
        >
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{displayText()}</span>
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Card className="border-0 shadow-none">
          <div className="p-3 space-y-3">
            {/* Preset Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={selectedPreset === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(preset.value)}
                  className="justify-start"
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Custom Range Inputs */}
            {selectedPreset === 'custom' && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    开始时间
                  </label>
                  <input
                    type="datetime-local"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    结束时间
                  </label>
                  <input
                    type="datetime-local"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleCustomApply}
                  >
                    应用
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClear}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Current Selection Info */}
            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>开始:</span>
                <span className="font-mono">{formatDateTimeDisplay(value.start)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>结束:</span>
                <span className="font-mono">{formatDateTimeDisplay(value.end)}</span>
              </div>
            </div>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

// Quick preset buttons for common ranges
export function QuickTimePresets({ onChange }: { onChange: (range: TimeRange) => void }) {
  const presets = [
    { label: '24小时', range: getPresetTimeRange('24h') },
    { label: '7天', range: getPresetTimeRange('7d') },
    { label: '30天', range: getPresetTimeRange('30d') },
  ];

  return (
    <div className="flex gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          onClick={() => onChange(preset.range)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
