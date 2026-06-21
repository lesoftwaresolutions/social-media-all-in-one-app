import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useListPosts, getListPostsQueryKey } from '@workspace/api-client-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CalendarView() {
  const { companyId } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const { data: posts, isLoading } = useListPosts(
    { company_id: companyId || '' },
    { query: { enabled: !!companyId, queryKey: getListPostsQueryKey({ company_id: companyId || '' }) } }
  );

  const prevPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const dateFormat = "MMMM yyyy";

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getPostsForDay = (date: Date) => {
    if (!posts) return [];
    return posts.filter(post => {
      const postDate = new Date(post.scheduled_at || post.created_at);
      return isSameDay(postDate, date);
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-[#E1306C]';
      case 'facebook': return 'bg-[#1877F2]';
      case 'tiktok': return 'bg-black dark:bg-white';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground mt-1">Plan and visualize your posting schedule.</p>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={prevPeriod}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextPeriod}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[150px] text-center">
              {view === 'month' 
                ? format(currentDate, dateFormat) 
                : `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
              }
            </h2>
          </div>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
        </CardHeader>
        <CardContent className="p-0">
          {view === 'month' && (
            <div className="grid grid-cols-7 border-b">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="py-3 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
          )}
          
          {view === 'month' ? (
            <div className="grid grid-cols-7 auto-rows-fr">
              {days.map((day, idx) => {
                const dayPosts = getPostsForDay(day);
                return (
                  <div 
                    key={day.toString()} 
                    className={`min-h-[120px] p-2 border-b border-r last:border-r-0 relative group hover:bg-muted/30 transition-colors
                      ${!isSameMonth(day, currentDate) ? 'bg-muted/10 text-muted-foreground' : ''}
                      ${idx % 7 === 6 ? 'border-r-0' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                        ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground' : ''}
                      `}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayPosts.map((post, pIdx) => (
                        <div key={post.id || pIdx} className={`text-xs px-2 py-1 rounded-sm truncate text-white ${getPlatformColor(post.platform)}`} title={post.caption || ''}>
                          {post.caption || `New ${post.platform} post`}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-7 min-h-[600px]">
              {weekDays.map((day, idx) => {
                const dayPosts = getPostsForDay(day);
                return (
                  <div key={day.toString()} className={`border-r last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-primary/5' : ''}`}>
                    <div className="py-3 text-center border-b bg-muted/20">
                      <div className="text-xs font-semibold text-muted-foreground uppercase">{format(day, 'EEE')}</div>
                      <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>{format(day, 'd')}</div>
                    </div>
                    <div className="p-2 space-y-2">
                      {dayPosts.map((post, pIdx) => (
                        <div key={post.id || pIdx} className="p-2 rounded border bg-card shadow-sm text-sm space-y-1">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${getPlatformColor(post.platform)}`} />
                            <span className="font-medium capitalize text-xs">{post.platform}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">{post.scheduled_at ? format(new Date(post.scheduled_at), 'h:mm a') : ''}</span>
                          </div>
                          <p className="line-clamp-2 text-xs text-muted-foreground">{post.caption}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
