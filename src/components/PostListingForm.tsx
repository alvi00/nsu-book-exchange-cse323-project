import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { addListing, Listing } from '@/lib/storage';
import { processImages } from '@/lib/imageUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const DEPARTMENTS = [
  'CSE', 'EEE', 'ECE', 'BBA', 'Economics', 'English', 'Architecture', 
  'Pharmacy', 'Public Health', 'Environmental Science', 'Law', 'Other'
];

const CONDITIONS: Listing['condition'][] = ['New-ish', 'Used', 'Rough'];
const TAGS: Listing['tag'][] = ['Book', 'Classnotes'];

interface PostListingFormProps {
  onSuccess: () => void;
}

export function PostListingForm({ onSuccess }: PostListingFormProps) {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [condition, setCondition] = useState<Listing['condition']>('Used');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [tag, setTag] = useState<Listing['tag']>('Book');
  const [sellerName, setSellerName] = useState('');
  const [sellerContact, setSellerContact] = useState('');
  const [locationHint, setLocationHint] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    try {
      const newImages = await processImages(e.target.files);
      setImages(prev => [...prev, ...newImages].slice(0, 6));
    } catch (error) {
      toast.error('Failed to process images');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!department) {
      toast.error('Department is required');
      return;
    }
    if (!sellerName.trim()) {
      toast.error('Seller name is required');
      return;
    }
    if (!sellerContact.trim()) {
      toast.error('Contact information is required');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      toast.error('Valid price is required');
      return;
    }

    setLoading(true);
    try {
      addListing({
        title: title.trim(),
        description: description.trim(),
        tag,
        images: images.length ? images : ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=300&fit=crop'],
        department,
        course_code: courseCode.toUpperCase().trim(),
        condition,
        price: Number(price),
        negotiable,
        seller_name: sellerName.trim(),
        seller_contact: sellerContact.trim(),
        location_hint: locationHint.trim() || undefined,
      });

      toast.success('Listing posted successfully!');
      
      // Reset form
      setImages([]);
      setTitle('');
      setDescription('');
      setDepartment('');
      setCourseCode('');
      setCondition('Used');
      setPrice('');
      setNegotiable(false);
      setTag('Book');
      setSellerName('');
      setSellerContact('');
      setLocationHint('');
      
      onSuccess();
    } catch (error) {
      toast.error('Failed to post listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <Label className="mb-2 block">Photos (max 6)</Label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <img src={img} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < 6 && (
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary hover:bg-muted">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
            </label>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Physics for Engineers - 3rd Edition"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the item condition, any highlights, notes included, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={1000}
          />
        </div>

        <div>
          <Label htmlFor="tag">Type</Label>
          <Select value={tag} onValueChange={(v) => setTag(v as Listing['tag'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAGS.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="department">Department *</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="courseCode">Course Code</Label>
          <Input
            id="courseCode"
            placeholder="e.g., PHY101"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            maxLength={20}
          />
        </div>

        <div>
          <Label htmlFor="condition">Condition</Label>
          <Select value={condition} onValueChange={(v) => setCondition(v as Listing['condition'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price">Price (৳) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            placeholder="450"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="flex items-end pb-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="negotiable"
              checked={negotiable}
              onCheckedChange={(v) => setNegotiable(!!v)}
            />
            <Label htmlFor="negotiable" className="font-normal">Price is negotiable</Label>
          </div>
        </div>

        <div className="sm:col-span-2 border-t pt-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Your Information</p>
        </div>

        <div>
          <Label htmlFor="sellerName">Your Name *</Label>
          <Input
            id="sellerName"
            placeholder="Your name"
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            maxLength={50}
          />
        </div>

        <div>
          <Label htmlFor="sellerContact">Contact (Email or Phone) *</Label>
          <Input
            id="sellerContact"
            placeholder="your.email@northsouth.edu or 017XXXXXXXX"
            value={sellerContact}
            onChange={(e) => setSellerContact(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="locationHint">Location Hint (optional)</Label>
          <Input
            id="locationHint"
            placeholder="e.g., Central Library, North Canteen"
            value={locationHint}
            onChange={(e) => setLocationHint(e.target.value)}
            maxLength={100}
          />
        </div>
      </div>

      <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium mb-1">💡 Tips</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use your NSU email for credibility</li>
          <li>Clear photos help sell faster</li>
          <li>Be honest about the condition</li>
        </ul>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? 'Posting...' : 'Post Listing'}
      </Button>
    </form>
  );
}
