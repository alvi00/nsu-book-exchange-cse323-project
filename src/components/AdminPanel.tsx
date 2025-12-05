import { useState, useRef } from 'react';
import { AlertTriangle, Download, Lock, Trash2, Upload, Unlock } from 'lucide-react';
import { STORAGE_KEYS, clearAllData, exportJSON, getReports, importJSON } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const ADMIN_PASSPHRASE = 'nsubooks2025';

interface AdminPanelProps {
  onDataChange: () => void;
}

export function AdminPanel({ onDataChange }: AdminPanelProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reports = getReports();

  const handleUnlock = () => {
    if (passphrase === ADMIN_PASSPHRASE) {
      setUnlocked(true);
      setPassphrase('');
      toast.success('Admin panel unlocked');
    } else {
      toast.error('Incorrect passphrase');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importJSON(file, STORAGE_KEYS.LISTINGS);
      toast.success('Listings imported successfully');
      onDataChange();
    } catch (error) {
      toast.error('Failed to import: Invalid JSON format');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure? This will delete ALL local data including listings, wishlist, and reports.')) {
      clearAllData();
      toast.success('All data cleared');
      onDataChange();
    }
  };

  if (!unlocked) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Admin Panel
          </CardTitle>
          <CardDescription>Enter passphrase to access admin functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            />
            <Button onClick={handleUnlock}>
              <Unlock className="mr-2 h-4 w-4" />
              Unlock
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Hint: nsubooks2025
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="border-warning bg-warning/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Admin mode active. Changes here affect all local data.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download current data as JSON files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => exportJSON(STORAGE_KEYS.LISTINGS, 'nsu_listings.json')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Listings
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => exportJSON(STORAGE_KEYS.WISHLIST, 'nsu_wishlist.json')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Wishlist
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => exportJSON(STORAGE_KEYS.REPORTS, 'nsu_reports.json')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Reports ({reports.length})
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>Replace listings with imported JSON</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="import-file" className="sr-only">Import JSON file</Label>
              <input
                ref={fileInputRef}
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Listings JSON
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a JSON file with an array of listings. This will replace all current listings.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleClearData}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Local Data
            </Button>
          </CardContent>
        </Card>

        {reports.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Reports ({reports.length})</CardTitle>
              <CardDescription>User-submitted reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reports.map((report) => (
                  <div key={report.id} className="rounded-lg border p-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{report.reason}</span>
                      <span className="text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{report.details || 'No details provided'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Listing ID: {report.listing_id}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Button variant="ghost" onClick={() => setUnlocked(false)} className="w-full">
        <Lock className="mr-2 h-4 w-4" />
        Lock Admin Panel
      </Button>
    </div>
  );
}
