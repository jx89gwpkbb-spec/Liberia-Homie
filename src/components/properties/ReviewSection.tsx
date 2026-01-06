import { reviews } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${i < rating ? "text-primary fill-current" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}


export function ReviewSection({ propertyId }: { propertyId: string }) {
  const propertyReviews = reviews.filter((r) => r.propertyId === propertyId);

  if (propertyReviews.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h3 className="text-xl font-semibold mb-4">Reviews</h3>
      <div className="space-y-6">
        {propertyReviews.map((review) => (
          <div key={review.id} className="flex gap-4">
            <Avatar>
              <AvatarImage src={review.user.avatar} alt={review.user.name} data-ai-hint="person portrait" />
              <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{review.user.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
              <StarRating rating={review.rating} />
              <p className="mt-2 text-muted-foreground">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
