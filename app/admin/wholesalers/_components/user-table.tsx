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
  RotateCcw,
  LoaderCircle,
  Search,
  X,
  Check,
  ChevronsUpDown,
  Filter,
  Columns,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  BLC_TITLES,
  getHighestAchievedTitle,
  WBC_TITLES,
} from "@/utils/titles";
import ImageViewer from "@/components/ui/image-viewer";
import { subTeams } from "@/utils/subteams";
import { UserLocation } from "../../ranking/_components/ranking-table";
import { RoleToggle } from "./role-toggle";
import { CellAction } from "./cell-action";

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
  role: string;
  subTeam: string;
  sponsor: string;
  idNum: string;
  firstName: string;
  middleName: string;
  lastName: string;
  // dob: string;
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
  userLocations: UserLocation[] | undefined,
  role: string,
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
    accessorKey: "idNum",
    header: "ID Number",
  },
  {
    accessorKey: "avatar",
    header: "Picture",
    cell: ({ row }) => (
      <ImageViewer
        title={`Picture (${row.original.firstName} ${
          row.original.middleName && row.original.middleName.trim()
            ? `${row.original.middleName[0]}. `
            : ""
        } ${row.original.lastName})`}
        imageUrl={
          row.original.avatar ||
          "https://knetic.org.uk/wp-content/uploads/2020/07/Pcture-Placeholder.png"
        }
      />
    ),
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
    accessorKey: "subTeam",
    header: "Subteam",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  // {
  //   accessorKey: "dob",
  //   header: "Birth Date",
  //   cell: ({ row }) => (
  //     <div>{new Date(row.getValue("dob")).toLocaleDateString("en-PH")}</div>
  //   ),
  // },
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
        BLC_TITLES.map((t) => t.title),
      );
      return <div>{highestTitle}</div>;
    },
    filterFn: (row, id, value) => {
      const achievements = row.original.achievements?.bigLeagueCircle;
      const highestTitle = getHighestAchievedTitle(
        achievements,
        BLC_TITLES.map((t) => t.title),
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
        WBC_TITLES.map((t) => t.title),
      );
      return <div>{highestTitle}</div>;
    },
    filterFn: (row, id, value) => {
      const achievements = row.original.achievements?.wealthBuildersCircle;
      const highestTitle = getHighestAchievedTitle(
        achievements,
        WBC_TITLES.map((t) => t.title),
      );
      return value.includes(highestTitle);
    },
  },
  {
    accessorKey: "sponsor",
    header: "Sponsor",
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original;
      return <RoleToggle userId={user.idNum} initialRole={user.role} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return <CellAction user={user} role={role} />;
    },
  },
];

const filterDisplayNames: Record<string, string> = {
  subTeam: "Sub-Team",
  country: "Country",
  city: "City",
  bigLeagueTitle: "BLC",
  wealthBuildersTitle: "WBC",
  search: "Search",
};

interface WholesalerDataTableProps {
  data: User[];
  userLocations: UserLocation[] | undefined;
  role: string;
}

