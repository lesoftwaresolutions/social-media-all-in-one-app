import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, Image as ImageIcon, Video, Trash, Search } from 'lucide-react';
import { useListMedia, getListMediaQueryKey, useDeleteMedia } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function MediaLibrary() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [search, setSearch] = useState('');

  const { data: media, isLoading } = useListMedia(
    { company_id: companyId || '', type: filter },
    { query: { enabled: !!companyId, queryKey: getListMediaQueryKey({ company_id: companyId || '', type: filter }) } }
  );

  const deleteMedia = useDeleteMedia();

  const handleDelete = (id: string) => {
    deleteMedia.mutate({ id }, {
      onSuccess: () => {
        toast({ title: 'Media deleted successfully' });
        queryClient.invalidateQueries({ queryKey: getListMediaQueryKey({ company_id: companyId || '', type: filter }) });
      }
    });
  };

  const filteredMedia = media?.filter(m => 
    m.file_name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground mt-1">Manage your images and videos for social posts.</p>
        </div>
        <Button><UploadCloud className="w-4 h-4 mr-2" /> Upload Assets</Button>
      </div>

      {/* Upload Zone */}
      <Card className="border-dashed border-2 bg-muted/20">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Drag & drop your files here</h3>
          <p className="text-sm text-muted-foreground mb-4">Supports JPG, PNG, MP4, and MOV up to 50MB</p>
          <Button variant="outline">Browse Files</Button>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search media..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))
        ) : filteredMedia.length > 0 ? (
          filteredMedia.map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-lg border bg-muted overflow-hidden">
              <img src={item.file_url} alt={item.file_name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => handleDelete(item.id)}>
                    <Trash className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="text-white text-xs truncate font-medium bg-black/50 p-1 px-2 rounded backdrop-blur-sm">
                  {item.file_name}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed rounded-xl bg-card">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No media found</h3>
            <p className="text-muted-foreground text-sm">Upload some images or videos to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
