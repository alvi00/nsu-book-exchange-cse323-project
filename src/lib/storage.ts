// Storage keys
export const STORAGE_KEYS = {
  LISTINGS: 'nsu_listings',
  WISHLIST: 'nsu_wishlist',
  REPORTS: 'nsu_reports',
  SESSION_LISTINGS: 'nsu_session_listings', // IDs of listings created this session
} as const;

export interface Listing {
  id: string;
  title: string;
  description: string;
  tag: 'Book' | 'Classnotes';
  images: string[];
  department: string;
  course_code: string;
  condition: 'New-ish' | 'Used' | 'Rough';
  price: number;
  negotiable: boolean;
  status: 'Available' | 'Reserved' | 'Sold';
  seller_name: string;
  seller_contact: string;
  location_hint?: string;
  created_at: string;
  bumped_at?: string;
}

export interface Report {
  id: string;
  listing_id: string;
  reason: string;
  details: string;
  created_at: string;
}

// Generate unique ID
export function generateId(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 6);
  return `${timestamp}-${random}`;
}

// Load initial data from JSON or localStorage
export async function loadListings(): Promise<Listing[]> {
  const local = localStorage.getItem(STORAGE_KEYS.LISTINGS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      console.error('Failed to parse localStorage listings');
    }
  }
  
  try {
    const res = await fetch('/data/listings.json');
    const data = await res.json();
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Failed to load listings.json:', error);
    return [];
  }
}

// Save listings to localStorage
export function saveListings(listings: Listing[]): void {
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
}

// Add a new listing
export function addListing(listing: Omit<Listing, 'id' | 'created_at' | 'status'>): Listing {
  const newListing: Listing = {
    ...listing,
    id: generateId(),
    status: 'Available',
    created_at: new Date().toISOString(),
  };
  
  const listings = JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTINGS) || '[]');
  listings.unshift(newListing);
  saveListings(listings);
  
  // Track session listings
  const sessionListings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_LISTINGS) || '[]');
  sessionListings.push(newListing.id);
  localStorage.setItem(STORAGE_KEYS.SESSION_LISTINGS, JSON.stringify(sessionListings));
  
  return newListing;
}

// Update listing status
export function updateListingStatus(id: string, status: Listing['status']): void {
  const listings: Listing[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTINGS) || '[]');
  const index = listings.findIndex(l => l.id === id);
  if (index !== -1) {
    listings[index].status = status;
    saveListings(listings);
  }
}

// Bump listing
export function bumpListing(id: string): void {
  const listings: Listing[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTINGS) || '[]');
  const index = listings.findIndex(l => l.id === id);
  if (index !== -1) {
    listings[index].bumped_at = new Date().toISOString();
    saveListings(listings);
  }
}

// Check if listing was created this session
export function isSessionListing(id: string): boolean {
  const sessionListings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_LISTINGS) || '[]');
  return sessionListings.includes(id);
}

// Wishlist functions
export function getWishlist(): string[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST) || '[]');
}

export function addToWishlist(id: string): void {
  const wishlist = getWishlist();
  if (!wishlist.includes(id)) {
    wishlist.push(id);
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }
}

export function removeFromWishlist(id: string): void {
  const wishlist = getWishlist().filter(wid => wid !== id);
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
}

export function isInWishlist(id: string): boolean {
  return getWishlist().includes(id);
}

// Reports
export function addReport(report: Omit<Report, 'id' | 'created_at'>): void {
  const reports: Report[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
  reports.push({
    ...report,
    id: generateId(),
    created_at: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
}

export function getReports(): Report[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
}

// Export/Import functions
export function exportJSON(key: string, filename: string): void {
  const data = localStorage.getItem(key) || '[]';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file: File, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!Array.isArray(data)) {
          throw new Error('Invalid JSON format: expected array');
        }
        localStorage.setItem(key, JSON.stringify(data));
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Clear all data
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
