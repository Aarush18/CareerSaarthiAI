import React, { ReactNode, useState } from "react";
import { ChevronsUpDownIcon, Command } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
    CommandResponsiveDialog,
} from "@/components/ui/command";

interface Props {
    options: Array<{
        id: string,
        value: string,
        children: ReactNode
    }>;
    onSelect: (value: string) => void;
    onSearch?: (value: string) => void;
    value: string;
    placeholder?: string;
    isSearchable?: boolean;
    className?: string;
}

export const CommandSelect = ({
    options,
    onSelect,
    onSearch,
    value,
    placeholder = "Select a value",
    isSearchable,
    className,
}: Props) => {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find((option) => option.value === value)

    return (
        <>
            <Button 
            variant="outline"
            type="button"
            className={cn("h-9 justify-between font-normal px-2",
                !selectedOption && "text-muted-foreground",
                className,
            )}
    onClick={() => setOpen(true)}
            >
                <div>
                    {selectedOption?.children ?? placeholder}
                </div>
                <ChevronsUpDownIcon/>
            </Button>
            <CommandResponsiveDialog
            open={open}
            onOpenChange={setOpen}
            >
                <CommandInput placeholder="search" onValueChange={onSearch}/>

                <CommandList>
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            No options found
                        </span>
                    </CommandEmpty>

                    {options.map((option) => (
                        <CommandItem
                        key={option.id}
                        value={option.value}
                        onClick={() => {
                            onSelect(option.value);
                            setOpen(false);
                        }}
                        >
                            {option.children}
                        </CommandItem> 
                    ))}
                </CommandList>
            </CommandResponsiveDialog>
        </>
    )
}