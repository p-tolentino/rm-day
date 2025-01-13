/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  RotateCcw,
  LoaderCircle,
  Search,
  X,
  Check,
  ChevronsUpDown,
  Copy,
  Pencil,
  Trash2 as Trash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  BLC_TITLES,
  getHighestAchievedTitle,
  WBC_TITLES,
} from "@/utils/titles";
import ImageViewer from "@/components/ui/image-viewer";
import { subTeams } from "@/utils/subteams";
import { UserLocation } from "@/app/admin/ranking/_components/ranking-table";

function formatCurrency(amount: number) {
  if (isNaN(amount)) return "Invalid amount";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

export type User = {
  id: string;
  createdAt: string;
  subTeam: string;
  sponsor: string;
  idNum: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  country: string;
  city: string;
  email: string;
  profession: string;
  totalWholesale: number;
  totalIncome: number;
  avatar: string;
  createdBy: string;
  achievements: {
    bigLeagueCircle: { title: string; achieved: boolean }[];
    wealthBuildersCircle: { title: string; achieved: boolean }[];
  };
};

const createColumns = (
  userLocations: UserLocation[] | undefined
): ColumnDef<User>[] => [
  {
    accessorKey: "rowNumber",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-center px-2 text-gray-400">
        {row.index + 1}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "subTeam",
    header: "Subteam",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "sponsor",
    header: "Sponsor",
  },
  {
    accessorKey: "idNum",
    header: "ID Number",
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "middleName",
    header: "Middle Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "dob",
    header: "Birth Date",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("dob")).toLocaleDateString("en-PH")}</div>
    ),
  },
  {
    accessorKey: "country",
    header: "Country",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "city",
    header: "State/City",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "email",
    header: "Email Address",
  },
  {
    accessorKey: "profession",
    header: "Profession",
  },
  {
    accessorKey: "totalWholesale",
    header: "Total Wholesale",
    cell: ({ row }) => <div>{row.getValue("totalWholesale")}</div>,
  },
  {
    accessorKey: "bigLeagueTitle",
    header: "BLC",
    cell: ({ row }) => {
      const achievements = row.original.achievements?.bigLeagueCircle;
      const highestTitle = getHighestAchievedTitle(
        achievements,
        BLC_TITLES.map((t) => t.title)
      );
      return <div>{highestTitle}</div>;
    },
    filterFn: (row, id, value) => {
      const achievements = row.original.achievements?.bigLeagueCircle;
      const highestTitle = getHighestAchievedTitle(
        achievements,
        BLC_TITLES.map((t) => t.title)
      );
      return value.includes(highestTitle);
    },
  },
  {
    accessorKey: "totalIncome",
    header: "Total Income",
    cell: ({ row }) => <div>{formatCurrency(row.getValue("totalIncome"))}</div>,
  },
  {
    accessorKey: "wealthBuildersTitle",
    header: "WBC",
    cell: ({ row }) => {
      const achievements = row.original.achievements?.wealthBuildersCircle;
      const highestTitle = getHighestAchievedTitle(
        achievements,
        WBC_TITLES.map((t) => t.title)
      );
      return <div>{highestTitle}</div>;
    },
    filterFn: (row, id, value) => {
      const achievements = row.original.achievements?.wealthBuildersCircle;
      const highestTitle = getHighestAchievedTitle(
        achievements,
        WBC_TITLES.map((t) => t.title)
      );
      return value.includes(highestTitle);
    },
  },
  {
    accessorKey: "picture",
    header: "Picture",
    cell: ({ row }) => (
      <ImageViewer
        title="Picture"
        imageUrl={
          row.original.avatar ||
          "https://knetic.org.uk/wp-content/uploads/2020/07/Pcture-Placeholder.png"
        }
      />
    ),
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
  },
  // TODO: ACTIONS
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              <Copy />
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil />
              Edit user
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash />
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// TODO: FIX TYPE SAFETY
interface SubteamDataTableProps {
  data: User[];
  userLocations: UserLocation[] | undefined;
}

