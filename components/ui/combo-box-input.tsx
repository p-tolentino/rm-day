"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ComboBoxSelectorProps {
  items: string[];
  itemName: string;
  disabled?: boolean;
  onChange: (value: string | null) => void;
}

export default function ComboBoxSelector({
  items,
  itemName,
  disabled,
  onChange,
}: ComboBoxSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);

  // TODO: FETCH OR PASS AS PROPS ->  const comboBoxData

  const handleSelect = (selectedValue: string | null) => {
    const newValue = selectedValue === value ? null : selectedValue; // Handle toggle
    setValue(newValue); // Update local state
    onChange(newValue); // Pass new value to parent
    setOpen(false); // Close dropdown
  };

  return (
    <div className="flex gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between"
          >
            {value
              ? items.find((item) => item === value)
              : `Select ${itemName}...`}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder={`Search ${itemName}...`} />
            <CommandList>
              <CommandEmpty>No {itemName} found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item}
                    value={item}
                    onSelect={(selectedValue) => {
                      handleSelect(selectedValue);
                    }}
                  >
                    {item}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === item ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
