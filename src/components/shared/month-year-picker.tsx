"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

interface MonthYearPickerProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function MonthYearPicker({ year, month, onChange }: MonthYearPickerProps) {
  function handlePrev() {
    if (month === 0) {
      onChange(year - 1, 11);
    } else {
      onChange(year, month - 1);
    }
  }

  function handleNext() {
    if (month === 11) {
      onChange(year + 1, 0);
    } else {
      onChange(year, month + 1);
    }
  }

  return (
    <div className="space-y-3">
      {/* Header with nav arrows */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrev} title="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {MONTHS[month]} {year}
        </span>
        <Button variant="ghost" size="icon" onClick={handleNext} title="Next month">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-4 gap-1">
        {MONTH_ABBR.map((abbr, idx) => (
          <Button
            key={abbr}
            variant={idx === month ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-8 text-xs",
              idx === month && "pointer-events-none"
            )}
            onClick={() => onChange(year, idx)}
          >
            {abbr}
          </Button>
        ))}
      </div>
    </div>
  );
}
