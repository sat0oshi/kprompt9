import { useState } from "react";
import { Database, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const DEMO_TAGS = [
  { name: "Cinématique", color: "secondary" },
  { name: "Trend", color: "secondary" },
  { name: "Viral", color: "secondary" },
  { name: "Produit", color: "secondary" },
  { name: "NSFW", color: "destructive" },
];

const DEMO_PROMPTS = [
  {
    title: "Cyberpunk City",
    description: "Une ville futuriste aux néons vibrants",
    type: "Image",
    style: "Cyberpunk",
    prompt: "A sprawling cyberpunk megacity at night, neon signs in Japanese and English, flying cars, rain-soaked streets reflecting colorful lights, towering skyscrapers with holographic advertisements, cinematic lighting, hyper-detailed, 8k resolution",
    is_nsfw: false,
  },
  {
    title: "Portrait Cinématique",
    description: "Portrait dramatique style Hollywood",
    type: "Image",
    style: "Cinématique",
    prompt: "Cinematic portrait of a mysterious person, dramatic side lighting, shallow depth of field, film grain, moody atmosphere, professional photography, shot on ARRI Alexa, 35mm lens, golden hour lighting",
    is_nsfw: false,
  },
  {
    title: "Paysage Fantasy",
    description: "Un monde fantastique épique",
    type: "Image",
    style: "Fantasy",
    prompt: "Epic fantasy landscape with floating islands, ancient castles, magical waterfalls cascading into clouds, dragons flying in the distance, golden sunset, volumetric lighting, matte painting style, concept art quality",
    is_nsfw: false,
  },
];

const SeedDemoData = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const queryClient = useQueryClient();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      // Check if tags exist, if not create them
      const { data: existingTags } = await supabase.from("tags").select("name");
      const existingTagNames = existingTags?.map(t => t.name) || [];
      
      const tagsToInsert = DEMO_TAGS.filter(t => !existingTagNames.includes(t.name));
      if (tagsToInsert.length > 0) {
        const { error: tagsError } = await supabase.from("tags").insert(tagsToInsert);
        if (tagsError) throw tagsError;
      }

      // Insert demo prompts
      const { error: promptsError } = await supabase.from("prompts").insert(DEMO_PROMPTS);
      if (promptsError) throw promptsError;

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["prompts"] });
      await queryClient.invalidateQueries({ queryKey: ["tags"] });

      setSeeded(true);
      toast({
        title: "Données de démo créées",
        description: `${DEMO_PROMPTS.length} prompts et ${tagsToInsert.length} tags ajoutés`,
      });
    } catch (error) {
      console.error("Seed error:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer les données de démo",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (seeded) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
          <p className="text-foreground font-medium">Données de démo créées !</p>
          <p className="text-sm text-muted-foreground">
            Rechargez la page pour les voir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-secondary">
          <Database className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-foreground font-medium mb-1">Aucune prompt pour le moment</p>
          <p className="text-sm text-muted-foreground">
            Créez des données de démo pour commencer.
          </p>
        </div>
        <button
          onClick={handleSeedData}
          disabled={isSeeding}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSeeding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              Créer des données de démo
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SeedDemoData;