export function WholesalerDataTable({
  data,
  userLocations,
  role,
}: WholesalerDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState(false);

  const [openCountry, setOpenCountry] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const columns = useMemo(
    () => createColumns(userLocations, role),
    [userLocations, role],
  );

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
        ]),
      ),
    };
  }, [userLocations]);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country === selectedCountry ? null : country);
    table
      .getColumn("country")
      ?.setFilterValue(country === selectedCountry ? undefined : country);
    setOpenCountry(false);
    // Clear city when country changes
    if (country !== selectedCountry) {
      setSelectedCity(null);
      table.getColumn("city")?.setFilterValue(undefined);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city === selectedCity ? null : city);
    table
      .getColumn("city")
      ?.setFilterValue(city === selectedCity ? undefined : city);
    setOpenCity(false);
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

  // Get active filters for badges
  const activeFilters = useMemo(() => {
    const filters: { id: string; name: string; value: string }[] = [];
    columnFilters.forEach((filter) => {
      if (filter.value && Array.isArray(filter.value)) {
        filters.push({
          id: filter.id,
          name: filterDisplayNames[filter.id] || filter.id,
          value: filter.value.join(", "),
        });
      } else if (filter.value) {
        filters.push({
          id: filter.id,
          name: filterDisplayNames[filter.id] || filter.id,
          value: String(filter.value),
        });
      }
    });
    if (globalFilter) {
      filters.push({
        id: "search",
        name: filterDisplayNames.search || "Search",
        value: globalFilter,
      });
    }
    return filters;
  }, [columnFilters, globalFilter]);

  return (
    <div className="w-full space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="relative w-full sm:w-96">
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="ml-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilters.length}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={resetFilters} variant="outline" size="sm">
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

      {/* Filter Badges */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter.id} variant="secondary" className="gap-1">
              <span className="font-semibold">{filter.name}:</span>{" "}
              {filter.value}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  if (filter.id === "search") {
                    setGlobalFilter("");
                  } else {
                    table.getColumn(filter.id)?.setFilterValue(undefined);
                    if (filter.id === "country") setSelectedCountry(null);
                    if (filter.id === "city") setSelectedCity(null);
                  }
                }}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Expandable Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 border rounded-md bg-muted/50">
          {/* Sub-team filter */}
          <div>
            <label htmlFor="subTeam-filter" className="text-sm font-medium">
              Sub-Team
            </label>
            <Select
              onValueChange={(value) =>
                table
                  .getColumn("subTeam")
                  ?.setFilterValue(
                    value === table.getColumn("subTeam")?.getFilterValue()
                      ? undefined
                      : value,
                  )
              }
              value={
                (table.getColumn("subTeam")?.getFilterValue() as string) || ""
              }
              disabled={!(data.length > 0)}
            >
              <SelectTrigger id="subTeam-filter" className="w-full">
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

          {/* Country combobox */}
          <div>
            <label htmlFor="country-filter" className="text-sm font-medium">
              Country
            </label>
            <Popover open={openCountry} onOpenChange={setOpenCountry}>
              <PopoverTrigger asChild disabled={!(data.length > 0)}>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCountry}
                  className="w-full justify-between"
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
                                : "opacity-0",
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

          {/* City combobox */}
          <div>
            <label htmlFor="city-filter" className="text-sm font-medium">
              City
            </label>
            <Popover open={openCity} onOpenChange={setOpenCity}>
              <PopoverTrigger asChild disabled={!selectedCountry}>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCity}
                  className="w-full justify-between"
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
                      {selectedCountry &&
                        availableLocations.citiesByCountry[
                          selectedCountry
                        ]?.map((city) => (
                          <CommandItem
                            key={city}
                            onSelect={() => handleCityChange(city)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCity === city
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {city}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* BLC filter */}
          <div>
            <label
              htmlFor="bigLeagueTitle-filter"
              className="text-sm font-medium"
            >
              BLC
            </label>
            <Select
              onValueChange={(value) =>
                table
                  .getColumn("bigLeagueTitle")
                  ?.setFilterValue(
                    value ===
                      table.getColumn("bigLeagueTitle")?.getFilterValue()
                      ? undefined
                      : value,
                  )
              }
              value={
                (table
                  .getColumn("bigLeagueTitle")
                  ?.getFilterValue() as string) || ""
              }
            >
              <SelectTrigger id="bigLeagueTitle-filter" className="w-full">
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

          {/* WBC filter */}
          <div>
            <label
              htmlFor="wealthBuilderTitle-filter"
              className="text-sm font-medium"
            >
              WBC
            </label>
            <Select
              onValueChange={(value) =>
                table
                  .getColumn("wealthBuildersTitle")
                  ?.setFilterValue(
                    value ===
                      table.getColumn("wealthBuildersTitle")?.getFilterValue()
                      ? undefined
                      : value,
                  )
              }
              value={
                (table
                  .getColumn("wealthBuildersTitle")
                  ?.getFilterValue() as string) || ""
              }
            >
              <SelectTrigger id="wealthBuilderTitle-filter" className="w-full">
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
        </div>
      )}

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
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              header.column.getCanSort() &&
                                "cursor-pointer select-none hover:underline",
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{
                              asc: <ArrowUp className="ml-1 h-4 w-4" />,
                              desc: <ArrowDown className="ml-1 h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
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
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <Inbox className="h-12 w-12 mb-4" />
            <p className="text-sm">No results found.</p>
            {(globalFilter || columnFilters.length > 0) && (
              <Button variant="link" onClick={resetFilters} className="mt-2">
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div>
            {table.getFilteredRowModel().rows.length > 0 ? (
              <>
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length,
                )}{" "}
                of {table.getFilteredRowModel().rows.length} results
              </>
            ) : (
              <span className="text-sm text-muted-foreground italic">
                No results
              </span>
            )}
          </div>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent>
                {[10, 50, 100, 500, 1000].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
