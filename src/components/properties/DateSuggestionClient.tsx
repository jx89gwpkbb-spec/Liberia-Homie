"use client";

import { useState } from 'react';
import { suggestOptimalStayDates, SuggestOptimalStayDatesOutput } from '@/ai/flows/suggest-optimal-stay-dates';
import type { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-radix';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';

type DateSuggestionClientProps = {
    property: Property;
    onDateSelect: (range: DateRange) => void;
};

export function DateSuggestionClient({ property, onDateSelect }: DateSuggestionClientProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<SuggestOptimalStayDatesOutput | null>(null);
    const { toast } = useToast();

    const handleSuggestDates = async () => {
        setIsLoading(true);
        setSuggestion(null);
        try {
            const result = await suggestOptimalStayDates({
                location: property.location,
                stayDurationPreference: property.longStay ? 'month' : 'week',
                purposeOfStay: 'vacation',
                budget: property.pricePerNight * (property.longStay ? 30 : 7),
            });
            setSuggestion(result);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to suggest dates. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectDate = (startDate: string) => {
        const from = new Date(startDate);
        const to = addDays(from, property.longStay ? 30 : 7);
        onDateSelect({ from, to });
    };

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger asChild>
                    <Button variant="outline" className="w-full" onClick={handleSuggestDates} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Suggesting Dates...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Get AI Date Suggestions
                            </>
                        )}
                    </Button>
                </AccordionTrigger>
                <AccordionContent>
                    {suggestion && (
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestion.suggestedDates.map(date => (
                                    <Button key={date} variant="secondary" size="sm" onClick={() => handleSelectDate(date)}>
                                        {format(new Date(date), 'LLL dd')}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
