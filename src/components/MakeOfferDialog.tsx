import { useState } from 'react';
import { MessageCircle, Mail, Copy, Check } from 'lucide-react';
import { Listing } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface MakeOfferDialogProps {
  listing: Listing;
  children: React.ReactNode;
}

export function MakeOfferDialog({ listing, children }: MakeOfferDialogProps) {
  const [offerPrice, setOfferPrice] = useState(Math.round(listing.price * 0.9).toString());
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const isEmail = listing.seller_contact.includes('@');
  const isPhone = /^\d{10,11}$|^01\d{9}$/.test(listing.seller_contact.replace(/\D/g, ''));

  const generateMessage = () => {
    const parts = [
      `Hi ${listing.seller_name}!`,
      ``,
      `I'm interested in your listing "${listing.title}" on NSU Book Shop.`,
      ``,
      `📚 Item: ${listing.title}`,
      `📍 Course: ${listing.course_code}`,
      `💰 Listed Price: ৳${listing.price}`,
      listing.negotiable ? `💵 My Offer: ৳${offerPrice}` : '',
      ``,
      customMessage ? `Message: ${customMessage}` : '',
      ``,
      buyerName ? `My Name: ${buyerName}` : '',
      buyerContact ? `Contact: ${buyerContact}` : '',
      ``,
      `Looking forward to hearing from you!`,
    ].filter(Boolean).join('\n');
    return parts;
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    toast.success('Message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    const phone = listing.seller_contact.replace(/\D/g, '');
    const bdPhone = phone.startsWith('0') ? '88' + phone : phone;
    const url = `https://wa.me/${bdPhone}?text=${encodeURIComponent(generateMessage())}`;
    window.open(url, '_blank');
  };

  const openEmail = () => {
    const subject = encodeURIComponent(`Interested in: ${listing.title}`);
    const body = encodeURIComponent(generateMessage());
    window.open(`mailto:${listing.seller_contact}?subject=${subject}&body=${body}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Make an Offer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="font-medium text-sm">{listing.title}</p>
            <p className="text-muted-foreground text-sm">Listed at ৳{listing.price}</p>
          </div>

          {listing.negotiable && (
            <div>
              <Label htmlFor="offer-price">Your Offer Price (৳)</Label>
              <Input
                id="offer-price"
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Enter your offer"
              />
            </div>
          )}

          <div>
            <Label htmlFor="buyer-name">Your Name</Label>
            <Input
              id="buyer-name"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <Label htmlFor="buyer-contact">Your Contact (optional)</Label>
            <Input
              id="buyer-contact"
              value={buyerContact}
              onChange={(e) => setBuyerContact(e.target.value)}
              placeholder="Email or phone"
            />
          </div>

          <div>
            <Label htmlFor="custom-message">Additional Message (optional)</Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Any questions or comments..."
              rows={2}
            />
          </div>

          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <pre className="text-xs whitespace-pre-wrap max-h-32 overflow-y-auto text-foreground/80">
              {generateMessage()}
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            {isPhone && (
              <Button onClick={openWhatsApp} className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="mr-2 h-4 w-4" />
                Send via WhatsApp
              </Button>
            )}
            {isEmail && (
              <Button onClick={openEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Send via Email
              </Button>
            )}
            <Button variant="outline" onClick={copyMessage}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Message'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This opens your messaging app with a pre-filled message
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}