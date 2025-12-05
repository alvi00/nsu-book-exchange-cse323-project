import { useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, ExternalLink, Flag, Heart, Mail, MapPin, MessageCircle, Phone, User, X } from 'lucide-react';
import { Listing, isInWishlist, addToWishlist, removeFromWishlist, addReport } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MakeOfferDialog } from '@/components/MakeOfferDialog';
import { SellerProfile } from '@/components/SellerProfile';

interface ListingDetailProps {
  listing: Listing | null;
  open: boolean;
  onClose: () => void;
  onWishlistChange?: () => void;
}

const conditionColors = {
  'New-ish': 'bg-success text-success-foreground',
  'Used': 'bg-warning text-warning-foreground',
  'Rough': 'bg-destructive text-destructive-foreground',
};

export function ListingDetail({ listing, open, onClose, onWishlistChange }: ListingDetailProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [wishlisted, setWishlisted] = useState(listing ? isInWishlist(listing.id) : false);

  if (!listing) return null;

  const isEmail = listing.seller_contact.includes('@');
  
  const toggleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(listing.id);
    } else {
      addToWishlist(listing.id);
    }
    setWishlisted(!wishlisted);
    onWishlistChange?.();
  };

  const copyContact = () => {
    navigator.clipboard.writeText(listing.seller_contact);
    toast.success('Contact copied to clipboard!');
  };

  const submitReport = () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    addReport({
      listing_id: listing.id,
      reason: reportReason,
      details: reportDetails,
    });
    toast.success('Report submitted. Thank you!');
    setShowReport(false);
    setReportReason('');
    setReportDetails('');
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative aspect-video bg-muted">
          <img
            src={listing.images[currentImage] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=600&fit=crop'}
            alt={listing.title}
            className="h-full w-full object-contain"
          />
          {listing.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 backdrop-blur-sm hover:bg-card"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 backdrop-blur-sm hover:bg-card"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                {listing.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      idx === currentImage ? "bg-primary w-4" : "bg-card/70"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl">{listing.title}</DialogTitle>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge className={conditionColors[listing.condition]}>{listing.condition}</Badge>
                  <Badge variant="outline">{listing.department}</Badge>
                  <Badge variant="secondary">{listing.course_code}</Badge>
                  {listing.tag === 'Classnotes' && (
                    <Badge className="bg-primary/10 text-primary">Classnotes</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">৳{listing.price}</div>
                {listing.negotiable && (
                  <span className="text-sm text-muted-foreground">Negotiable</span>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="mb-6 rounded-lg bg-muted/50 p-4">
            <h3 className="mb-2 font-semibold">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">Seller Information</h3>
              <div className="space-y-2">
                <SellerProfile sellerName={listing.seller_name} sellerContact={listing.seller_contact}>
                  <button className="flex items-center gap-2 font-medium hover:text-primary transition-colors">
                    {listing.seller_name}
                    <User className="h-4 w-4 text-muted-foreground" />
                  </button>
                </SellerProfile>
                <div className="flex items-center gap-2">
                  {isEmail ? <Mail className="h-4 w-4 text-muted-foreground" /> : <Phone className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm text-muted-foreground">{listing.seller_contact}</span>
                  <button onClick={copyContact} className="p-1 hover:text-primary">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {listing.location_hint && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location_hint}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <MakeOfferDialog listing={listing}>
                <Button className="flex-1 bg-success hover:bg-success/90">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Make an Offer
                </Button>
              </MakeOfferDialog>
              {isEmail ? (
                <Button variant="outline" asChild>
                  <a href={`mailto:${listing.seller_contact}?subject=Interested in: ${listing.title}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </a>
                </Button>
              ) : (
                <Button variant="outline" onClick={copyContact}>
                  <Phone className="mr-2 h-4 w-4" />
                  Copy Phone Number
                </Button>
              )}
              <Button
                variant={wishlisted ? "secondary" : "outline"}
                onClick={toggleWishlist}
              >
                <Heart className={cn("mr-2 h-4 w-4", wishlisted && "fill-current text-destructive")} />
                {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
              <Button variant="ghost" className="text-muted-foreground" onClick={() => setShowReport(true)}>
                <Flag className="mr-2 h-4 w-4" />
                Report Listing
              </Button>
            </div>
          </div>

          {showReport && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <h3 className="mb-3 font-semibold text-destructive">Report this Listing</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    placeholder="e.g., Scam, Inappropriate, Wrong info"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="details">Details (optional)</Label>
                  <Textarea
                    id="details"
                    placeholder="Provide more details..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={submitReport}>Submit Report</Button>
                  <Button variant="ghost" onClick={() => setShowReport(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Posted on {new Date(listing.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
