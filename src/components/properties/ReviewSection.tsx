import { reviews } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Review } from "@/lib/types";

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

const ratingCategories = [
    { id: 'cleanliness', label: 'Cleanliness' },
    { id: 'communication', label: 'Communication' },
    { id: 'checkIn', label: 'Check-in' },
    { id: 'accuracy', label: 'Accuracy' },
    { id: 'location', label: 'Location' },
    { id: 'value', label: 'Value' },
];

export function ReviewSection({ propertyId }: { propertyId: string }) {
  const propertyReviews = reviews.filter((r) => r.propertyId === propertyId);

  if (propertyReviews.length === 0) {
    return (
      <div className="py-8">
        <h3 className="text-xl font-semibold mb-4">No reviews yet</h3>
        <p className="text-muted-foreground">Be the first to review this property!</p>
      </div>
    );
  }

  const averageRatings = ratingCategories.reduce((acc, category) => {
    const total = propertyReviews.reduce((sum, review) => sum + (review[category.id as keyof Review] as number || 0), 0);
    acc[category.id] = total / propertyReviews.length;
    return acc;
  }, {} as Record<string, number>);

  const overallAverage = Object.values(averageRatings).reduce((sum, rating) => sum + rating, 0) / ratingCategories.length;

  return (
    <div className="py-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-primary fill-current" />
        {overallAverage.toFixed(1)} · {propertyReviews.length} reviews
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
          {ratingCategories.map(category => (
              <div key={category.id} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium">{category.label}</span>
                      <span className="text-sm font-medium">{averageRatings[category.id].toFixed(1)}</span>
                  </div>
                  <Progress value={averageRatings[category.id] * 20} className="h-1.5" />
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
                <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
              <StarRating rating={review.rating} />
              <p className="mt-2 text-muted-foreground text-sm">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

