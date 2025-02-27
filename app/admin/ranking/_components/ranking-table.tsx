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
import { format, isWithinInterval, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  BLC_TITLES,
  calculateBLC,
  calculateWBC,
  WBC_TITLES,
} from "@/utils/titles";
import ImageViewer from "@/components/ui/image-viewer";
import { Calendar } from "@/components/ui/calendar";
import { subTeams } from "@/utils/subteams";
import { CellAction } from "./cell-action";
import { Separator } from "@/components/ui/separator";

export type UserLocation = {
  idNum: string;
  country: string;
  city: string | null;
  subTeam: string;
  profession: string;
};

export type Report = {
  id: string;
  createdAt: string;
  updatedAt: string;
  rank: number;
  subTeam: string;
  avatar: string;
  fullName: string;
  wholesalerId: string;
  profession: string;
  country: string;
  city: string;

  wholesale: number;
  income: number;
  cmir: number;
  ssCMIR: string;
  msr: number;
  ssMSR: string;
  food: number;

  createdBy: string;
};

// TODO: FIX TYPE SAFETY
interface ReportDataTableProps {
  data: Report[];
  userLocations: UserLocation[] | undefined;
  acceptReports: boolean;
}

function formatCurrency(amount: number) {
  if (isNaN(amount)) return "Invalid amount";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

const createColumns = (
  userLocations: UserLocation[] | undefined,
  acceptReports: boolean
): ColumnDef<Report>[] => [
  {
    accessorKey: "avatar",
    header: "Picture",
    cell: ({ row }) => (
      <ImageViewer
        title={`Picture (${row.original.fullName})`}
        imageUrl={
          row.original.avatar ||
          "https://knetic.org.uk/wp-content/uploads/2020/07/Pcture-Placeholder.png"
        }
      />
    ),
  },
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown />
        </Button>
      );
    },
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
          CMIR
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{formatCurrency(row.getValue("cmir"))}</div>,
  },
  {
    accessorKey: "ssCMIR",
    header: "CMIR Proof",
    cell: ({ row }) => (
      <ImageViewer
        title="CMIR Validation"
        imageUrl={
          row.original.ssCMIR ||
          "https://knetic.org.uk/wp-content/uploads/2020/07/Pcture-Placeholder.png"
        }
      />
    ),
  },

  {
    accessorKey: "msr",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          MSR
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
    accessorKey: "ssMSR",
    header: "MSR Proof",
    cell: ({ row }) => (
      <ImageViewer
        title="MSR Validation"
        imageUrl={
          row.original.ssMSR ||
          "https://knetic.org.uk/wp-content/uploads/2020/07/Pcture-Placeholder.png"
        }
      />
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
          CMFI
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
  {
    accessorKey: "createdBy",
    header: "Last Updated By",
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Updated At
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="px-2">
        {new Date(row.getValue("updatedAt")).toLocaleString()}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const report = row.original;

      return <CellAction report={report} acceptReports={acceptReports} />;
    },
  },
];

export function ReportDataTable({
  data,
  userLocations,
  acceptReports,
}: ReportDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [openCountry, setOpenCountry] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [reportTypeFilter, setReportTypeFilter] = useState<
    "all" | "international" | "local"
  >("all");

  const columns = useMemo(
    () => createColumns(userLocations, acceptReports), // Pass the static rank array
    [userLocations, acceptReports]
  );

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply date filter
    if (date?.from) {
      const startDate = startOfDay(date.from); // Normalize start date
      const endDate = startOfDay(date.to || date.from); // Normalize end date

      filtered = filtered.filter((report) => {
        const reportDate = startOfDay(new Date(report.createdAt)); // Normalize report date
        return isWithinInterval(reportDate, { start: startDate, end: endDate });
      });
    }

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
  }, [data, date, reportTypeFilter, columnFilters]);

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
    table.resetColumnFilters(); // Reset column filters
    setGlobalFilter(""); // Reset global search filter
    setColumnFilters([]); // Reset column filters state
    setSelectedCountry(null); // Reset country filter
    setDate({ from: undefined, to: undefined }); // Reset date range
    setReportTypeFilter("all"); // Reset report type filter
  };

  return (
    <div className="w-full ">
      {/* Search & Filter */}
      <div className="flex flex-col space-y-4 py-4">
        {/* Top Row: Date Range and Search Bar */}
        <div className="flex justify-between space-x-4">
          {/* Global Search */}
          <div className="flex flex-col w-1/3">
            <label htmlFor="global-search" className="text-sm font-medium mr-2">
              Search:
            </label>
            <div className="relative">
              <Input
                className="peer pe-9 ps-9"
                placeholder="Search..."
                type="text"
                value={globalFilter ?? ""}
                onChange={(event) =>
                  setGlobalFilter(String(event.target.value))
                }
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

          {/* Date Range Filter */}
          <div className="flex flex-col w-1/4">
            <label htmlFor="date-range" className="text-sm font-medium mr-2">
              Date Range:
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={!(data.length > 0)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Second Row: Report Type, Sub-Team, Country, BLC, WBC Filters */}
        <div className="flex items-end space-x-4">
          {/* Report Type Filter */}
          <div className="flex flex-col flex-1">
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

          {/* Sub-Team Filter */}
          <div className="flex flex-col flex-1">
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
              <SelectTrigger id="subTeam-filter">
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

          {/* Country Filter */}
          <div className="flex flex-col flex-1">
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
                    <CommandEmpty>No countries found.</CommandEmpty>
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

          {/* BLC Filter */}
          <div className="flex flex-col flex-1">
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
              disabled={!(data.length > 0)}
            >
              <SelectTrigger id="bigLeagueTitle-filter">
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

          {/* WBC Filter */}
          <div className="flex flex-col flex-1">
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
              disabled={!(data.length > 0)}
            >
              <SelectTrigger id="wealthBuilderTitle-filter">
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

          {/* Reset Filters Button */}
          <div className="flex flex-col">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  size="icon"
                  className="p-4"
                  disabled={!(data.length > 0)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset all filters</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
