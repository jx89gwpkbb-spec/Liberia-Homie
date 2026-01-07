import { reviews } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DetailedRating } from "@/lib/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? "text-primary fill-current" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

const ratingCategories: { key: keyof DetailedRating, label: string }[] = [
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'checkIn', label: 'Check-in' },
    { key: 'communication', label: 'Communication' },
    { key: 'location', label: 'Location' },
    { key: 'value', label: 'Value' },
];

export function ReviewSection({ propertyId }: { propertyId: string }) {
  const propertyReviews = reviews.filter((r) => r.propertyId === propertyId);

  if (propertyReviews.length === 0) {
    return null;
  }
  
  const averageRatings = propertyReviews.reduce((acc, review) => {
    if (review.detailedRatings) {
        Object.entries(review.detailedRatings).forEach(([key, value]) => {
            acc[key as keyof DetailedRating] = (acc[key as keyof DetailedRating] || 0) + value;
        });
    }
    return acc;
  }, {} as Partial<Record<keyof DetailedRating, number>>);

  Object.keys(averageRatings).forEach(key => {
      averageRatings[key as keyof DetailedRating]! /= propertyReviews.length;
  });
  
  const overallAverage = Object.values(averageRatings).reduce((sum, val) => sum + val, 0) / Object.keys(averageRatings).length;


  return (
    <div className="py-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-primary fill-current" />
        {overallAverage.toFixed(1)} · {propertyReviews.length} reviews
      </h3>
      
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 my-8">
        {ratingCategories.map(({ key, label }) => (
            <div key={key} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <p>{label}</p>
                    <p>{averageRatings[key]?.toFixed(1) || 'N/A'}</p>
                </div>
                <Progress value={(averageRatings[key] || 0) * 20} className="h-1.5" />
            </div>
        ))}
      </div>

      <div className="space-y-8">
        {propertyReviews.map((review) => (
          <div key={review.id} className="flex flex-col sm:flex-row gap-4">
            <Avatar>
              <AvatarImage src={review.user.avatar} alt={review.user.name} data-ai-hint="person portrait" />
              <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{review.user.name}</p>
              </div>
               <div className="flex items-center gap-2 mt-1">
                 <StarRating rating={review.rating} />
                 <p className="text-xs text-muted-foreground ml-2">{new Date(review.createdAt).toLocaleDateString()}</p>
               </div>
              <p className="mt-2 text-muted-foreground text-sm">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
