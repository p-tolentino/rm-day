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
  Copy,
  Pencil,
  Trash2 as Trash,
  ArrowUpDown,
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
import { CellAction } from "@/app/admin/ranking/_components/cell-action";

export interface UserLocation {
  idNum: string;
  country: string;
  city: string;
}

export type Report = {
  id: string;
  createdAt: string;
  subTeam: string;
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
interface MySubmissionsDataTableProps {
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
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated At
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="px-2">
        {new Date(row.getValue("createdAt")).toLocaleString()}
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

export function MySubmissionsDataTable({
  data,
  userLocations,
  acceptReports,
}: MySubmissionsDataTableProps) {
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

  const columns = useMemo(
    () => createColumns(userLocations, acceptReports), // Pass the static rank array
    [userLocations]
  );

  const filteredData = useMemo(() => {
    if (!date?.from) return data; // If no start date is selected, return all data

    const startDate = startOfDay(date.from); // Normalize start date
    const endDate = startOfDay(date.to || date.from); // Normalize end date

    return data.filter((report) => {
      const reportDate = startOfDay(new Date(report.createdAt)); // Normalize report date

      const isWithinRange = isWithinInterval(reportDate, {
        start: startDate,
        end: endDate,
      });

      return isWithinRange;
    });
  }, [data, date]);

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

  const table = useReactTable({
    data: filteredData,
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
    setDate({ from: undefined, to: undefined }); // Reset date range
  };

  return (
    <div className="w-full ">
      {/* Search & Filter */}
      <div className="flex items-end justify-between py-4 gap-4">
        {/* Global Filter or Search Function */}
        <div className="flex items-end space-x-2 w-1/3">
          <div className="relative w-full">
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
          <div className="flex flex-col">
            <label htmlFor="date-range" className="text-sm font-medium mr-2">
              Date Range:
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
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
              disabled={!(data.length > 0)}
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
              disabled={!(data.length > 0)}
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

      {/* Data Table */}
      <div className="rounded-md border">
        {table.getRowModel().rows?.length ? (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
