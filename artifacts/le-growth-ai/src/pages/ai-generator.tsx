import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Copy, Check, Calendar as CalendarIcon } from 'lucide-react';
import { useGenerateContent, useGenerateCalendar } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';

const aiFormSchema = z.object({
  businessName: z.string().min(2, 'Required'),
  industry: z.string().min(2, 'Required'),
  location: z.string(),
  tone: z.enum(['Professional', 'Friendly', 'Excited', 'Informative', 'Promotional']),
  goal: z.enum(['Brand Awareness', 'Drive Sales', 'Get Bookings', 'Increase Followers']),
});

type AIFormValues = z.infer<typeof aiFormSchema>;

const INDUSTRIES = [
  'Hotel', 'Coffee Shop', 'Restaurant', 'Takeaway', 
  'Hair Salon', 'Retail', 'Estate Agent', 'Gym', 'Spa', 'Other'
];

export default function AIGenerator() {
  const { toast } = useToast();
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  
  const generateContent = useGenerateContent();
  const generateCalendar = useGenerateCalendar();

  const form = useForm<AIFormValues>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      businessName: '',
      industry: '',
      location: '',
      tone: 'Friendly',
      goal: 'Brand Awareness',
    },
  });

  const onSubmitContent = (data: AIFormValues) => {
    generateContent.mutate({
      data: {
        businessName: data.businessName,
        industry: data.industry,
        location: data.location,
        tone: data.tone as any,
        goal: data.goal as any,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Content generated successfully!" });
      },
      onError: () => {
        toast({ title: "Failed to generate content", variant: "destructive" });
      }
    });
  };

  const onGenerateCalendar = () => {
    const { businessName, industry } = form.getValues();
    if (!businessName || !industry) {
      toast({ title: "Please fill in business name and industry first", variant: "destructive" });
      return;
    }
    
    generateCalendar.mutate({
      data: {
        businessName,
        industry,
        month: new Date().toLocaleString('default', { month: 'long' }),
      }
    }, {
      onSuccess: () => {
        toast({ title: "30-Day calendar generated!" });
      }
    });
  };

  const applyTemplate = (industry: string) => {
    form.setValue('industry', industry);
    form.setValue('businessName', `My ${industry}`);
    form.setValue('tone', 'Friendly');
    form.setValue('goal', industry === 'Restaurant' || industry === 'Coffee Shop' ? 'Get Bookings' : 'Brand Awareness');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Content Generator</h1>
        <p className="text-muted-foreground mt-1">Generate high-converting social media content tailored to your business.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Profile</CardTitle>
              <CardDescription>Tell AI about your business to generate context-aware content.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Quick Templates</p>
                <div className="flex flex-wrap gap-2">
                  {['Coffee Shop', 'Restaurant', 'Hair Salon'].map(ind => (
                    <Button 
                      key={ind} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => applyTemplate(ind)}
                    >
                      {ind}
                    </Button>
                  ))}
                </div>
              </div>

              <Form {...form}>
                <form id="ai-form" onSubmit={form.handleSubmit(onSubmitContent)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. The Rustic Bean" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INDUSTRIES.map(ind => (
                              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. London, UK" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tone</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Tone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Professional">Professional</SelectItem>
                              <SelectItem value="Friendly">Friendly</SelectItem>
                              <SelectItem value="Excited">Excited</SelectItem>
                              <SelectItem value="Informative">Informative</SelectItem>
                              <SelectItem value="Promotional">Promotional</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Brand Awareness">Brand Awareness</SelectItem>
                              <SelectItem value="Drive Sales">Drive Sales</SelectItem>
                              <SelectItem value="Get Bookings">Get Bookings</SelectItem>
                              <SelectItem value="Increase Followers">Increase Followers</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full mt-2" disabled={generateContent.isPending}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {generateContent.isPending ? 'Generating...' : 'Generate Content'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/10 border-secondary/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                <CalendarIcon className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-foreground">Need a full plan?</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Generate a complete 30-day social media calendar based on your business profile.</p>
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  onClick={onGenerateCalendar}
                  disabled={generateCalendar.isPending}
                >
                  {generateCalendar.isPending ? 'Planning...' : 'Generate 30-Day Plan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="h-[500px] flex flex-col border-border">
            <CardHeader className="pb-0 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Generated Content</CardTitle>
                {generateContent.data && (
                  <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">Ready</Badge>
                )}
              </div>
              <Tabs defaultValue="instagram" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="instagram">Instagram</TabsTrigger>
                  <TabsTrigger value="facebook">Facebook</TabsTrigger>
                  <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                  <TabsTrigger value="hashtags">Tags & CTA</TabsTrigger>
                </TabsList>
                
                <div className="mt-4 pb-4">
                  {['instagram', 'facebook', 'tiktok'].map((platform) => (
                    <TabsContent key={platform} value={platform} className="m-0 h-[300px]">
                      {generateContent.isPending ? (
                        <div className="h-full flex flex-col space-y-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-1/2 mt-4" />
                        </div>
                      ) : generateContent.data ? (
                        <div className="h-full flex flex-col relative group">
                          <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/20">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {(generateContent.data as any)[platform]}
                            </p>
                          </ScrollArea>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="h-8 shadow-sm"
                              onClick={() => copyToClipboard((generateContent.data as any)[platform], platform)}
                            >
                              {copiedStates[platform] ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                              {copiedStates[platform] ? 'Copied' : 'Copy'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-md bg-muted/10">
                          Fill out your business profile to generate content
                        </div>
                      )}
                    </TabsContent>
                  ))}
                  
                  <TabsContent value="hashtags" className="m-0 h-[300px]">
                    {generateContent.isPending ? (
                      <div className="h-full flex flex-col space-y-3">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full mt-4" />
                      </div>
                    ) : generateContent.data ? (
                      <div className="h-full flex flex-col space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Recommended Hashtags</h4>
                          <div className="flex flex-wrap gap-2 p-4 border rounded-md bg-muted/20">
                            {generateContent.data.hashtags?.map((tag: string, i: number) => (
                              <span key={i} className="text-sm text-primary bg-primary/10 px-2 py-1 rounded">#{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Call to Action (CTA)</h4>
                          <div className="p-4 border rounded-md bg-muted/20 relative group">
                            <p className="text-sm font-medium">{generateContent.data.callToAction}</p>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                              onClick={() => copyToClipboard(generateContent.data.callToAction, 'cta')}
                            >
                              {copiedStates['cta'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-md bg-muted/10">
                        Fill out your business profile to generate hashtags
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </CardHeader>
          </Card>

          {/* Calendar Results */}
          {generateCalendar.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">30-Day Content Calendar</CardTitle>
                <CardDescription>A structured plan based on your industry and goals.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map(week => {
                      const weekPosts = generateCalendar.data.calendar?.filter((c: any) => c.week === week) || [];
                      if (weekPosts.length === 0) return null;
                      
                      return (
                        <div key={week} className="space-y-3">
                          <h4 className="font-semibold border-b pb-2">Week {week}</h4>
                          <div className="grid gap-3">
                            {weekPosts.map((post: any, idx: number) => (
                              <div key={idx} className="flex gap-4 p-3 border rounded-md bg-card">
                                <div className="w-16 shrink-0 text-center">
                                  <div className="text-xs text-muted-foreground uppercase">{post.day}</div>
                                  <div className="font-bold text-lg">{new Date(post.date).getDate()}</div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-[10px]">{post.platform}</Badge>
                                    <span className="text-xs font-medium text-primary">{post.theme}</span>
                                  </div>
                                  <p className="text-sm font-medium mb-1">{post.postIdea}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{post.caption}</p>
                                </div>
                                <div className="shrink-0 flex items-center">
                                  <Button variant="ghost" size="sm" className="text-xs">Use Idea</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Small workaround for Badge component since it's not imported above
function Badge({ className, variant = "default", ...props }: any) {
  const variants: any = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground"
  };
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`} {...props} />
  );
}
