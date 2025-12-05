import { useState, useEffect } from 'react';
import { Bell, X, ChevronRight } from 'lucide-react';
import { Listing } from '@/lib/storage';
import { checkNewMatches, SavedSearch } from '@/components/SavedSearches';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NewMatchesAlertProps {
  listings: Listing[];
  onViewListing: (listing: Listing) => void;
}

interface MatchResult {
  search: SavedSearch;
  newListings: Listing[];
}

export function NewMatchesAlert({ listings, onViewListing }: NewMatchesAlertProps) {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (listings.length > 0) {
      const newMatches = checkNewMatches(listings);
      setMatches(newMatches);
    }
  }, [listings]);

  if (dismissed || matches.length === 0) return null;

  const totalNew = matches.reduce((sum, m) => sum + m.newListings.length, 0);

  return (
    <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              New Matches Found!
              <Badge variant="secondary">{totalNew} new</Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              {matches.length} saved search{matches.length > 1 ? 'es' : ''} matched new listings
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setDismissed(true)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          {matches.map(({ search, newListings }) => (
            <div key={search.id} className="rounded-md bg-background/50 p-3">
              <p className="text-sm font-medium mb-2">"{search.name}"</p>
              <div className="space-y-1">
                {newListings.slice(0, 3).map((listing) => (
                  <button
                    key={listing.id}
                    onClick={() => onViewListing(listing)}
                    className="flex items-center gap-2 w-full text-left text-sm hover:text-primary transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    <span className="truncate flex-1">{listing.title}</span>
                    <span className="text-muted-foreground">৳{listing.price}</span>
                  </button>
                ))}
                {newListings.length > 3 && (
                  <p className="text-xs text-muted-foreground pl-5">
                    +{newListings.length - 3} more
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Show Less' : 'View Matches'}
      </Button>
    </div>
  );
}