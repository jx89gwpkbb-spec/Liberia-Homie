"use client";
import { useState } from 'react';
import { generatePropertyDescription, GeneratePropertyDescriptionInput } from '@/ai/flows/generate-property-description';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DescriptionGeneratorProps = {
    getFormData: () => Omit<GeneratePropertyDescriptionInput, 'price'> & { price: string };
    onDescriptionGenerated: (description: string) => void;
};

export function DescriptionGenerator({ getFormData, onDescriptionGenerated }: DescriptionGeneratorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const formData = getFormData();
            if (!formData.keyFeatures || !formData.propertyType || !formData.location || !formData.price || !formData.stayDuration) {
                toast({
                    title: "Missing Information",
                    description: "Please fill out all fields before generating a description.",
                    variant: "destructive",
                });
                return;
            }

            const price = parseFloat(formData.price);

            if (isNaN(price)) {
                toast({
                    title: "Invalid Price",
                    description: "Please enter a valid number for the price.",
                    variant: "destructive",
                });
                return;
            }

            const input: GeneratePropertyDescriptionInput = {
                ...formData,
                price: price,
            };
            
            const result = await generatePropertyDescription(input);
            if (result.description) {
                onDescriptionGenerated(result.description);
                toast({
                    title: "Description Generated",
                    description: "The AI has generated a property description for you.",
                });
            }
        } catch (error) {
            console.error("Failed to generate description:", error);
            toast({
                title: "Generation Failed",
                description: "Could not generate description. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button type="button" variant="outline" size="sm" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate with AI
                </>
            )}
        </Button>
    );
}
