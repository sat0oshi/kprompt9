import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit,
  LogOut,
  Tag,
  FileText,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  usePrompts,
  useTags,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
  useCreateTag,
  useDeleteTag,
  Prompt,
  Tag as TagType,
} from "@/hooks/usePrompts";
import { toast } from "@/hooks/use-toast";
import SeedDemoData from "@/components/SeedDemoData";
import ImageUpload from "@/components/ImageUpload";
const AdminDashboard = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: prompts, isLoading: promptsLoading, error: promptsError, refetch: refetchPrompts } = usePrompts();
  const { data: tags, isLoading: tagsLoading, error: tagsError, refetch: refetchTags } = useTags();
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const deletePrompt = useDeletePrompt();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();

  const [activeTab, setActiveTab] = useState<"prompts" | "tags">("prompts");
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  // Form states
  const [promptForm, setPromptForm] = useState({
    title: "",
    description: "",
    type: "Image" as "Vidéo" | "Image",
    style: "",
    prompt: "",
    is_nsfw: false,
    recommended_tool_name: "Nano Banana Pro",
    recommended_tool_url: "https://pim.ms/higgsfliedAI",
    images: [""],
    tag_ids: [] as string[],
  });

  const [tagForm, setTagForm] = useState({
    name: "",
    color: "secondary",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin/login");
    }
  }, [authLoading, user, navigate]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Show loading while data is being fetched
  if (promptsLoading || tagsLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement des données...</p>
      </div>
    );
  }

  // Show error state with retry
  if (promptsError || tagsError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Erreur de chargement</h1>
          <p className="text-muted-foreground mb-4">
            {promptsError?.message || tagsError?.message || "Impossible de charger les données"}
          </p>
          <button
            onClick={() => {
              refetchPrompts();
              refetchTags();
            }}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const resetPromptForm = () => {
    setPromptForm({
      title: "",
      description: "",
      type: "Image",
      style: "",
      prompt: "",
      is_nsfw: false,
      recommended_tool_name: "Nano Banana Pro",
      recommended_tool_url: "https://pim.ms/higgsfliedAI",
      images: [""],
      tag_ids: [],
    });
    setEditingPrompt(null);
  };

  const openEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setPromptForm({
      title: prompt.title,
      description: prompt.description,
      type: prompt.type,
      style: prompt.style,
      prompt: prompt.prompt,
      is_nsfw: prompt.is_nsfw,
      recommended_tool_name: prompt.recommended_tool_name || "Nano Banana Pro",
      recommended_tool_url: prompt.recommended_tool_url || "https://pim.ms/higgsfliedAI",
      images: prompt.prompt_images.map((img) => img.image_url),
      tag_ids: prompt.prompt_tags?.map((pt) => pt.tag_id) || [],
    });
    setShowPromptModal(true);
  };

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is allowed
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleSavePrompt = async () => {
    const validImages = promptForm.images.filter((img) => img.trim() !== "");

    if (!promptForm.title || !promptForm.style || !promptForm.prompt) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Validate image URLs
    for (const imgUrl of validImages) {
      if (!isValidUrl(imgUrl)) {
        toast({
          title: "Erreur",
          description: "Une ou plusieurs URLs d'images sont invalides",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate recommended tool URL
    if (promptForm.recommended_tool_url && !isValidUrl(promptForm.recommended_tool_url)) {
      toast({
        title: "Erreur",
        description: "L'URL de l'outil recommandé est invalide",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingPrompt) {
        await updatePrompt.mutateAsync({
          id: editingPrompt.id,
          ...promptForm,
          images: validImages,
          tag_ids: promptForm.tag_ids,
        });
        toast({ title: "Prompt mise à jour" });
      } else {
        await createPrompt.mutateAsync({
          ...promptForm,
          images: validImages,
          tag_ids: promptForm.tag_ids,
        });
        toast({ title: "Prompt créée" });
      }
      setShowPromptModal(false);
      resetPromptForm();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (confirm("Supprimer cette prompt ?")) {
      await deletePrompt.mutateAsync(id);
      toast({ title: "Prompt supprimée" });
    }
  };

  const handleCreateTag = async () => {
    if (!tagForm.name) {
      toast({
        title: "Erreur",
        description: "Le nom du tag est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTag.mutateAsync(tagForm);
      toast({ title: "Tag créé" });
      setShowTagModal(false);
      setTagForm({ name: "", color: "secondary" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Ce tag existe déjà",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (confirm("Supprimer ce tag ?")) {
      await deleteTag.mutateAsync(id);
      toast({ title: "Tag supprimé" });
    }
  };

  const addImageField = () => {
    setPromptForm({ ...promptForm, images: [...promptForm.images, ""] });
  };

  const removeImageField = (index: number) => {
    const newImages = promptForm.images.filter((_, i) => i !== index);
    setPromptForm({ ...promptForm, images: newImages.length ? newImages : [""] });
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...promptForm.images];
    newImages[index] = value;
    setPromptForm({ ...promptForm, images: newImages });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin K Prompt
          </h1>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Voir le site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("prompts")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "prompts"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            <FileText className="w-5 h-5" />
            Prompts ({prompts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "tags"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            <Tag className="w-5 h-5" />
            Tags ({tags?.length || 0})
          </button>
        </div>

        {/* Content */}
        {activeTab === "prompts" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Gestion des Prompts
              </h2>
              <button
                onClick={() => {
                  resetPromptForm();
                  setShowPromptModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nouvelle Prompt
              </button>
            </div>

            <div className="grid gap-4">
              {[...(prompts || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((prompt) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card-premium p-4 rounded-xl flex items-center gap-4"
                >
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0 group/preview">
                    {prompt.prompt_images[0] && (
                      (() => {
                        const url = prompt.prompt_images[0].image_url;
                        const isVideo = ['.mp4', '.webm', '.mov', '.avi', '.mkv'].some(ext => 
                          url.toLowerCase().includes(ext)
                        );
                        return isVideo ? (
                          <video
                            src={url}
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          />
                        ) : (
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        );
                      })()
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {prompt.title}
                      </h3>
                      {prompt.is_nsfw && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/15 text-red-400">
                          NSFW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {prompt.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                        {prompt.type}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                        {prompt.style}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {prompt.prompt_images.length} image(s)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditPrompt(prompt)}
                      className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {prompts?.length === 0 && (
                <SeedDemoData />
              )}
            </div>
          </div>
        )}

        {activeTab === "tags" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Gestion des Tags
              </h2>
              <button
                onClick={() => setShowTagModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nouveau Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {tags?.map((tag) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    tag.color === "destructive"
                      ? "bg-red-500/15 text-red-400 border border-red-500/30"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <span className="font-medium">{tag.name}</span>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="p-1 rounded-full hover:bg-background/50 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}

              {tags?.length === 0 && (
                <div className="text-muted-foreground">
                  Aucun tag pour le moment
                </div>
              )}
            </div>
          </div>
        )}

        
      </div>

      {/* Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPromptModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">
                {editingPrompt ? "Modifier la Prompt" : "Nouvelle Prompt"}
              </h3>
              <button
                onClick={() => setShowPromptModal(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={promptForm.title}
                    onChange={(e) =>
                      setPromptForm({ ...promptForm, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type *
                  </label>
                  <select
                    value={promptForm.type}
                    onChange={(e) =>
                      setPromptForm({
                        ...promptForm,
                        type: e.target.value as "Vidéo" | "Image",
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="Image">Image</option>
                    <option value="Vidéo">Vidéo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={promptForm.description}
                  onChange={(e) =>
                    setPromptForm({ ...promptForm, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Style principal *
                </label>
                <input
                  type="text"
                  value={promptForm.style}
                  onChange={(e) =>
                    setPromptForm({ ...promptForm, style: e.target.value })
                  }
                  placeholder="Ex: Cinématique, Portrait, Abstrait..."
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (sélection multiple)
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-secondary border border-border min-h-[50px]">
                  {tags?.map((tag) => {
                    const isSelected = promptForm.tag_ids.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setPromptForm({
                              ...promptForm,
                              tag_ids: promptForm.tag_ids.filter((id) => id !== tag.id),
                            });
                          } else {
                            setPromptForm({
                              ...promptForm,
                              tag_ids: [...promptForm.tag_ids, tag.id],
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? tag.color === "destructive"
                              ? "bg-red-500/30 text-red-300 border border-red-500/50"
                              : "bg-primary/30 text-primary border border-primary/50"
                            : tag.color === "destructive"
                              ? "bg-red-500/10 text-red-400/70 border border-red-500/20 hover:bg-red-500/20"
                              : "bg-secondary text-muted-foreground border border-border hover:bg-secondary/80"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                  {(!tags || tags.length === 0) && (
                    <span className="text-muted-foreground text-sm">Aucun tag disponible</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_nsfw"
                  checked={promptForm.is_nsfw}
                  onChange={(e) =>
                    setPromptForm({ ...promptForm, is_nsfw: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-border bg-secondary"
                />
                <label htmlFor="is_nsfw" className="text-sm text-foreground">
                  Contenu NSFW (flou par défaut)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Prompt *
                </label>
                <textarea
                  value={promptForm.prompt}
                  onChange={(e) =>
                    setPromptForm({ ...promptForm, prompt: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary transition-colors resize-none font-mono text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    Images (URLs)
                  </label>
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    + Ajouter une image/vidéo
                  </button>
                </div>
                <div className="space-y-4">
                  {promptForm.images.map((img, index) => (
                    <ImageUpload
                      key={index}
                      index={index}
                      value={img}
                      onChange={(url) => updateImageField(index, url)}
                      onRemove={() => removeImageField(index)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Outil recommandé (nom)
                  </label>
                  <input
                    type="text"
                    value={promptForm.recommended_tool_name}
                    onChange={(e) =>
                      setPromptForm({
                        ...promptForm,
                        recommended_tool_name: e.target.value,
                      })
                    }
                    placeholder="Midjourney"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Outil recommandé (URL)
                  </label>
                  <input
                    type="url"
                    value={promptForm.recommended_tool_url}
                    onChange={(e) =>
                      setPromptForm({
                        ...promptForm,
                        recommended_tool_url: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-6 py-3 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePrompt}
                disabled={createPrompt.isPending || updatePrompt.isPending}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {(createPrompt.isPending || updatePrompt.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editingPrompt ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowTagModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">
                Nouveau Tag
              </h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nom du tag *
                </label>
                <input
                  type="text"
                  value={tagForm.name}
                  onChange={(e) =>
                    setTagForm({ ...tagForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Couleur
                </label>
                <select
                  value={tagForm.color}
                  onChange={(e) =>
                    setTagForm({ ...tagForm, color: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="secondary">Standard</option>
                  <option value="destructive">Rouge (NSFW)</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-6 py-3 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTag}
                disabled={createTag.isPending}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {createTag.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Créer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
