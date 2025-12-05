import { Download, Heart, Upload } from 'lucide-react';
import { useRef } from 'react';
import { Listing, getWishlist, exportJSON, importJSON, STORAGE_KEYS } from '@/lib/storage';
import { ListingCard } from './ListingCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WishlistViewProps {
  listings: Listing[];
  onView: (listing: Listing) => void;
  onWishlistChange: () => void;
}

export function WishlistView({ listings, onView, onWishlistChange }: WishlistViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wishlistIds = getWishlist();
  const wishlistItems = listings.filter(l => wishlistIds.includes(l.id));

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importJSON(file, STORAGE_KEYS.WISHLIST);
      toast.success('Wishlist imported successfully');
      onWishlistChange();
    } catch (error) {
      toast.error('Failed to import: Invalid JSON format');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Wishlist</h2>
          <p className="text-muted-foreground">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportJSON(STORAGE_KEYS.WISHLIST, 'nsu_wishlist.json')}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No saved items yet</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            Browse listings and click the heart icon to save items you're interested in.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onView={onView}
              onWishlistChange={onWishlistChange}
            />
          ))}
        </div>
      )}

      <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium mb-1">💡 Tip</p>
        <p>
          Your wishlist is stored in your browser. Use Export to save it and Import to restore it on another device.
        </p>
      </div>
    </div>
  );
}
