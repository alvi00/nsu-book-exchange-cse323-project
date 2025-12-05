import { useMemo } from 'react';
import { User, Package, CheckCircle, Star } from 'lucide-react';
import { Listing, STORAGE_KEYS } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SellerProfileProps {
  sellerName: string;
  sellerContact: string;
  children: React.ReactNode;
}

interface SellerStats {
  totalListings: number;
  soldCount: number;
  availableCount: number;
  avgPrice: number;
  departments: string[];
  memberSince: string;
}

export function SellerProfile({ sellerName, sellerContact, children }: SellerProfileProps) {
  const stats = useMemo((): SellerStats => {
    const listings: Listing[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTINGS) || '[]');
    const sellerListings = listings.filter(l => 
      l.seller_name.toLowerCase() === sellerName.toLowerCase() ||
      l.seller_contact.toLowerCase() === sellerContact.toLowerCase()
    );

    const soldCount = sellerListings.filter(l => l.status === 'Sold').length;
    const availableCount = sellerListings.filter(l => l.status === 'Available').length;
    const avgPrice = sellerListings.length > 0 
      ? Math.round(sellerListings.reduce((sum, l) => sum + l.price, 0) / sellerListings.length)
      : 0;
    const departments = [...new Set(sellerListings.map(l => l.department))];
    const oldestListing = sellerListings.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0];

    return {
      totalListings: sellerListings.length,
      soldCount,
      availableCount,
      avgPrice,
      departments,
      memberSince: oldestListing?.created_at || new Date().toISOString(),
    };
  }, [sellerName, sellerContact]);

  const getTrustLevel = () => {
    if (stats.soldCount >= 5) return { label: 'Trusted Seller', color: 'bg-success text-success-foreground' };
    if (stats.totalListings >= 3) return { label: 'Active Seller', color: 'bg-primary/20 text-primary' };
    return { label: 'New Seller', color: 'bg-muted text-muted-foreground' };
  };

  const trustLevel = getTrustLevel();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Seller Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seller Avatar & Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{sellerName}</h3>
              <Badge className={trustLevel.color}>{trustLevel.label}</Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xl font-bold">{stats.totalListings}</div>
              <div className="text-xs text-muted-foreground">Listings</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <CheckCircle className="h-5 w-5 mx-auto mb-1 text-success" />
              <div className="text-xl font-bold">{stats.soldCount}</div>
              <div className="text-xs text-muted-foreground">Sold</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <Star className="h-5 w-5 mx-auto mb-1 text-warning" />
              <div className="text-xl font-bold">{stats.availableCount}</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 text-sm">
            {stats.avgPrice > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Price</span>
                <span className="font-medium">৳{stats.avgPrice}</span>
              </div>
            )}
            {stats.departments.length > 0 && (
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Departments</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                  {stats.departments.slice(0, 3).map(dept => (
                    <Badge key={dept} variant="outline" className="text-xs">{dept}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium">
                {new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center border-t pt-3">
            Stats are based on listings in your local data
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}