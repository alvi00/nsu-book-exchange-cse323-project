import { useState } from 'react';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const DEPARTMENTS = [
  'All', 'CSE', 'EEE', 'ECE', 'BBA', 'Economics', 'English', 'Architecture', 
  'Pharmacy', 'Public Health', 'Environmental Science', 'Law', 'Other'
];

const CONDITIONS = ['New-ish', 'Used', 'Rough'];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'bumped', label: 'Recently Bumped' },
];

export interface FilterState {
  search: string;
  department: string;
  courseCode: string;
  conditions: string[];
  minPrice: string;
  maxPrice: string;
  sort: string;
  tag: string;
}

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}

export function SearchFilters({ filters, onChange, resultCount }: SearchFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleCondition = (condition: string) => {
    const current = filters.conditions;
    const updated = current.includes(condition)
      ? current.filter(c => c !== condition)
      : [...current, condition];
    updateFilter('conditions', updated);
  };

  const clearFilters = () => {
    onChange({
      search: '',
      department: 'All',
      courseCode: '',
      conditions: [],
      minPrice: '',
      maxPrice: '',
      sort: 'recent',
      tag: 'All',
    });
  };

  const hasActiveFilters = 
    filters.department !== 'All' ||
    filters.courseCode ||
    filters.conditions.length > 0 ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.tag !== 'All';

  const FilterControls = () => (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium">Type</Label>
        <div className="mt-2 flex gap-2">
          {['All', 'Book', 'Classnotes'].map(t => (
            <Button
              key={t}
              variant={filters.tag === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('tag', t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Department</Label>
        <Select value={filters.department} onValueChange={(v) => updateFilter('department', v)}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="courseFilter" className="text-sm font-medium">Course Code</Label>
        <Input
          id="courseFilter"
          placeholder="e.g., PHY101"
          value={filters.courseCode}
          onChange={(e) => updateFilter('courseCode', e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Condition</Label>
        <div className="mt-2 space-y-2">
          {CONDITIONS.map(c => (
            <div key={c} className="flex items-center space-x-2">
              <Checkbox
                id={`condition-${c}`}
                checked={filters.conditions.includes(c)}
                onCheckedChange={() => toggleCondition(c)}
              />
              <Label htmlFor={`condition-${c}`} className="font-normal">{c}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Price Range (৳)</Label>
        <div className="mt-2 flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Sort By</Label>
        <Select value={filters.sort} onValueChange={(v) => updateFilter('sort', v)}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full">
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, course code, or seller..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Mobile Filter Button */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle className="mt-20">Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterControls />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden rounded-lg border bg-card p-4 lg:block">
        <div className="grid gap-4 md:grid-cols-6">
          <div>
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={filters.tag} onValueChange={(v) => updateFilter('tag', v)}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['All', 'Book', 'Classnotes'].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Department</Label>
            <Select value={filters.department} onValueChange={(v) => updateFilter('department', v)}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Course Code</Label>
            <Input
              placeholder="PHY101"
              value={filters.courseCode}
              onChange={(e) => updateFilter('courseCode', e.target.value)}
              className="mt-1 h-9"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Price Range</Label>
            <div className="mt-1 flex gap-1">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="h-9"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Sort</Label>
            <Select value={filters.sort} onValueChange={(v) => updateFilter('sort', v)}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{resultCount} listing{resultCount !== 1 ? 's' : ''} found</span>
        {hasActiveFilters && (
          <Button variant="link" size="sm" onClick={clearFilters} className="h-auto p-0 lg:hidden">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
