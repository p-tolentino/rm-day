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
  ArrowUpDown,
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
  BLC_TITLES,
  calculateBLC,
  calculateWBC,
  WBC_TITLES,
} from "@/utils/titles";
import { subTeams } from "@/utils/subteams";
import { UserLocation } from "../../ranking/_components/ranking-table";
import ImageViewer from "@/components/ui/image-viewer";
import { Separator } from "@/components/ui/separator";

function formatCurrency(amount: number) {
  if (isNaN(amount)) return "Invalid amount";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

export type Report = {
  id: string;
  createdAt: string;
  rank: number;
  subTeam: string;
  avatar: string;
  fullName: string;
  wholesalerId: string;
  profession: string;
  country: string;

  wholesale: number;
  income: number;
  cmir: number;
  msr: number;
  food: number;
};

interface OverallRankingDataTableProps {
  data: Report[];
  userLocations: UserLocation[] | undefined;
}

const createColumns = (
  userLocations: UserLocation[] | undefined
): ColumnDef<Report>[] => [
  {
    accessorKey: "avatar",
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
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "subTeam",
    header: "Subteam",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "profession",
    header: "Profession",
  },
  {
    accessorKey: "country",
    header: "Country",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "cmir",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Consolidated Year Income Report
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{formatCurrency(row.getValue("cmir"))}</div>,
  },

  {
    accessorKey: "msr",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          MMPP Summary Report
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        {Number(row.getValue("msr")).toLocaleString(
          "en-US"
          // {
          //   minimumFractionDigits: 2,
          //   maximumFractionDigits: 2,
          // }
        )}
      </div>
    ),
  },
  {
    accessorKey: "food",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Consolidated Year Food Income Report
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        {Number(row.getValue("food")).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    ),
  },
  {
    accessorKey: "income",
    header: "Total Income",
    cell: ({ row }) => <div>{formatCurrency(row.getValue("income"))}</div>,
  },
  {
    accessorKey: "wealthBuildersTitle",
    header: "WBC",
    cell: ({ row }) => {
      const income = parseFloat(row.getValue("income"));
      return <div>{calculateWBC(income)}</div>;
    },
    filterFn: (row, id, value) => {
      const income = parseFloat(row.getValue("income"));
      const title = calculateWBC(income);
      return value.includes(title);
    },
  },
  {
    accessorKey: "wholesale",
    header: "Total Wholesale",
  },
  {
    accessorKey: "bigLeagueTitle",
    header: "BLC",
    cell: ({ row }) => {
      const wholesale = parseFloat(row.getValue("wholesale"));
      return <div>{calculateBLC(wholesale)}</div>;
    },
    filterFn: (row, id, value) => {
      const wholesale = parseFloat(row.getValue("wholesale"));
      const title = calculateBLC(wholesale);
      return value.includes(title);
    },
  },
];

export function OverallRankingDataTable({
  data,
  userLocations,
}: OverallRankingDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [openCountry, setOpenCountry] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [reportTypeFilter, setReportTypeFilter] = useState<
    "all" | "international" | "local"
  >("all");

  const columns = useMemo(() => createColumns(userLocations), [userLocations]);

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply report type filter
    if (reportTypeFilter === "international") {
      filtered = filtered.filter((report) => report.country !== "Philippines");
    } else if (reportTypeFilter === "local") {
      filtered = filtered.filter((report) => report.country === "Philippines");
    }

    columnFilters.forEach((filter) => {
      const columnId = filter.id;
      const filterValue = filter.value;

      if (columnId === "subTeam" && filterValue) {
        filtered = filtered.filter((report) => report.subTeam === filterValue);
      }

      if (columnId === "country" && filterValue) {
        filtered = filtered.filter((report) => report.country === filterValue);
      }

      if (columnId === "bigLeagueTitle" && filterValue) {
        filtered = filtered.filter((report) => {
          const wholesale = parseFloat(report.wholesale.toString());
          const title = calculateBLC(wholesale);
          return title === filterValue;
        });
      }

      if (columnId === "wealthBuildersTitle" && filterValue) {
        filtered = filtered.filter((report) => {
          const income = parseFloat(report.income.toString());
          const title = calculateWBC(income);
          return title === filterValue;
        });
      }
    });

    return filtered;
  }, [data, reportTypeFilter, columnFilters]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];

    if (sorting.length > 0) {
      const { id, desc } = sorting[0];

      sorted.sort((a, b) => {
        const aValue = a[id as keyof Report];
        const bValue = b[id as keyof Report];

        if (aValue < bValue) return desc ? 1 : -1;
        if (aValue > bValue) return desc ? -1 : 1;
        return 0;
      });
    }

    return sorted;
  }, [filteredData, sorting]);

  const rankedData = useMemo(() => {
    const ranked = [];
    let currentRank = 1;

    if (sorting.length === 0) {
      // Default ranking: sequential from 1 to n
      for (let i = 0; i < sortedData.length; i++) {
        ranked.push({ ...sortedData[i], rank: i + 1 });
      }
    } else {
      // Sorted ranking: same rank for identical values
      for (let i = 0; i < sortedData.length; i++) {
        if (
          i > 0 &&
          sortedData[i][sorting[0]?.id as keyof Report] !==
            sortedData[i - 1][sorting[0]?.id as keyof Report]
        ) {
          currentRank = i + 1;
        }
        ranked.push({ ...sortedData[i], rank: currentRank });
      }
    }

    return ranked;
  }, [sortedData, sorting]);

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

  const table = useReactTable({
    data: rankedData,
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
    setReportTypeFilter("all");
  };

  return (
    <div className="w-full">
      {/* Search & Filter */}
      <div className="flex items-end justify-between py-4 gap-4">
        {/* Global Filter or Search Function */}
        <div className="flex items-end space-x-2 w-1/4">
          <div className="relative w-full">
            <Input
              className="peer pe-9 ps-9"
              placeholder="Search..."
              type="text"
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
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
        <div className="flex items-end justify-end space-x-2 w-full">
          <div className="flex flex-col w-1/6">
            <label
              htmlFor="report-type-filter"
              className="text-sm font-medium mr-2"
            >
              Report Type:
            </label>
            <Select
              onValueChange={(value) =>
                setReportTypeFilter(value as "all" | "international" | "local")
              }
              value={reportTypeFilter}
              disabled={!(data.length > 0)}
            >
              <SelectTrigger id="report-type-filter">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="international">International</SelectItem>
                <SelectItem value="local">Local (Philippines)</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          <div className="flex flex-col">
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
                  <TableHead>Rank</TableHead>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn("whitespace-nowrap")}
                      >
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
              {table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  <TableCell>
                    <div
                      className={cn(
                        "flex justify-center items-center h-10 rounded-lg",
                        row.original.rank === 1 &&
                          "bg-gradient-to-b from-yellow-400 to-yellow-600 text-white font-bold shadow-lg", // Gold
                        row.original.rank === 2 &&
                          "bg-gradient-to-b from-gray-400 to-gray-600 text-white font-bold shadow-md", // Silver
                        row.original.rank === 3 &&
                          "bg-gradient-to-b from-amber-600 to-amber-800 text-white font-bold shadow-sm" // Bronze
                      )}
                    >
                      {row.original.rank}
                    </div>
                  </TableCell>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("whitespace-nowrap")}
                    >
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
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex text-sm text-muted-foreground items-center gap-2">
          <div>
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
          <div className="h-5">
            <Separator orientation="vertical" />
          </div>
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
