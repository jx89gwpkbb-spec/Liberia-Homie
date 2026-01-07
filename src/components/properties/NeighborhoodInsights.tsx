'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getNeighborhoodInsights,
  NeighborhoodInsightsOutput,
} from '@/ai/flows/neighborhood-insights';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Wand2,
  School,
  Hospital,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function NeighborhoodInsights({ location }: { location: string }) {
  const [insights, setInsights] =
    useState<NeighborhoodInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setInsights(null);
    try {
      const result = await getNeighborhoodInsights({ location });
      setInsights(result);
    } catch (error) {
      console.error('Failed to get neighborhood insights:', error);
      toast({
        title: 'Error',
        description: 'Could not generate neighborhood insights.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 border-b">
      <h3 className="text-xl font-semibold mb-4">Neighborhood Insights</h3>
      {!insights && !isLoading && (
        <div className="flex flex-col items-start gap-4 rounded-lg border p-6">
          <p className="text-muted-foreground">
            Want to know more about the area? Get AI-powered insights into
            local schools, hospitals, safety, and commute times.
          </p>
          <Button onClick={handleGenerateInsights} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate Insights
          </Button>
        </div>
      )}

      {isLoading && <InsightsSkeleton />}

      {insights && (
        <div>
          <p className="mb-6 text-muted-foreground">{insights.summary}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InsightCard
              icon={ShieldAlert}
              title="Crime Rate"
              value={insights.crimeRate}
            />
            <InsightCard
              icon={Clock}
              title="Commute Times"
              value={insights.commuteTimes}
            />
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                Nearby Schools
              </h4>
              <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                {insights.schools.map((school, i) => (
                  <li key={i}>{school}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Hospital className="h-5 w-5 text-primary" />
                Nearby Hospitals
              </h4>
              <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                {insights.hospitals.map((hospital, i) => (
                  <li key={i}>{hospital}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h4>
      <p className="text-muted-foreground text-sm">{value}</p>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-3/4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    </div>
  );
}
