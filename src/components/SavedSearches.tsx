import { useState, useEffect } from 'react';
import { Bell, BellOff, Trash2, Search, Plus } from 'lucide-react';
import { FilterState } from '@/components/SearchFilters';
import { Listing, STORAGE_KEYS } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const SAVED_SEARCHES_KEY = 'nsu_saved_searches';
const LAST_CHECK_KEY = 'nsu_last_search_check';

export interface SavedSearch {
  id: string;
  name: string;
  filters: Partial<FilterState>;
  createdAt: string;
  notificationsEnabled: boolean;
}

interface SavedSearchesProps {
  currentFilters: FilterState;
  listings: Listing[];
  onApplySearch: (filters: FilterState) => void;
}

export function getSavedSearches(): SavedSearch[] {
  return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || '[]');
}

export function saveSavedSearches(searches: SavedSearch[]): void {
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
}

export function getMatchingListings(search: SavedSearch, listings: Listing[]): Listing[] {
  return listings.filter(listing => {
    const f = search.filters;
    
    if (f.search && !listing.title.toLowerCase().includes(f.search.toLowerCase()) &&
        !listing.course_code.toLowerCase().includes(f.search.toLowerCase())) {
      return false;
    }
    if (f.department && f.department !== 'All' && listing.department !== f.department) {
      return false;
    }
    if (f.courseCode && !listing.course_code.toLowerCase().includes(f.courseCode.toLowerCase())) {
      return false;
    }
    if (f.conditions && f.conditions.length > 0 && !f.conditions.includes(listing.condition)) {
      return false;
    }
    if (f.minPrice && listing.price < Number(f.minPrice)) {
      return false;
    }
    if (f.maxPrice && listing.price > Number(f.maxPrice)) {
      return false;
    }
    if (f.tag && f.tag !== 'All' && listing.tag !== f.tag) {
      return false;
    }
    
    return listing.status === 'Available';
  });
}

export function checkNewMatches(listings: Listing[]): { search: SavedSearch; newListings: Listing[] }[] {
  const searches = getSavedSearches().filter(s => s.notificationsEnabled);
  const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
  const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date(0);
  
  const results: { search: SavedSearch; newListings: Listing[] }[] = [];
  
  for (const search of searches) {
    const matches = getMatchingListings(search, listings);
    const newMatches = matches.filter(l => new Date(l.created_at) > lastCheckDate);
    if (newMatches.length > 0) {
      results.push({ search, newListings: newMatches });
    }
  }
  
  localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
  return results;
}

export function SavedSearches({ currentFilters, listings, onApplySearch }: SavedSearchesProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [searchName, setSearchName] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSearches(getSavedSearches());
  }, []);

  const hasActiveFilters = () => {
    return currentFilters.search || 
           currentFilters.department !== 'All' || 
           currentFilters.courseCode ||
           currentFilters.conditions.length > 0 ||
           currentFilters.minPrice ||
           currentFilters.maxPrice ||
           currentFilters.tag !== 'All';
  };

  const saveCurrentSearch = () => {
    if (!hasActiveFilters()) {
      toast.error('No filters to save');
      return;
    }

    const name = searchName.trim() || generateSearchName(currentFilters);
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters: {
        search: currentFilters.search || undefined,
        department: currentFilters.department !== 'All' ? currentFilters.department : undefined,
        courseCode: currentFilters.courseCode || undefined,
        conditions: currentFilters.conditions.length > 0 ? currentFilters.conditions : undefined,
        minPrice: currentFilters.minPrice || undefined,
        maxPrice: currentFilters.maxPrice || undefined,
        tag: currentFilters.tag !== 'All' ? currentFilters.tag : undefined,
      },
      createdAt: new Date().toISOString(),
      notificationsEnabled: true,
    };

    const updated = [...searches, newSearch];
    setSearches(updated);
    saveSavedSearches(updated);
    setSearchName('');
    toast.success('Search saved! You\'ll see alerts for new matches.');
  };

  const generateSearchName = (filters: FilterState): string => {
    const parts: string[] = [];
    if (filters.search) parts.push(`"${filters.search}"`);
    if (filters.department !== 'All') parts.push(filters.department);
    if (filters.courseCode) parts.push(filters.courseCode);
    if (filters.tag !== 'All') parts.push(filters.tag);
    return parts.join(' • ') || 'Untitled Search';
  };

  const toggleNotifications = (id: string) => {
    const updated = searches.map(s => 
      s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s
    );
    setSearches(updated);
    saveSavedSearches(updated);
  };

  const deleteSearch = (id: string) => {
    const updated = searches.filter(s => s.id !== id);
    setSearches(updated);
    saveSavedSearches(updated);
    toast.success('Search deleted');
  };

  const applySearch = (search: SavedSearch) => {
    onApplySearch({
      search: search.filters.search || '',
      department: search.filters.department || 'All',
      courseCode: search.filters.courseCode || '',
      conditions: search.filters.conditions || [],
      minPrice: search.filters.minPrice || '',
      maxPrice: search.filters.maxPrice || '',
      sort: currentFilters.sort,
      tag: search.filters.tag || 'All',
    });
    setOpen(false);
    toast.success(`Applied: ${search.name}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Saved Searches</span>
          {searches.filter(s => s.notificationsEnabled).length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
              {searches.filter(s => s.notificationsEnabled).length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Saved Searches & Alerts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Save Current Search */}
          {hasActiveFilters() && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <p className="text-sm font-medium">Save Current Search</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Name (optional)"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={saveCurrentSearch} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {generateSearchName(currentFilters)}
              </p>
            </div>
          )}

          {/* Saved Searches List */}
          <div className="space-y-2">
            <Label>Your Saved Searches</Label>
            {searches.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No saved searches yet</p>
                <p className="text-xs">Apply some filters and save them here</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searches.map((search) => {
                  const matchCount = getMatchingListings(search, listings).length;
                  return (
                    <div
                      key={search.id}
                      className="flex items-center gap-2 rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                    >
                      <button
                        onClick={() => applySearch(search)}
                        className="flex-1 text-left"
                      >
                        <p className="font-medium text-sm truncate">{search.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {matchCount} matching listings
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleNotifications(search.id)}
                      >
                        {search.notificationsEnabled ? (
                          <Bell className="h-4 w-4 text-primary" />
                        ) : (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteSearch(search.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center border-t pt-3">
            Alerts show when new listings match your saved searches
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}