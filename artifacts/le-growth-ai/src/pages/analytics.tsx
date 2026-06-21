import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SiInstagram, SiFacebook, SiTiktok } from 'react-icons/si';
import { 
  useListAnalytics, 
  getListAnalyticsQueryKey,
  useGetPlatformBreakdown,
  getGetPlatformBreakdownQueryKey
} from '@workspace/api-client-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function Analytics() {
  const { companyId } = useAuth();
  const [days, setDays] = useState('30');
  
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useListAnalytics(
    { company_id: companyId || '', days: parseInt(days) },
    { query: { enabled: !!companyId, queryKey: getListAnalyticsQueryKey({ company_id: companyId || '', days: parseInt(days) }) } }
  );

  const { data: platformBreakdown, isLoading: isLoadingBreakdown } = useGetPlatformBreakdown(
    { company_id: companyId || '' },
    { query: { enabled: !!companyId, queryKey: getGetPlatformBreakdownQueryKey({ company_id: companyId || '' }) } }
  );

  // Mock charts data for demonstration
  const mockFollowerGrowth = [
    { date: '01', instagram: 1200, facebook: 800, tiktok: 2000 },
    { date: '05', instagram: 1250, facebook: 810, tiktok: 2300 },
    { date: '10', instagram: 1300, facebook: 825, tiktok: 2600 },
    { date: '15', instagram: 1380, facebook: 830, tiktok: 3100 },
    { date: '20', instagram: 1420, facebook: 850, tiktok: 3500 },
    { date: '25', instagram: 1500, facebook: 860, tiktok: 4200 },
    { date: '30', instagram: 1600, facebook: 880, tiktok: 5000 },
  ];

  const mockEngagement = [
    { name: 'Likes', instagram: 4000, facebook: 1500, tiktok: 8000 },
    { name: 'Comments', instagram: 300, facebook: 120, tiktok: 1200 },
    { name: 'Shares', instagram: 150, facebook: 300, tiktok: 4000 },
  ];

  const getPlatformIcon = (platform: string) => {
    switch(platform.toLowerCase()) {
      case 'instagram': return <SiInstagram className="text-[#E1306C]" />;
      case 'facebook': return <SiFacebook className="text-[#1877F2]" />;
      case 'tiktok': return <SiTiktok className="text-black dark:text-white" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Detailed performance metrics across all platforms.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Follower Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockFollowerGrowth} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="instagram" stroke="#E1306C" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="facebook" stroke="#1877F2" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="tiktok" stroke="#000000" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockEngagement} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="instagram" fill="#E1306C" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="facebook" fill="#1877F2" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="tiktok" fill="#000000" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Times to Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 h-[300px]">
              {/* Heatmap mock - 7 days x 6 time blocks */}
              {Array.from({ length: 7 }).map((_, dayIdx) => (
                <div key={dayIdx} className="flex flex-col gap-1 h-full">
                  <div className="text-[10px] text-center text-muted-foreground mb-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIdx]}
                  </div>
                  {Array.from({ length: 6 }).map((_, timeIdx) => {
                    // Randomize intensity for mock
                    const intensity = Math.floor(Math.random() * 5);
                    const opacityClass = ['opacity-10', 'opacity-30', 'opacity-50', 'opacity-70', 'opacity-100'][intensity];
                    return (
                      <div 
                        key={timeIdx} 
                        className={`flex-1 rounded-sm bg-primary ${opacityClass} transition-opacity hover:opacity-100 cursor-pointer`}
                        title={`${timeIdx * 4}:00`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Followers</TableHead>
                <TableHead className="text-right">Posts</TableHead>
                <TableHead className="text-right">Avg. Likes</TableHead>
                <TableHead className="text-right">Avg. Comments</TableHead>
                <TableHead className="text-right">Engagement Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingBreakdown ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : platformBreakdown && platformBreakdown.length > 0 ? (
                platformBreakdown.map((row: any) => (
                  <TableRow key={row.platform}>
                    <TableCell className="font-medium flex items-center gap-2 capitalize">
                      {getPlatformIcon(row.platform)}
                      {row.platform}
                    </TableCell>
                    <TableCell className="text-right">{row.followers?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right">{row.posts?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right">{row.avgLikes?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right">{row.avgComments?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right">{row.engagementRate ? `${row.engagementRate.toFixed(2)}%` : '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No platform data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
