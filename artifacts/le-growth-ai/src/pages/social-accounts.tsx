import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SiInstagram, SiFacebook, SiTiktok } from 'react-icons/si';
import { CheckCircle2, Link2, Unlink } from 'lucide-react';
import { 
  useListSocialAccounts, 
  getListSocialAccountsQueryKey,
  useCreateSocialAccount,
  useUpdateSocialAccount
} from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: SiInstagram, color: 'text-[#E1306C]', bg: 'bg-[#E1306C]/10' },
  { id: 'facebook', name: 'Facebook', icon: SiFacebook, color: 'text-[#1877F2]', bg: 'bg-[#1877F2]/10' },
  { id: 'tiktok', name: 'TikTok', icon: SiTiktok, color: 'text-black dark:text-white', bg: 'bg-black/10 dark:bg-white/10' },
];

export default function SocialAccounts() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: accounts, isLoading } = useListSocialAccounts(
    { company_id: companyId || '' },
    { query: { enabled: !!companyId, queryKey: getListSocialAccountsQueryKey({ company_id: companyId || '' }) } }
  );

  const createAccount = useCreateSocialAccount();
  const updateAccount = useUpdateSocialAccount();

  const handleToggleConnection = (platformId: string, currentAccount: any) => {
    if (!companyId) return;

    if (currentAccount) {
      // Disconnect
      updateAccount.mutate({
        id: currentAccount.id,
        data: { connected: false }
      }, {
        onSuccess: () => {
          toast({ title: `${platformId} disconnected` });
          queryClient.invalidateQueries({ queryKey: getListSocialAccountsQueryKey({ company_id: companyId }) });
        }
      });
    } else {
      // Connect (create new if doesn't exist)
      createAccount.mutate({
        data: {
          company_id: companyId,
          platform: platformId as any,
          connected: true,
          followers: 0,
        }
      }, {
        onSuccess: () => {
          toast({ title: `${platformId} connected successfully!` });
          queryClient.invalidateQueries({ queryKey: getListSocialAccountsQueryKey({ company_id: companyId }) });
        }
      });
    }
  };

  const handleFollowerUpdate = (id: string, followers: number) => {
    updateAccount.mutate({
      id,
      data: { followers }
    }, {
      onSuccess: () => {
        toast({ title: "Followers updated" });
        queryClient.invalidateQueries({ queryKey: getListSocialAccountsQueryKey({ company_id: companyId! }) });
      }
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Accounts</h1>
        <p className="text-muted-foreground mt-1">Connect and manage your social media profiles.</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {PLATFORMS.map((platform) => {
          const account = accounts?.find(a => a.platform === platform.id);
          const isConnected = account?.connected;
          const Icon = platform.icon;
          
          return (
            <Card key={platform.id} className={`overflow-hidden transition-all ${isConnected ? 'border-primary/50 shadow-md' : 'opacity-80'}`}>
              <CardHeader className={`${platform.bg} border-b`}>
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl bg-white shadow-sm ${platform.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <Badge variant={isConnected ? 'default' : 'secondary'} className={isConnected ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-4 capitalize">{platform.name}</CardTitle>
                <CardDescription>
                  {isConnected ? `Connected on ${new Date(account?.created_at || '').toLocaleDateString()}` : `Connect your ${platform.name} account to enable scheduling and analytics.`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : isConnected ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Username</label>
                      <Input defaultValue={account?.username || ''} placeholder="@username" />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-sm font-medium text-muted-foreground">Follower Count</label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          defaultValue={account?.followers || 0} 
                          id={`followers-${account.id}`}
                        />
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            const val = (document.getElementById(`followers-${account.id}`) as HTMLInputElement).value;
                            handleFollowerUpdate(account.id, parseInt(val, 10));
                          }}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground mb-4">You need to connect this account to start posting and tracking analytics.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 border-t">
                <Button 
                  variant={isConnected ? "outline" : "default"} 
                  className="w-full"
                  onClick={() => handleToggleConnection(platform.id, account)}
                  disabled={isLoading || createAccount.isPending || updateAccount.isPending}
                >
                  {isConnected ? (
                    <><Unlink className="w-4 h-4 mr-2" /> Disconnect</>
                  ) : (
                    <><Link2 className="w-4 h-4 mr-2" /> Connect {platform.name}</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
