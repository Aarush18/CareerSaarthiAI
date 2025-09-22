import React, { ReactNode, useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command as CommandRoot,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandResponsiveDialog,
} from "@/components/ui/command";

interface Option {
  id: string;
  value: string;
  children: ReactNode;
  label?: string;
}

interface Props {
  options: Option[];
  onSelect: (value: string) => void;
  onSearch?: (value: string) => void;
  value: string;
  placeholder?: string;
  isSearchable?: boolean;
  className?: string;
  disabled?: boolean;
}

export const CommandSelect = ({
  options,
  onSelect,
  onSearch,
  value,
  placeholder = "Select a value",
  isSearchable, // reserved
  className,
  disabled,
}: Props) => {
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const handleOpenChange = (open : boolean) => {
    onSearch?.("");
    setOpen(open);
  }

  return (
    <>
      <Button
        variant="outline"
        type="button"
        disabled={disabled}
        className={cn(
          "h-9 justify-between font-normal px-2 w-full",
          !selectedOption && "text-muted-foreground",
          className
        )}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <div className="truncate">
          {selectedOption?.children ?? placeholder}
        </div>
        <ChevronsUpDown className="ml-2 size-4 opacity-60" />
      </Button>

      <CommandResponsiveDialog
        open={open}
        onOpenChange={handleOpenChange}
        shouldFilter={!onSearch} // if you supply onSearch, dialog won't double-filter
      >
        <CommandRoot>
          <CommandInput
            placeholder="Search…"
            // when onSearch is provided, we forward the raw input value out
            onValueChange={onSearch}
          />
          <CommandList className="max-h-64 overflow-y-auto overscroll-contain">
            <CommandEmpty>
              <span className="text-muted-foreground text-sm">No options found</span>
            </CommandEmpty>

            {options.map((option) => (
              <CommandItem
                key={option.id}
                value={option.value}
                onSelect={() => {
                  onSelect(option.value);
                  setOpen(false);
                }}
              >
                {option.children}
              </CommandItem>
            ))}
          </CommandList>
        </CommandRoot>
      </CommandResponsiveDialog>
    </>
  );
};
