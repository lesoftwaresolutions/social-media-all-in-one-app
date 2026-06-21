import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '£49',
    description: 'Perfect for small local businesses starting out.',
    features: [
      '1 Social Account per platform',
      '30 AI-generated posts per month',
      'Basic analytics',
      'Email support'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '£99',
    popular: true,
    description: 'For growing businesses that need more content.',
    features: [
      '3 Social Accounts per platform',
      'Unlimited AI content generation',
      'Advanced analytics & reporting',
      'Priority support',
      'Content Calendar'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '£149',
    description: 'For agencies or multi-location businesses.',
    features: [
      '10 Social Accounts per platform',
      'Unlimited AI generation',
      'Competitor tracking',
      'White-label reports',
      'Custom branding'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '£299',
    description: 'Custom solutions for large organizations.',
    features: [
      'Unlimited Social Accounts',
      'Dedicated account manager',
      'API Access',
      'SSO & SAML',
      'Custom integrations'
    ]
  }
];

export default function Billing() {
  const { company } = useAuth();
  const currentPlan = company?.plan || 'starter';

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Plans & Pricing</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Simple, transparent pricing that grows with your business. All plans include a 14-day free trial.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          
          return (
            <Card key={plan.id} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-[1.02]' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 -mt-3 flex justify-center">
                  <Badge className="bg-primary hover:bg-primary uppercase tracking-wider text-[10px] font-bold">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                  {plan.price}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex gap-3">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isCurrent ? "outline" : (plan.popular ? "default" : "secondary")}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground pt-8 border-t">
        Secure payments powered by Stripe. You can cancel your subscription at any time.
      </div>
    </div>
  );
}
