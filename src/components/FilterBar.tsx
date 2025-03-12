
import React, { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { stockSectors } from '@/lib/mockData';

interface FilterBarProps {
  onSectorChange: (sector: string) => void;
  selectedSector: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  onSectorChange, 
  selectedSector 
}) => {
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);

  const toggleSectorDropdown = () => {
    setIsSectorDropdownOpen(!isSectorDropdownOpen);
  };

  const selectSector = (sector: string) => {
    onSectorChange(sector);
    setIsSectorDropdownOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 pt-2 pb-5">
      <div className="relative">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-sm font-medium hover:bg-secondary/50 transition-colors shadow-subtle"
          onClick={toggleSectorDropdown}
        >
          <Filter size={16} className="text-primary" />
          <span>{selectedSector || 'All Sectors'}</span>
          <ChevronDown size={16} className={`transition-transform duration-200 ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isSectorDropdownOpen && (
          <div className="absolute z-50 mt-2 w-56 max-h-96 overflow-y-auto bg-white rounded-lg shadow-elevation-2 border border-border animate-fade-in">
            <div className="p-1">
              {stockSectors.map((sector) => (
                <button
                  key={sector}
                  className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                    selectedSector === sector
                      ? 'bg-primary text-white font-medium'
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => selectSector(sector)}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hidden py-1 max-w-full">
        {stockSectors.slice(0, 8).map((sector) => (
          <button
            key={sector}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-sm transition-colors ${
              selectedSector === sector
                ? 'bg-primary text-primary-foreground font-medium shadow-subtle'
                : 'bg-secondary hover:bg-secondary/70'
            }`}
            onClick={() => selectSector(sector)}
          >
            {sector}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
