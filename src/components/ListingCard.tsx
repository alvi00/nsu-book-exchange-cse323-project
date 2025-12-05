import { Heart, MapPin, MessageCircle } from 'lucide-react';
import { Listing, isInWishlist, addToWishlist, removeFromWishlist, isSessionListing, updateListingStatus } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ListingCardProps {
  listing: Listing;
  onView: (listing: Listing) => void;
  onWishlistChange?: () => void;
  onStatusChange?: () => void;
}

const conditionColors = {
  'New-ish': 'bg-success text-success-foreground',
  'Used': 'bg-warning text-warning-foreground',
  'Rough': 'bg-destructive text-destructive-foreground',
};

const statusColors = {
  'Available': 'bg-success/10 text-success border-success/20',
  'Reserved': 'bg-warning/10 text-warning border-warning/20',
  'Sold': 'bg-muted text-muted-foreground border-muted',
};

export function ListingCard({ listing, onView, onWishlistChange, onStatusChange }: ListingCardProps) {
  const [wishlisted, setWishlisted] = useState(isInWishlist(listing.id));
  const canEdit = isSessionListing(listing.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(listing.id);
    } else {
      addToWishlist(listing.id);
    }
    setWishlisted(!wishlisted);
    onWishlistChange?.();
  };

  const markAsSold = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateListingStatus(listing.id, 'Sold');
    onStatusChange?.();
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        listing.status === 'Sold' && "opacity-60"
      )}
      onClick={() => onView(listing)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={listing.images[0] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=300&fit=crop'}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={toggleWishlist}
          className={cn(
            "absolute right-3 top-3 rounded-full bg-card/90 p-2 backdrop-blur-sm transition-all hover:scale-110",
            wishlisted && "text-destructive"
          )}
        >
          <Heart className={cn("h-5 w-5", wishlisted && "fill-current")} />
        </button>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <Badge className={conditionColors[listing.condition]}>{listing.condition}</Badge>
          {listing.tag === 'Classnotes' && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">Notes</Badge>
          )}
        </div>
        {listing.status !== 'Available' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Badge className={cn("text-lg px-4 py-1", statusColors[listing.status])}>
              {listing.status}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold leading-tight">{listing.title}</h3>
        </div>
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="font-normal">{listing.department}</Badge>
          <span>{listing.course_code}</span>
        </div>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-primary">৳{listing.price}</span>
            {listing.negotiable && (
              <span className="text-xs text-muted-foreground">(negotiable)</span>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{listing.seller_name}</span>
          </div>
          {listing.location_hint && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-[100px]">{listing.location_hint}</span>
            </div>
          )}
        </div>
        {canEdit && listing.status === 'Available' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 w-full"
            onClick={markAsSold}
          >
            Mark as Sold
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
