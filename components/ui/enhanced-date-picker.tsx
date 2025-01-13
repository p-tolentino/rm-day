"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, setMonth, setYear, subYears } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface EnhancedDatePickerProps {
  disabled?: boolean;
  value?: Date;
  onChange: (date: Date | undefined) => void;
}

export function EnhancedDatePicker({
  disabled,
  value,
  onChange,
}: EnhancedDatePickerProps) {
  const [today, setToday] = React.useState(new Date());
  const minDate = new Date("1900-01-01");
  const defaultDOB = subYears(today, 18);

  const [date, setDate] = React.useState<Date>(value || defaultDOB);
  const [calendarDate, setCalendarDate] = React.useState<Date>(
    value || defaultDOB
  );

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setCalendarDate(newDate);
      onChange(newDate);
    }
  };

  React.useEffect(() => {
    if (value) {
      setDate(value);
      setCalendarDate(value);
    }
  }, [value]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setToday(new Date());
    }, 1000 * 60 * 60 * 24); // Updates once per day

    return () => clearInterval(interval);
  }, []);

  const years = React.useMemo(() => {
    const min18Year = subYears(today, 18).getFullYear();
    return Array.from(
      { length: min18Year - 1900 + 1 },
      (_, i) => min18Year - i
    );
  }, [today]);

  const months = [
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
  ];

  const handleYearChange = (year: string) => {
    const newDate = setYear(calendarDate, parseInt(year));
    setCalendarDate(newDate);
    handleDateChange(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(calendarDate, months.indexOf(month));
    setCalendarDate(newDate);
    handleDateChange(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-center justify-between p-2 border-b">
          <Select
            onValueChange={handleMonthChange}
            value={months[calendarDate.getMonth()]}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleYearChange}
            value={calendarDate.getFullYear().toString()}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          defaultMonth={defaultDOB}
          selected={date}
          onSelect={handleDateChange}
          month={calendarDate}
          onMonthChange={setCalendarDate}
          disabled={(date) => date > subYears(today, 18) || date < minDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
