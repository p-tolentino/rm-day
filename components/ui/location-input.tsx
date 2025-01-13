"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
import {
  Country,
  State,
  City,
  ICountry,
  IState,
  ICity,
} from "country-state-city";
import { Label } from "@/components/ui/label";
import { Input } from "./input";

interface LocationSelectorProps {
  disabled?: boolean;
  onCountryChange: (country: string | null) => void;
  onStateChange: (state: string | null) => void;
  onCityChange: (city: string | null) => void;
}

export const formatCamelCase = (input: string): string => {
  return input
    .trim() // Remove leading/trailing whitespaces
    .split(" ") // Split into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(" "); // Join with spaces
};

export default function LocationSelector({
  disabled,
  onCountryChange,
  onStateChange,
  onCityChange,
}: LocationSelectorProps) {
  const [openCountryDropdown, setOpenCountryDropdown] = useState(false);
  const [openStateDropdown, setOpenStateDropdown] = useState(false);
  const [openCityDropdown, setOpenCityDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const countries = useMemo(() => Country.getAllCountries(), []);

  const states = useMemo(() => {
    if (!selectedCountry) return [];
    setIsLoadingStates(true);
    const statesList = State.getStatesOfCountry(selectedCountry.isoCode);
    setIsLoadingStates(false);
    return statesList;
  }, [selectedCountry]);

  const cities = useMemo(() => {
    if (!selectedCountry || !selectedState) return [];
    setIsLoadingCities(true);
    const citiesList = City.getCitiesOfState(
      selectedCountry.isoCode,
      selectedState.isoCode
    );
    setIsLoadingCities(false);
    return citiesList;
  }, [selectedCountry, selectedState]);

  const hasStates = useMemo(() => {
    if (!selectedCountry) return false;
    const states = State.getStatesOfCountry(selectedCountry.isoCode);
    return states.length > 0;
  }, [selectedCountry]);

  const filteredCountries = useMemo(() => {
    return countries.filter((country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countries, countrySearch]);

  const filteredStates = useMemo(() => {
    if (!selectedCountry || !hasStates) return [];
    return states.filter((state) =>
      state.name.toLowerCase().includes(stateSearch.toLowerCase())
    );
  }, [states, stateSearch, selectedCountry, hasStates]);

  const filteredCities = useMemo(() => {
    if (!selectedCountry) return [];
    if (!hasStates) {
      // If the country has no states, filter cities directly
      const cities = City.getCitiesOfCountry(selectedCountry.isoCode) || [];
      return cities.filter((city) =>
        city.name.toLowerCase().includes(citySearch.toLowerCase())
      );
    }
    if (!selectedState) return [];
    // If the country has states, filter cities for the selected state
    return cities.filter((city) =>
      city.name.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [cities, citySearch, selectedCountry, selectedState, hasStates]);

  const handleCountrySelect = useCallback(
    (country: ICountry | null) => {
      setSelectedCountry(country);
      setSelectedState(null);
      setSelectedCity(null);
      onCountryChange(country?.name || "");
      onStateChange(null);
      onCityChange(null);
      setOpenCountryDropdown(false);
    },
    [onCountryChange, onStateChange, onCityChange]
  );

  const handleStateSelect = useCallback(
    (state: IState | null) => {
      setSelectedState(state);
      setSelectedCity(null);
      onStateChange(state?.name || "");
      setOpenStateDropdown(false);
    },
    [onStateChange]
  );

  const handleCitySelect = useCallback(
    (city: ICity | null) => {
      setSelectedCity(city);
      onCityChange(city?.name || "");
      setOpenCityDropdown(false);
    },
    [onCityChange]
  );

  const handleManualStateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formattedState = formatCamelCase(e.target.value);
      onStateChange(formattedState);
    },
    [onStateChange]
  );

  const handleManualCityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formattedCity = formatCamelCase(e.target.value);
      onCityChange(formattedCity);
    },
    [onCityChange]
  );

  return (
    <div className="flex gap-4">
      {/* Country Selector */}
      <div className="flex flex-col gap-y-2 w-full">
        <Label htmlFor="country-select">Country</Label>
        <Popover
          open={openCountryDropdown}
          onOpenChange={setOpenCountryDropdown}
        >
          <PopoverTrigger asChild>
            <Button
              id="country-select"
              variant="outline"
              role="combobox"
              aria-expanded={openCountryDropdown}
              disabled={disabled}
              className="w-full justify-between"
            >
              {selectedCountry?.name || "Select Country..."}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[300px]">
            <Command>
              <CommandInput
                placeholder="Search country..."
                value={countrySearch}
                onValueChange={setCountrySearch}
              />
              <CommandList className="max-h-[300px] overflow-y-auto">
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {filteredCountries.map((country) => (
                    <CommandItem
                      key={country.isoCode}
                      value={country.name}
                      onSelect={() => handleCountrySelect(country)}
                      className="flex justify-between"
                    >
                      {country.name}
                      {selectedCountry?.isoCode === country.isoCode && (
                        <Check className="h-4 w-4 opacity-100" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* State Selector */}
      {selectedCountry && hasStates && (
        <>
          {/* State Selector */}
          {filteredStates.length > 0 ? (
            <div className="flex flex-col gap-y-2 w-full">
              <Label htmlFor="state-select">State/Province</Label>
              <Popover
                open={openStateDropdown}
                onOpenChange={setOpenStateDropdown}
              >
                <PopoverTrigger asChild>
                  <Button
                    id="state-select"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStateDropdown}
                    className="w-full justify-between"
                  >
                    {selectedState?.name || "Select State or Province..."}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px]">
                  <Command>
                    <CommandInput
                      placeholder="Search state or province..."
                      value={stateSearch}
                      onValueChange={setStateSearch}
                    />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>
                        {isLoadingStates ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          "No state found."
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {!isLoadingStates &&
                          filteredStates.map((state) => (
                            <CommandItem
                              key={state.isoCode}
                              value={state.name}
                              onSelect={() => handleStateSelect(state)}
                              className="flex justify-between"
                            >
                              {state.name}
                              {selectedState?.isoCode === state.isoCode && (
                                <Check className="h-4 w-4 opacity-100" />
                              )}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="flex flex-col gap-y-2 w-full">
              <Label htmlFor="state-select">State/Province</Label>
              <Input
                id="state-select"
                placeholder="Enter State"
                onChange={handleManualStateChange}
              />
            </div>
          )}

          {/* City Selector */}
          {selectedState && filteredCities.length > 0 ? (
            <div className="flex flex-col gap-y-2 w-full">
              <Label htmlFor="city-select">City</Label>
              <Popover
                open={openCityDropdown}
                onOpenChange={setOpenCityDropdown}
              >
                <PopoverTrigger asChild>
                  <Button
                    id="city-select"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCityDropdown}
                    className="w-full justify-between"
                  >
                    {selectedCity?.name || "Select City..."}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px]">
                  <Command>
                    <CommandInput
                      placeholder="Search city..."
                      value={citySearch}
                      onValueChange={setCitySearch}
                    />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>
                        {isLoadingCities ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          "No city found."
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {!isLoadingCities &&
                          filteredCities.map((city) => (
                            <CommandItem
                              key={`${city.name}-${city.stateCode}`}
                              value={city.name}
                              onSelect={() => handleCitySelect(city)}
                              className="flex justify-between"
                            >
                              {city.name}
                              {selectedCity?.name === city.name && (
                                <Check className="h-4 w-4 opacity-100" />
                              )}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            selectedState && (
              <div className="flex flex-col gap-y-2 w-full">
                <Label htmlFor="city-select">City</Label>
                <Input
                  id="city-select"
                  placeholder="Enter City"
                  onChange={handleManualCityChange}
                />
              </div>
            )
          )}
        </>
      )}

      {selectedCountry && !hasStates && (
        <>
          {/* City Selector for Countries Without States */}
          {filteredCities.length > 0 ? (
            <div className="flex flex-col gap-y-2 w-full">
              <Label htmlFor="city-select">City</Label>
              <Popover
                open={openCityDropdown}
                onOpenChange={setOpenCityDropdown}
              >
                <PopoverTrigger asChild>
                  <Button
                    id="city-select"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCityDropdown}
                    className="w-full justify-between"
                  >
                    {selectedCity?.name || "Select City..."}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px]">
                  <Command>
                    <CommandInput
                      placeholder="Search city..."
                      value={citySearch}
                      onValueChange={setCitySearch}
                    />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>
                        {isLoadingCities ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          "No city found."
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {!isLoadingCities &&
                          filteredCities.map((city) => (
                            <CommandItem
                              key={`${city.name}-${city.stateCode}`}
                              value={city.name}
                              onSelect={() => handleCitySelect(city)}
                              className="flex justify-between"
                            >
                              {city.name}
                              {selectedCity?.name === city.name && (
                                <Check className="h-4 w-4 opacity-100" />
                              )}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="flex flex-col gap-y-2 w-full">
              <Label htmlFor="city-select">City</Label>
              <Input
                id="city-select"
                placeholder="Enter City"
                onChange={handleManualCityChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
