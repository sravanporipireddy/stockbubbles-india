
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    if (!searchTerm) {
      setIsActive(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      setIsActive(true);
    }
  }, [searchTerm]);

  return (
    <div 
      className={`relative w-full max-w-md transition-all duration-300 ${
        isActive 
          ? 'shadow-elevation-1 bg-white rounded-lg border border-border' 
          : 'bg-secondary rounded-full'
      }`}
    >
      <div className="flex items-center px-4 py-2 h-11">
        <Search 
          size={18} 
          className={`transition-colors duration-300 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`} 
        />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search stocks by name or symbol..."
          className="w-full bg-transparent border-none outline-none px-3 py-1 text-sm placeholder:text-muted-foreground"
        />
        {searchTerm && (
          <button 
            onClick={clearSearch}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
