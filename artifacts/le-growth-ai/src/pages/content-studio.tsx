import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { SiInstagram, SiFacebook, SiTiktok } from 'react-icons/si';
import { Image as ImageIcon, Sparkles, Calendar as CalendarIcon, X } from 'lucide-react';
import { useCreatePost, useImproveCaption } from '@workspace/api-client-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const postSchema = z.object({
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  caption: z.string().min(1, 'Caption is required'),
  hashtags: z.string(),
  scheduledDate: z.date().optional(),
});

export default function ContentStudio() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const createPost = useCreatePost();
  const improveCaption = useImproveCaption();

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      platforms: ['instagram'],
      caption: '',
      hashtags: '',
    },
  });

  const watchCaption = form.watch('caption');
  const watchPlatforms = form.watch('platforms');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImproveCaption = () => {
    const currentCaption = form.getValues('caption');
    if (!currentCaption) {
      toast({ title: 'Add a caption first', variant: 'destructive' });
      return;
    }
    
    improveCaption.mutate(
      { data: { caption: currentCaption, platform: activePlatform, tone: 'professional' } },
      {
        onSuccess: (data) => {
          form.setValue('caption', data.improved);
          toast({ title: 'Caption improved!' });
        },
        onError: () => {
          toast({ title: 'Failed to improve caption', variant: 'destructive' });
        }
      }
    );
  };

  const onSubmit = (data: z.infer<typeof postSchema>) => {
    if (!companyId) return;

    const hashtagsArray = data.hashtags.split(' ').map(t => t.trim().replace('#', '')).filter(Boolean);
    const status = data.scheduledDate ? 'scheduled' : 'draft';

    // Create a post for each selected platform
    data.platforms.forEach(platform => {
      createPost.mutate(
        {
          data: {
            company_id: companyId,
            platform: platform as any,
            caption: data.caption,
            hashtags: hashtagsArray,
            image_url: imagePreview || undefined,
            status: status as any,
            scheduled_at: data.scheduledDate?.toISOString(),
          }
        },
        {
          onSuccess: () => {
            toast({ title: `Post ${status === 'scheduled' ? 'scheduled' : 'saved'} for ${platform}` });
          }
        }
      );
    });

    if (data.platforms.length > 0) {
      form.reset({ platforms: data.platforms, caption: '', hashtags: '' });
      setImagePreview(null);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-4rem)] md:h-screen flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Studio</h1>
        <p className="text-muted-foreground mt-1">Create, preview and schedule your social posts.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-6 flex-1 min-h-0">
        {/* Editor Panel */}
        <Card className="flex flex-col h-full overflow-hidden border-border">
          <CardHeader className="pb-4 shrink-0">
            <CardTitle className="text-lg">Compose Post</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-6">
            <Form {...form}>
              <form id="post-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="platforms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platforms</FormLabel>
                      <FormControl>
                        <ToggleGroup 
                          type="multiple" 
                          value={field.value} 
                          onValueChange={(val) => {
                            if (val.length) field.onChange(val);
                            if (val.length && !val.includes(activePlatform)) {
                              setActivePlatform(val[0]);
                            }
                          }}
                          className="justify-start"
                        >
                          <ToggleGroupItem value="instagram" aria-label="Instagram" className="data-[state=on]:bg-[#E1306C]/10 data-[state=on]:text-[#E1306C]">
                            <SiInstagram className="w-4 h-4 mr-2" /> Instagram
                          </ToggleGroupItem>
                          <ToggleGroupItem value="facebook" aria-label="Facebook" className="data-[state=on]:bg-[#1877F2]/10 data-[state=on]:text-[#1877F2]">
                            <SiFacebook className="w-4 h-4 mr-2" /> Facebook
                          </ToggleGroupItem>
                          <ToggleGroupItem value="tiktok" aria-label="TikTok" className="data-[state=on]:bg-black/10 data-[state=on]:text-black dark:data-[state=on]:bg-white/10 dark:data-[state=on]:text-white">
                            <SiTiktok className="w-4 h-4 mr-2" /> TikTok
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Media</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center relative hover:bg-muted/50 transition-colors">
                    {imagePreview ? (
                      <div className="relative w-full aspect-video md:aspect-square flex items-center justify-center bg-black/5 rounded-md overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 h-6 w-6 rounded-full"
                          onClick={() => setImagePreview(null)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-primary/10 rounded-full mb-3 text-primary">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 8MB)</p>
                        <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                      </>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel>Caption</FormLabel>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-secondary hover:text-secondary-foreground hover:bg-secondary"
                          onClick={onImproveCaption}
                          disabled={improveCaption.isPending || !field.value}
                        >
                          <Sparkles className="w-3 h-3 mr-1" /> AI Improve
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your caption here..." 
                          className="min-h-[120px] resize-y" 
                          {...field} 
                        />
                      </FormControl>
                      <div className="flex justify-end">
                        <span className="text-xs text-muted-foreground">{field.value?.length || 0} / 2200</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hashtags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hashtags (space separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="#growth #marketing #saas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="shrink-0 border-t pt-4 flex flex-wrap gap-3 items-center justify-between bg-muted/20">
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-[200px] pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Schedule Post</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2 ml-auto">
              <Button type="submit" form="post-form" variant="secondary" disabled={createPost.isPending}>
                Save Draft
              </Button>
              <Button type="submit" form="post-form" disabled={createPost.isPending}>
                {form.watch('scheduledDate') ? 'Schedule' : 'Publish Now'}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Preview Panel */}
        <Card className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden border-border">
          <CardHeader className="pb-0 shrink-0">
            <Tabs value={activePlatform} onValueChange={setActivePlatform} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="instagram" disabled={!watchPlatforms?.includes('instagram')}>Instagram</TabsTrigger>
                <TabsTrigger value="facebook" disabled={!watchPlatforms?.includes('facebook')}>Facebook</TabsTrigger>
                <TabsTrigger value="tiktok" disabled={!watchPlatforms?.includes('tiktok')}>TikTok</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto flex items-center justify-center p-6">
            {/* Phone Mockup */}
            <div className="w-[320px] max-w-full bg-white dark:bg-black border-[8px] border-slate-800 dark:border-slate-700 rounded-[2.5rem] shadow-xl overflow-hidden relative aspect-[9/19]">
              {/* Dynamic preview content based on platform */}
              <div className="absolute inset-0 flex flex-col">
                {/* Header */}
                <div className="p-3 flex items-center gap-2 border-b dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-1" />
                    <div className="h-2 w-12 bg-slate-100 dark:bg-slate-900 rounded" />
                  </div>
                  {activePlatform === 'instagram' && <SiInstagram className="text-slate-400 w-4 h-4" />}
                </div>
                
                {/* Image */}
                <div className="bg-slate-100 dark:bg-slate-900 aspect-square flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  )}
                </div>
                
                {/* Actions */}
                <div className="p-3 flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                
                {/* Caption */}
                <div className="px-3 pb-3 flex-1 overflow-y-auto">
                  <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {watchCaption || <span className="text-slate-400">Your caption will appear here...</span>}
                  </p>
                  {form.watch('hashtags') && (
                    <p className="text-sm text-blue-500 mt-2">
                      {form.watch('hashtags').split(' ').map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
