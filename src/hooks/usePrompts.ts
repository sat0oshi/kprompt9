import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const QUERY_TIMEOUT_MS = 10000; // 10 seconds

export interface PromptImage {
  id: string;
  prompt_id: string;
  image_url: string;
  display_order: number;
}

export interface PromptTag {
  id: string;
  prompt_id: string;
  tag_id: string;
  tag?: Tag;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  type: "Vidéo" | "Image";
  style: string;
  prompt: string;
  is_nsfw: boolean;
  recommended_tool_name: string | null;
  recommended_tool_url: string | null;
  created_at: string;
  updated_at: string;
  prompt_images: PromptImage[];
  prompt_tags: PromptTag[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

// Custom error class for better error handling
export class DataFetchError extends Error {
  public readonly type: "timeout" | "network" | "backend";
  public readonly status?: number;

  constructor(type: "timeout" | "network" | "backend", message: string, status?: number) {
    super(message);
    this.name = "DataFetchError";
    this.type = type;
    this.status = status;
  }
}

// Helper to add timeout to any promise
const withTimeout = <T>(promise: PromiseLike<T>, ms: number): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new DataFetchError("timeout", `Délai d'attente dépassé (${ms / 1000}s)`)), ms)
    ),
  ]);
};

// Fetch all prompts with their images and tags (single optimized query)
export const usePrompts = () => {
  return useQuery({
    queryKey: ["prompts"],
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    queryFn: async () => {
      try {
        const result = await withTimeout(
          supabase
            .from("prompts")
            .select(`
              *,
              prompt_images(*),
              prompt_tags(*, tags(*))
            `)
            .order("created_at", { ascending: false }),
          QUERY_TIMEOUT_MS
        );

        if (result.error) {
          console.error("[data] usePrompts backend error:", result.error);
          throw new DataFetchError("backend", result.error.message, result.error.code ? parseInt(result.error.code) : undefined);
        }

        const promptsWithData = result.data.map((prompt: any) => ({
          ...prompt,
          prompt_images: (prompt.prompt_images || []).sort(
            (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
          ),
          prompt_tags: (prompt.prompt_tags || []).map((pt: any) => ({
            ...pt,
            tag: pt.tags,
          })),
        })) as Prompt[];

        return promptsWithData;
      } catch (error) {
        if (error instanceof DataFetchError) {
          console.error(`[data] usePrompts failed (${error.type}):`, error.message);
          throw error;
        }
        if (error instanceof TypeError) {
          console.error("[data] usePrompts network error:", error.message);
          throw new DataFetchError("network", "Erreur réseau - vérifiez votre connexion");
        }
        console.error("[data] usePrompts unknown error:", error);
        throw new DataFetchError("backend", error instanceof Error ? error.message : "Erreur inconnue");
      }
    },
  });
};

// Fetch all tags
export const useTags = () => {
  return useQuery({
    queryKey: ["tags"],
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    queryFn: async () => {
      try {
        const tagsPromise = supabase
          .from("tags")
          .select("*")
          .order("name", { ascending: true });

        const result = await withTimeout(tagsPromise, QUERY_TIMEOUT_MS);

        if (result.error) {
          console.error("[data] useTags backend error:", result.error);
          throw new DataFetchError("backend", result.error.message, result.error.code ? parseInt(result.error.code) : undefined);
        }
        return result.data as Tag[];
      } catch (error) {
        if (error instanceof DataFetchError) {
          console.error(`[data] useTags failed (${error.type}):`, error.message);
          throw error;
        }
        if (error instanceof TypeError) {
          console.error("[data] useTags network error:", error.message);
          throw new DataFetchError("network", "Erreur réseau - vérifiez votre connexion");
        }
        console.error("[data] useTags unknown error:", error);
        throw new DataFetchError("backend", error instanceof Error ? error.message : "Erreur inconnue");
      }
    },
  });
};

// Create prompt mutation
export const useCreatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      type: string;
      style: string;
      prompt: string;
      is_nsfw: boolean;
      recommended_tool_name?: string;
      recommended_tool_url?: string;
      images: string[];
      tag_ids?: string[];
    }) => {
      // Insert prompt
      const { data: newPrompt, error: promptError } = await supabase
        .from("prompts")
        .insert({
          title: data.title,
          description: data.description,
          type: data.type,
          style: data.style,
          prompt: data.prompt,
          is_nsfw: data.is_nsfw,
          recommended_tool_name: data.recommended_tool_name || null,
          recommended_tool_url: data.recommended_tool_url || null,
        })
        .select()
        .single();

      if (promptError) throw promptError;

      // Insert images
      if (data.images.length > 0) {
        const imagesToInsert = data.images.map((url, index) => ({
          prompt_id: newPrompt.id,
          image_url: url,
          display_order: index,
        }));

        const { error: imagesError } = await supabase
          .from("prompt_images")
          .insert(imagesToInsert);

        if (imagesError) throw imagesError;
      }

      // Insert prompt tags
      if (data.tag_ids && data.tag_ids.length > 0) {
        const tagsToInsert = data.tag_ids.map((tagId) => ({
          prompt_id: newPrompt.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from("prompt_tags")
          .insert(tagsToInsert);

        if (tagsError) throw tagsError;
      }

      return newPrompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
};

// Update prompt mutation
export const useUpdatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      title: string;
      description: string;
      type: string;
      style: string;
      prompt: string;
      is_nsfw: boolean;
      recommended_tool_name?: string;
      recommended_tool_url?: string;
      images: string[];
      tag_ids?: string[];
    }) => {
      // Update prompt
      const { error: promptError } = await supabase
        .from("prompts")
        .update({
          title: data.title,
          description: data.description,
          type: data.type,
          style: data.style,
          prompt: data.prompt,
          is_nsfw: data.is_nsfw,
          recommended_tool_name: data.recommended_tool_name || null,
          recommended_tool_url: data.recommended_tool_url || null,
        })
        .eq("id", data.id);

      if (promptError) throw promptError;

      // Delete existing images
      await supabase.from("prompt_images").delete().eq("prompt_id", data.id);

      // Insert new images
      if (data.images.length > 0) {
        const imagesToInsert = data.images.map((url, index) => ({
          prompt_id: data.id,
          image_url: url,
          display_order: index,
        }));

        const { error: imagesError } = await supabase
          .from("prompt_images")
          .insert(imagesToInsert);

        if (imagesError) throw imagesError;
      }

      // Delete existing prompt tags
      await supabase.from("prompt_tags").delete().eq("prompt_id", data.id);

      // Insert new prompt tags
      if (data.tag_ids && data.tag_ids.length > 0) {
        const tagsToInsert = data.tag_ids.map((tagId) => ({
          prompt_id: data.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from("prompt_tags")
          .insert(tagsToInsert);

        if (tagsError) throw tagsError;
      }

      return data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
};

// Delete prompt mutation
export const useDeletePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prompts").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
};

// Create tag mutation
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const { data: newTag, error } = await supabase
        .from("tags")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return newTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

// Delete tag mutation
export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

