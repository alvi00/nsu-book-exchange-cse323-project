import { useState, useEffect, useMemo } from 'react';
import { Book, Heart, Plus, Settings, BookOpen } from 'lucide-react';
import { Listing, loadListings, exportJSON, STORAGE_KEYS } from '@/lib/storage';
import { ListingCard } from '@/components/ListingCard';
import { ListingDetail } from '@/components/ListingDetail';
import { PostListingForm } from '@/components/PostListingForm';
import { SearchFilters, FilterState } from '@/components/SearchFilters';
import { WishlistView } from '@/components/WishlistView';
import { AdminPanel } from '@/components/AdminPanel';
import { SavedSearches } from '@/components/SavedSearches';
import { NewMatchesAlert } from '@/components/NewMatchesAlert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type TabValue = 'browse' | 'post' | 'wishlist' | 'admin';

const Index = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('browse');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    department: 'All',
    courseCode: '',
    conditions: [],
    minPrice: '',
    maxPrice: '',
    sort: 'recent',
    tag: 'All',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await loadListings();
      setListings(data);
    } catch (error) {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(searchLower) ||
        l.course_code.toLowerCase().includes(searchLower) ||
        l.seller_name.toLowerCase().includes(searchLower) ||
        l.description.toLowerCase().includes(searchLower)
      );
    }

    // Tag filter
    if (filters.tag !== 'All') {
      result = result.filter(l => l.tag === filters.tag);
    }

    // Department filter
    if (filters.department !== 'All') {
      result = result.filter(l => l.department === filters.department);
    }

    // Course code filter
    if (filters.courseCode) {
      const codeLower = filters.courseCode.toLowerCase();
      result = result.filter(l => l.course_code.toLowerCase().includes(codeLower));
    }

    // Condition filter
    if (filters.conditions.length > 0) {
      result = result.filter(l => filters.conditions.includes(l.condition));
    }

    // Price filter
    if (filters.minPrice) {
      result = result.filter(l => l.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(l => l.price <= Number(filters.maxPrice));
    }

    // Sort
    switch (filters.sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'bumped':
        result.sort((a, b) => {
          const aTime = a.bumped_at || a.created_at;
          const bTime = b.bumped_at || b.created_at;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
        break;
      case 'recent':
      default:
        result.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return result;
  }, [listings, filters]);

  const handleViewListing = (listing: Listing) => {
    setSelectedListing(listing);
    setDetailOpen(true);
  };

  const handlePostSuccess = () => {
    loadData();
    setActiveTab('browse');
    toast.success('Your listing is now live!', {
      action: {
        label: 'Download Data',
        onClick: () => exportJSON(STORAGE_KEYS.LISTINGS, 'nsu_listings.json'),
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">NSU Book Shop</h1>
              <p className="text-xs text-muted-foreground">Buy & Sell Textbooks</p>
            </div>
          </div>
          <Button 
            onClick={() => setActiveTab('post')} 
            className="hidden sm:flex"
          >
            <Plus className="mr-2 h-4 w-4" />
            Post Listing
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            <TabsTrigger value="browse" className="gap-2">
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="post" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Post</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6 animate-fade-in">
            <NewMatchesAlert listings={listings} onViewListing={handleViewListing} />
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <SearchFilters 
                  filters={filters} 
                  onChange={setFilters} 
                  resultCount={filteredListings.length}
                />
              </div>
              <SavedSearches 
                currentFilters={filters} 
                listings={listings} 
                onApplySearch={setFilters}
              />
            </div>
            
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Book className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold">No listings found</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                  Try adjusting your filters or be the first to post!
                </p>
                <Button className="mt-4" onClick={() => setActiveTab('post')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post a Listing
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onView={handleViewListing}
                    onWishlistChange={loadData}
                    onStatusChange={loadData}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="post" className="animate-fade-in">
            <div className="mx-auto max-w-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Post a Listing</h2>
                <p className="text-muted-foreground">
                  Sell your textbooks and classnotes to fellow NSU students
                </p>
              </div>
              <PostListingForm onSuccess={handlePostSuccess} />
            </div>
          </TabsContent>

          <TabsContent value="wishlist" className="animate-fade-in">
            <WishlistView 
              listings={listings} 
              onView={handleViewListing}
              onWishlistChange={loadData}
            />
          </TabsContent>

          <TabsContent value="admin" className="animate-fade-in">
            <AdminPanel onDataChange={loadData} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="mb-2">
            NSU Book Shop — A student marketplace for North South University
          </p>
        </div>
      </footer>

      {/* Listing Detail Modal */}
      <ListingDetail
        listing={selectedListing}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onWishlistChange={loadData}
      />
    </div>
  );
};

export default Index;
