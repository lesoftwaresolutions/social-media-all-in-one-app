import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SiInstagram, SiFacebook, SiTiktok } from 'react-icons/si';
import { useListPosts, getListPostsQueryKey } from '@workspace/api-client-react';
import { Calendar, Clock, Image as ImageIcon, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

export default function Scheduler() {
  const { companyId } = useAuth();
  
  // Filter by scheduled posts only
  const { data: posts, isLoading } = useListPosts(
    { company_id: companyId || '', status: 'scheduled' as any },
    { query: { enabled: !!companyId, queryKey: getListPostsQueryKey({ company_id: companyId || '', status: 'scheduled' as any }) } }
  );

  const getPlatformIcon = (platform: string) => {
    switch(platform.toLowerCase()) {
      case 'instagram': return <SiInstagram className="w-4 h-4 text-[#E1306C]" />;
      case 'facebook': return <SiFacebook className="w-4 h-4 text-[#1877F2]" />;
      case 'tiktok': return <SiTiktok className="w-4 h-4 text-black dark:text-white" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduled Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming content pipeline.</p>
        </div>
        <Button>Schedule New Post</Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row p-4 gap-6 items-center">
                <Skeleton className="h-16 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
            </Card>
          ))
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="flex flex-col sm:flex-row p-4 gap-6 items-start sm:items-center">
                
                {/* Date & Time Column */}
                <div className="flex flex-col items-center justify-center shrink-0 w-full sm:w-32 bg-muted/30 p-3 rounded-lg border">
                  <span className="text-xs font-medium text-muted-foreground uppercase mb-1">
                    {post.scheduled_at ? format(new Date(post.scheduled_at), 'MMM') : 'No Date'}
                  </span>
                  <span className="text-3xl font-bold">
                    {post.scheduled_at ? format(new Date(post.scheduled_at), 'dd') : '--'}
                  </span>
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium bg-background px-2 py-1 rounded-md shadow-sm border">
                    <Clock className="w-3 h-3 text-primary" />
                    {post.scheduled_at ? format(new Date(post.scheduled_at), 'h:mm a') : 'TBD'}
                  </div>
                </div>
                
                {/* Image Thumbnail */}
                <div className="w-full sm:w-24 h-40 sm:h-24 bg-muted rounded-md shrink-0 border flex items-center justify-center relative overflow-hidden">
                  {post.image_url ? (
                    <img src={post.image_url} alt="Post preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                  )}
                  <div className="absolute top-1 left-1 p-1 bg-background/80 backdrop-blur-sm rounded-sm">
                    {getPlatformIcon(post.platform)}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 capitalize">
                      {post.platform}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                      Scheduled
                    </Badge>
                  </div>
                  <p className="text-sm font-medium line-clamp-2 text-foreground/90 leading-relaxed">
                    {post.caption || 'No caption provided.'}
                  </p>
                  
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.hashtags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs text-muted-foreground">#{tag}</span>
                      ))}
                      {post.hashtags.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{post.hashtags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="shrink-0 flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 justify-end">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto h-8">
                    <Edit className="w-3 h-3 mr-2" /> Edit
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Publish Now</DropdownMenuItem>
                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10">
                        <Trash className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 px-4 border rounded-xl bg-card border-dashed">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No scheduled posts</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Your calendar is looking a bit empty. Create and schedule content to keep your audience engaged.
            </p>
            <Button>Go to Content Studio</Button>
          </div>
        )}
      </div>
    </div>
  );
}
