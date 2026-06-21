import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  FileImage, 
  MousePointerClick, 
  Sparkles,
  Send,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { SiInstagram, SiFacebook, SiTiktok } from 'react-icons/si';
import { 
  useGetDashboardSummary, 
  getGetDashboardSummaryQueryKey,
  useListSocialAccounts,
  getListSocialAccountsQueryKey
} from '@workspace/api-client-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const { companyId } = useAuth();
  
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary(
    { company_id: companyId || '' },
    { query: { enabled: !!companyId, queryKey: getGetDashboardSummaryQueryKey({ company_id: companyId || '' }) } }
  );

  const { data: accounts, isLoading: isLoadingAccounts } = useListSocialAccounts(
    { company_id: companyId || '' },
    { query: { enabled: !!companyId, queryKey: getListSocialAccountsQueryKey({ company_id: companyId || '' }) } }
  );

  // Mock chart data since the API doesn't return full timeseries in summary
  const mockChartData = [
    { date: 'Mon', instagram: 120, facebook: 80, tiktok: 200 },
    { date: 'Tue', instagram: 150, facebook: 90, tiktok: 250 },
    { date: 'Wed', instagram: 180, facebook: 100, tiktok: 300 },
    { date: 'Thu', instagram: 190, facebook: 110, tiktok: 280 },
    { date: 'Fri', instagram: 220, facebook: 120, tiktok: 400 },
    { date: 'Sat', instagram: 280, facebook: 140, tiktok: 450 },
    { date: 'Sun', instagram: 300, facebook: 150, tiktok: 500 },
  ];

  const StatCard = ({ title, value, change, icon: Icon, colorClass, isNegative = false }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
              {change && (
                <span className={`text-xs font-medium flex items-center ${isNegative ? 'text-destructive' : 'text-green-500'}`}>
                  {isNegative ? <ArrowDownRight className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                  {change}
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoadingSummary) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Here's your social performance at a glance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Followers" 
          value={summary?.totalFollowers?.toLocaleString() || '0'} 
          change={`+${summary?.weeklyChange?.followers || 0}%`}
          icon={Users}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <StatCard 
          title="Total Engagement" 
          value={summary?.totalEngagement?.toLocaleString() || '0'} 
          change={`+${summary?.weeklyChange?.engagement || 0}%`}
          icon={Activity}
          colorClass="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        />
        <StatCard 
          title="Total Posts" 
          value={summary?.totalPosts?.toLocaleString() || '0'} 
          change={`+${summary?.weeklyChange?.posts || 0}%`}
          icon={FileImage}
          colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
        />
        <StatCard 
          title="Avg Engagement Rate" 
          value={`${summary?.avgEngagementRate?.toFixed(1) || '0.0'}%`}
          icon={MousePointerClick}
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dx={-10} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="instagram" stroke="#E1306C" strokeWidth={2} dot={{ r: 4, fill: '#E1306C' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="facebook" stroke="#1877F2" strokeWidth={2} dot={{ r: 4, fill: '#1877F2' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="tiktok" stroke="#000000" strokeWidth={2} dot={{ r: 4, fill: '#000000' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-xl font-semibold tracking-tight mb-4">Recent Posts</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {summary?.recentPosts?.map((post: any) => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="flex items-start p-4 gap-4">
                    <div className="w-20 h-20 bg-muted rounded-md shrink-0 border flex items-center justify-center relative overflow-hidden">
                      {post.image_url ? (
                        <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                      ) : (
                        <FileImage className="w-6 h-6 text-muted-foreground/50" />
                      )}
                      <div className="absolute top-1 left-1 p-1 bg-background/80 backdrop-blur-sm rounded-sm">
                        {post.platform === 'instagram' && <SiInstagram className="w-3 h-3 text-[#E1306C]" />}
                        {post.platform === 'facebook' && <SiFacebook className="w-3 h-3 text-[#1877F2]" />}
                        {post.platform === 'tiktok' && <SiTiktok className="w-3 h-3 text-black" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="text-[10px]">
                          {post.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2 mt-2">{post.caption}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {(!summary?.recentPosts || summary.recentPosts.length === 0) && (
                <div className="col-span-2 text-center py-8 text-muted-foreground border rounded-lg bg-card border-dashed">
                  No recent posts found. Create one to get started!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-sidebar border-sidebar-border text-sidebar-foreground">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  AI Assistant
                </CardTitle>
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground border-none text-[10px] uppercase">Beta</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-sidebar-foreground/80">
                I can help you generate ideas, write captions, or analyze your performance. What would you like to do?
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="bg-transparent border-sidebar-foreground/20 hover:bg-sidebar-accent/10">
                  Generate Post Ideas
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent border-sidebar-foreground/20 hover:bg-sidebar-accent/10">
                  Suggest Hashtags
                </Button>
              </div>
              <div className="relative mt-4">
                <Input 
                  placeholder="Ask me anything..." 
                  className="bg-sidebar-foreground/5 border-sidebar-foreground/10 text-sidebar-foreground placeholder:text-sidebar-foreground/40 pr-10"
                />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/10">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase mb-3 px-1">Connected Accounts</h3>
            <div className="space-y-3">
              {['instagram', 'facebook', 'tiktok'].map(platform => {
                const account = accounts?.find((a: any) => a.platform === platform);
                const Icon = platform === 'instagram' ? SiInstagram : platform === 'facebook' ? SiFacebook : SiTiktok;
                const platformColor = platform === 'instagram' ? 'text-[#E1306C]' : platform === 'facebook' ? 'text-[#1877F2]' : 'text-black dark:text-white';
                
                return (
                  <Card key={platform}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md bg-muted ${platformColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{platform}</p>
                          <p className="text-xs text-muted-foreground">
                            {account?.connected ? `${account.followers?.toLocaleString() || 0} followers` : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={account?.connected ? 'default' : 'secondary'} className={account?.connected ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {account?.connected ? 'Connected' : 'Connect'}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
