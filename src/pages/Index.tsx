import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import MatrixRain from "@/components/MatrixRain";
import SearchBar from "@/components/SearchBar";
import FilterPills from "@/components/FilterPills";
import PromptCard from "@/components/PromptCard";
import PromptModal from "@/components/PromptModal";
import StickyFooter from "@/components/StickyFooter";
import GlitchTitle from "@/components/GlitchTitle";
import SortToggle, { SortMode } from "@/components/SortToggle";
import { usePrompts, useTags, Prompt, DataFetchError } from "@/hooks/usePrompts";
import { Loader2, Settings, RefreshCw, AlertCircle, CheckCircle2, WifiOff, Image as ImageIcon, Play } from "lucide-react";
import { Link } from "react-router-dom";

const LOADING_TIMEOUT_MS = 12000;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    type: string | null;
    style: string | null;
  }>({
    type: "Image",
    style: null
  });
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  const {
    data: prompts,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = usePrompts();
  const {
    data: tags,
    isError: tagsError
  } = useTags();

  // Fallback: if loading takes too long, show error state
  useEffect(() => {
    if (isLoading && !isError) {
      const timer = setTimeout(() => {
        setLoadingTooLong(true);
      }, LOADING_TIMEOUT_MS);
      return () => clearTimeout(timer);
    } else {
      setLoadingTooLong(false);
    }
  }, [isLoading, isError]);

  const handleFilterChange = (category: "type" | "style", value: string | null) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: value
    }));
  };

  const filteredPrompts = useMemo(() => {
    if (!prompts) return [];
    const filtered = prompts.filter((prompt) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = prompt.title.toLowerCase().includes(query) || prompt.description.toLowerCase().includes(query) || prompt.style.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (activeFilters.type && prompt.type !== activeFilters.type) return false;
      if (activeFilters.style && prompt.style !== activeFilters.style) return false;
      return true;
    });
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [prompts, searchQuery, activeFilters, sortMode]);

  const handleCardClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPrompt(null), 300);
  };

  const getBackendStatus = () => {
    if (isLoading && !loadingTooLong) return "loading";
    if (loadingTooLong) return "timeout";
    if (isError || tagsError) {
      if (error instanceof DataFetchError) return error.type;
      return "error";
    }
    if (prompts && tags) return "ok";
    return "unknown";
  };
  const backendStatus = getBackendStatus();

  const getErrorDetails = () => {
    if (loadingTooLong) return "Le chargement prend trop de temps";
    if (error instanceof DataFetchError) {
      switch (error.type) {
        case "timeout": return `Timeout (${error.message})`;
        case "network": return "Erreur réseau - vérifiez votre connexion";
        case "backend": return error.status ? `Erreur serveur (${error.status})` : error.message;
      }
    }
    return error instanceof Error ? error.message : "Erreur inconnue";
  };

  const showError = isError || loadingTooLong;

  return <div className="min-h-screen relative overflow-hidden">
      <MatrixRain />

      {/* Backend status indicator */}
      <div className="fixed top-4 left-4 z-50">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs backdrop-blur-sm ${backendStatus === "ok" ? "bg-green-500/10 text-green-400" : backendStatus === "loading" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
          {backendStatus === "ok" && <CheckCircle2 className="w-3 h-3" />}
          {backendStatus === "loading" && <Loader2 className="w-3 h-3 animate-spin" />}
          {backendStatus === "timeout" && <AlertCircle className="w-3 h-3" />}
          {backendStatus === "network" && <WifiOff className="w-3 h-3" />}
          {(backendStatus === "error" || backendStatus === "backend") && <AlertCircle className="w-3 h-3" />}
          <span>
            {backendStatus === "ok" && "Backend OK"}
            {backendStatus === "loading" && "Chargement..."}
            {backendStatus === "timeout" && "Timeout"}
            {backendStatus === "network" && "Réseau"}
            {(backendStatus === "error" || backendStatus === "backend") && "Erreur"}
          </span>
        </div>
      </div>

      {/* Admin link */}
      <Link to="/admin/login" className="fixed bottom-20 right-4 p-3 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all z-30 opacity-30 hover:opacity-100">
        <Settings className="w-5 h-5" />
      </Link>

      {/* Main content */}
      <div className="relative z-10 pb-24">
        {/* Hero Section */}
        <section className="pt-20 md:pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <GlitchTitle />

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg font-light tracking-wide mb-12 mt-6 text-destructive-foreground md:text-2xl">
              Bibliothèque de Prompts Images et Vidéos IA  
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="relative inline-block">
              <a
              href="https://www.skool.com/krea/about"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-base transition-all duration-200 hover:bg-primary/85 hover:scale-105 text-center font-mono animate-pulse-glow"
              style={{ boxShadow: '0 0 20px hsl(210 100% 50% / 0.4), 0 0 40px hsl(210 100% 50% / 0.2)' }}>
                Rejoins la communauté de créateurs IA
              </a>
              <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="absolute -bottom-4 -right-6 w-7 h-7 pointer-events-none"
              animate={{ y: [0, -6, 0], scale: [1, 0.85, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}>
                <path
                d="M4 2l12 9.5-5.5 1.2 3.3 6.3-2.5 1.2-3.3-6.3L4 18V2z"
                fill="hsl(0 0% 95%)"
                stroke="hsl(0 0% 30%)"
                strokeWidth="1"
                strokeLinejoin="round" />
              </motion.svg>
            </motion.div>

            <div className="mt-8">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => handleFilterChange("type", "Image")}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilters.type === "Image"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Image
              </button>
              <button
                onClick={() => handleFilterChange("type", "Vidéo")}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilters.type === "Vidéo"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Play className="w-4 h-4" />
                Vidéo
              </button>
            </div>
          </div>
        </section>

        {/* Prompts Grid */}
        <section className="px-4 py-8">
          <div className="container mx-auto max-w-7xl">
            {isLoading && !loadingTooLong ? <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Chargement des prompts...</p>
              </div> : showError ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-destructive/10">
                    {error instanceof DataFetchError && error.type === "network" || loadingTooLong ? <WifiOff className="w-8 h-8 text-destructive" /> : <AlertCircle className="w-8 h-8 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-foreground text-lg font-medium mb-1">
                      Impossible de charger les prompts
                    </p>
                    <p className="text-muted-foreground text-sm mb-2">
                      {getErrorDetails()}
                    </p>
                  </div>
                  <button onClick={() => { setLoadingTooLong(false); refetch(); }} disabled={isFetching} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                    Réessayer
                  </button>
                  <p className="text-xs text-muted-foreground/60 max-w-sm">
                    Si vous utilisez un bloqueur de pub ou un DNS filtrant, essayez en navigation privée.
                  </p>
                </div>
              </motion.div> : filteredPrompts.length > 0 ?
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPrompts.map((prompt, index) => <PromptCard key={prompt.id} prompt={prompt} onClick={() => handleCardClick(prompt)} index={index} />)}
                </div>
              : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  {prompts?.length === 0 ? "Aucune prompt disponible pour le moment." : "Aucune prompt ne correspond à votre recherche."}
                </p>
                {activeFilters.type || activeFilters.style || searchQuery ? <button onClick={() => {
              setSearchQuery("");
              setActiveFilters({ type: null, style: null });
            }} className="mt-4 text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                    Réinitialiser les filtres
                  </button> : null}
              </motion.div>}
          </div>
        </section>
      </div>

      <PromptModal prompt={selectedPrompt} isOpen={isModalOpen} onClose={handleCloseModal} />
      <StickyFooter />
    </div>;
};
export default Index;
