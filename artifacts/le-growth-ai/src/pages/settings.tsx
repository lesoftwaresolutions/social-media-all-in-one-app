import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUpdateCompany, useUpdateProfile } from '@workspace/api-client-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from 'lucide-react';

const companySchema = z.object({
  company_name: z.string().min(2),
  website: z.string().url().or(z.literal('')),
  industry: z.string(),
  location: z.string(),
});

const profileSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
});

const passwordSchema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Settings() {
  const { company, profile, companyId, user } = useAuth();
  const { toast } = useToast();

  const updateCompany = useUpdateCompany();
  const updateProfile = useUpdateProfile();

  const companyForm = useForm({
    resolver: zodResolver(companySchema),
    values: {
      company_name: company?.company_name || '',
      website: company?.website || '',
      industry: company?.industry || '',
      location: company?.location || '',
    }
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name || '',
      email: user?.email || '',
    }
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });

  const onCompanySubmit = (data: any) => {
    if (!companyId) return;
    updateCompany.mutate({ id: companyId, data }, {
      onSuccess: () => toast({ title: 'Company profile updated' })
    });
  };

  const onProfileSubmit = (data: any) => {
    if (!profile?.id) return;
    updateProfile.mutate({ id: profile.id, data: { full_name: data.full_name } }, {
      onSuccess: () => toast({ title: 'Personal profile updated' })
    });
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      toast({ title: 'Password updated successfully' });
      passwordForm.reset();
    } catch (err: any) {
      toast({ title: 'Error updating password', description: err.message, variant: 'destructive' });
    }
  };

  if (!company || !profile) return <div className="p-8"><Skeleton className="h-[400px] w-full max-w-3xl" /></div>;

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your business details used by the AI generator.</CardDescription>
            </CardHeader>
            <Form {...companyForm}>
              <form onSubmit={companyForm.handleSubmit(onCompanySubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={companyForm.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={companyForm.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6 bg-muted/20">
                  <Button type="submit" disabled={updateCompany.isPending}>Save Changes</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input disabled {...field} /></FormControl>
                        <p className="text-[10px] text-muted-foreground mt-1">Contact support to change your email.</p>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="border-t pt-6 bg-muted/20">
                  <Button type="submit" disabled={updateProfile.isPending}>Save Profile</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="border-t pt-6 bg-muted/20">
                  <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Update Password</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage who has access to this workspace.</CardDescription>
              </div>
              <Button size="sm">Invite Member</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {profile.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Badge>Owner</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