export function SubteamDataTable({
  data,
  userLocations,
}: SubteamDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [openCountry, setOpenCountry] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const columns = useMemo(() => createColumns(userLocations), [userLocations]);

  useEffect(() => {
    if (globalFilter) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [globalFilter]);

  const availableLocations = useMemo(() => {
    const locations = new Map<string, Set<string>>();

    userLocations?.forEach((location) => {
      if (location.country) {
        if (!locations.has(location.country)) {
          locations.set(location.country, new Set());
        }
        if (location.city) {
          locations.get(location.country)?.add(location.city);
        }
      }
    });

    return {
      countries: Array.from(locations.keys()).sort(),
      citiesByCountry: Object.fromEntries(
        Array.from(locations.entries()).map(([country, cities]) => [
          country,
          Array.from(cities).sort(),
        ])
      ),
    };
  }, [userLocations]);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country === selectedCountry ? null : country);
    table
      .getColumn("country")
      ?.setFilterValue(country === selectedCountry ? undefined : country);
    setOpenCountry(false);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city === selectedCity ? null : city);
    table
      .getColumn("city")
      ?.setFilterValue(city === selectedCity ? undefined : city);
    setOpenCountry(false);
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
  });

  const resetFilters = () => {
    table.resetColumnFilters();
    setGlobalFilter("");
    setColumnFilters([]);
    setSelectedCountry(null);
    setSelectedCity(null);
  };

  return (
    <div className="w-full">
      {/* Search & Filter */}
      <div className="flex items-end justify-between py-4">
        {/* Global Filter or Search Function */}
        <div className="flex items-end space-x-2 w-full">
          <div className="relative w-1/2">
            <Input
              className="peer pe-9 ps-9"
              placeholder="Search..."
              type="text"
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              disabled={!(data.length > 0)}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              {isLoading ? (
                <LoaderCircle
                  className="animate-spin"
                  size={16}
                  strokeWidth={2}
                  role="status"
                  aria-label="Loading..."
                />
              ) : (
                <Search size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </div>
            {globalFilter && (
              <Button
                variant="link"
                onClick={() => setGlobalFilter("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Column Filters */}
        <div className="flex items-end space-x-2">
          <div>
            <label
              htmlFor="subTeam-filter"
              className="text-sm font-medium mr-2"
            >
              Sub-Team:
            </label>
            <Select
              onValueChange={(value) =>
                table
                  .getColumn("subTeam")
                  ?.setFilterValue(
                    value === table.getColumn("subTeam")?.getFilterValue()
                      ? undefined
                      : value
                  )
              }
              value={
                (table.getColumn("subTeam")?.getFilterValue() as string) || ""
              }
              disabled={!(data.length > 0)}
            >
              <SelectTrigger id="subTeam-filter" className="w-[180px]">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {subTeams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="country-filter"
              className="text-sm font-medium mr-2"
            >
              Country:
            </label>
            <Popover open={openCountry} onOpenChange={setOpenCountry}>
              <PopoverTrigger asChild disabled={!(data.length > 0)}>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCountry}
                  className="w-[200px] justify-between"
                >
                  {selectedCountry || "Select..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search country..." />

                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {availableLocations.countries.map((country) => (
                        <CommandItem
                          key={country}
                          onSelect={() => handleCountryChange(country)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCountry === country
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {country}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label htmlFor="city-filter" className="text-sm font-medium mr-2">
              City:
            </label>
            <Popover open={openCity} onOpenChange={setOpenCity}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCity}
                  className="w-[200px] justify-between"
                  disabled={!selectedCountry}
                >
                  {!selectedCountry
                    ? "Select a country first"
                    : selectedCity || "Select..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search city..." />
                  <CommandList>
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      {Object.entries(availableLocations.citiesByCountry).map(
                        ([country, cities]) => (
                          <div key={country}>
                            {country === selectedCountry &&
                              cities.map((city) => (
                                <CommandItem
                                  key={city}
                                  onSelect={() => handleCityChange(city)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedCity === city
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {city}
                                </CommandItem>
                              ))}
                          </div>
                        )
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label
              htmlFor="bigLeagueTitle-filter"
              className="text-sm font-medium mr-2"
            >
              BLC:
            </label>
            <Select
              onValueChange={(value) =>
                table
                  .getColumn("bigLeagueTitle")
                  ?.setFilterValue(
                    value ===
                      table.getColumn("bigLeagueTitle")?.getFilterValue()
                      ? undefined
                      : value
                  )
              }
              value={
                (table
                  .getColumn("bigLeagueTitle")
                  ?.getFilterValue() as string) || ""
              }
            >
              <SelectTrigger id="bigLeagueTitle-filter" className="w-[180px]">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {BLC_TITLES.map((item) => (
                  <SelectItem key={item.title} value={item.title}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="wealthBuilderTitle-filter"
              className="text-sm font-medium mr-2"
            >
              WBC:
            </label>
            <Select
              onValueChange={(value) =>
                table
                  .getColumn("wealthBuildersTitle")
                  ?.setFilterValue(
                    value ===
                      table.getColumn("wealthBuildersTitle")?.getFilterValue()
                      ? undefined
                      : value
                  )
              }
              value={
                (table
                  .getColumn("wealthBuildersTitle")
                  ?.getFilterValue() as string) || ""
              }
            >
              <SelectTrigger
                id="wealthBuildersTitle-filter"
                className="w-[180px]"
              >
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {WBC_TITLES.map((item) => (
                  <SelectItem key={item.title} value={item.title}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={resetFilters} variant="outline" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset all filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        {table.getRowModel().rows?.length ? (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="h-24 text-center flex items-center justify-center text-gray-400 text-sm italic">
            No results found.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length > 0 ? (
            `Showing ${
              table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
              1
            } to ${Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )} of ${table.getFilteredRowModel().rows.length} results`
          ) : (
            <span className="text-sm text-gray-400 italic">No results</span>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
