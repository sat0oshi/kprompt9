-- Ajouter la colonne likes à la table prompts
ALTER TABLE public.prompts 
ADD COLUMN likes INTEGER NOT NULL DEFAULT 0;

-- Créer la fonction RPC pour incrémenter les likes de manière atomique
CREATE OR REPLACE FUNCTION public.increment_prompt_likes(prompt_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE prompts 
  SET likes = likes + 1 
  WHERE id = prompt_id
  RETURNING likes INTO new_likes;
  RETURN new_likes;
END;
$$;