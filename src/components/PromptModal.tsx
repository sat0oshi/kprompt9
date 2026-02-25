import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ExternalLink, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Prompt } from "@/hooks/usePrompts";
import { toast } from "@/hooks/use-toast";

interface PromptModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
}

const PromptModal = ({ prompt, isOpen, onClose }: PromptModalProps) => {
  const [copied, setCopied] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentImageIndex(0);
      setShowRecommendation(false);
      setCopied(false);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const SIGNATURE = `TEXT/ SIGNATURE: Add "www.Kprompt.space" at the bottom-left corner, bold, small size, premium, white or soft off-white color.`;

  const handleCopy = async () => {
    if (!prompt) return;

    await navigator.clipboard.writeText(prompt.prompt + SIGNATURE);
    setCopied(true);

    toast({
      title: "Prompt copiée.",
      description: "La prompt a été copiée dans votre presse-papiers.",
    });

    setTimeout(() => {
      setCopied(false);
      setShowRecommendation(true);
    }, 1500);
  };

  const handleCloseRecommendation = () => {
    setShowRecommendation(false);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prompt && currentImageIndex < prompt.prompt_images.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  if (!prompt) return null;

  const hasMultipleImages = prompt.prompt_images.length > 1;
  const currentMediaUrl = prompt.prompt_images[currentImageIndex]?.image_url || "/placeholder.svg";

  // Check if current media is a video
  const isVideo = (url: string): boolean => {
    const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".mkv"];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some((ext) => lowerUrl.includes(ext));
  };

  const currentIsVideo = isVideo(currentMediaUrl);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-3xl max-h-[90vh] bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1">
              {/* Preview with image/video gallery - supports 9:16 aspect ratio */}
              <div className="relative bg-background flex items-center justify-center min-h-[300px] max-h-[70vh]">
                {currentIsVideo ? (
                  <video
                    key={currentImageIndex}
                    src={currentMediaUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                  />
                ) : (
                  <img
                    key={currentImageIndex}
                    src={currentMediaUrl}
                    alt={prompt.title}
                    className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />

                {/* Image navigation */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-background transition-colors z-10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={currentImageIndex === prompt.prompt_images.length - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-background transition-colors z-10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {prompt.prompt_images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(idx);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentImageIndex ? "bg-primary w-6" : "bg-foreground/30 hover:bg-foreground/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Header */}
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/15 text-primary border border-primary/30">
                      {prompt.type}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        prompt.style === "NSFW" || prompt.is_nsfw
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {prompt.style}
                    </span>
                    {prompt.prompt_tags?.map((pt) => (
                      <span
                        key={pt.id}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary/80 border border-primary/20"
                      >
                        {pt.tag?.name}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{prompt.title}</h2>
                  <p className="mt-2 text-muted-foreground">{prompt.description}</p>
                </div>

                {/* Prompt code container */}
                <div className="code-container p-4 md:p-6">
                  <p className="text-sm text-foreground/90 leading-relaxed font-mono whitespace-pre-wrap">
                    {prompt.prompt}
                  </p>
                </div>

                {/* Copy button */}
                <motion.button
                  onClick={handleCopy}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                    copied
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  style={copied ? {} : { boxShadow: "0 0 30px hsl(210 100% 50% / 0.3)" }}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copier la Prompt
                    </>
                  )}
                </motion.button>

                {/* Recommended tool */}
                {prompt.recommended_tool_name && prompt.recommended_tool_url && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                      Outil recommandé pour cette prompt
                    </p>
                    <a
                      href={prompt.recommended_tool_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-all duration-200 border border-transparent hover:border-border-glow"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Découvrir {prompt.recommended_tool_name}
                    </a>
                  </div>
                )}

                {/* Recommendation popup - inline instead of absolute */}
                <AnimatePresence mode="wait">
                  {showRecommendation && (
                    <motion.div
                      key="recommendation-popup"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-5 rounded-xl bg-secondary border border-border-glow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm text-foreground mb-1">Vous utilisez des prompts avancées.</p>
                              <p className="text-xs text-muted-foreground mb-3">
                                Découvrez les systèmes complets pour aller plus loin.
                              </p>
                            </div>
                            <button
                              onClick={handleCloseRecommendation}
                              className="text-muted-foreground hover:text-foreground shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <a
                            href="https://www.sat0oshi.com/commande-gptmoney"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                          >
                            Découvrir GPTMoney
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PromptModal;
