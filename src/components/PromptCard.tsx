import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Image as ImageIcon, Images, Eye } from "lucide-react";
import { Prompt } from "@/hooks/usePrompts";

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
  index: number;
}

const PromptCard = ({ prompt, onClick, index }: PromptCardProps) => {
  const [nsfwRevealed, setNsfwRevealed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const hasMultipleImages = prompt.prompt_images.length > 1;
  const previewUrl = prompt.prompt_images[0]?.image_url || "/placeholder.svg";

  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = [".mp4", ".webm", ".mov"];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  const handleNsfwReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNsfwRevealed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      onClick={onClick}
      className="card-premium rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Preview Image */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-black flex items-center justify-center"
        onMouseEnter={() => { if (videoRef.current) videoRef.current.play(); }}
        onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}
      >
        {isVideoUrl(previewUrl) ? (
          <video
            ref={videoRef}
            src={previewUrl}
            muted
            loop
            preload="none"
            playsInline
            className={`max-w-full max-h-full w-auto h-auto object-contain transition-all duration-500 group-hover:scale-105 ${
              prompt.is_nsfw && !nsfwRevealed ? "blur-xl" : ""
            }`}
          />
        ) : (
          <img
            src={previewUrl}
            alt={prompt.title}
            loading="lazy"
            className={`max-w-full max-h-full w-auto h-auto object-contain transition-all duration-500 group-hover:scale-105 ${
              prompt.is_nsfw && !nsfwRevealed ? "blur-xl" : ""
            }`}
          />
        )}
        
        {/* NSFW overlay */}
        {prompt.is_nsfw && !nsfwRevealed && (
          <div 
            className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-10"
            onClick={handleNsfwReveal}
          >
            <Eye className="w-8 h-8 text-red-400 mb-2" />
            <span className="text-sm font-medium text-red-400">Contenu NSFW</span>
            <span className="text-xs text-muted-foreground mt-1">Cliquez pour révéler</span>
          </div>
        )}
        
        {/* Type indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 z-20">
          {prompt.type === "Vidéo" ? (
            <Play className="w-3 h-3 text-primary" />
          ) : (
            <ImageIcon className="w-3 h-3 text-primary" />
          )}
          <span className="text-xs font-medium text-foreground/90">{prompt.type}</span>
        </div>

        {/* Multiple images indicator */}
        {hasMultipleImages && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 z-20">
            <Images className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-foreground/90">{prompt.prompt_images.length}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {prompt.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {prompt.description}
        </p>
        
        {/* Style tag and additional tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
            prompt.style === "NSFW" || prompt.is_nsfw
              ? "bg-red-500/15 text-red-400 border border-red-500/30" 
              : "bg-secondary text-secondary-foreground"
          }`}>
            {prompt.style}
          </span>
          {prompt.prompt_tags?.slice(0, 2).map((pt) => (
            <span 
              key={pt.id}
              className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary/80 border border-primary/20"
            >
              {pt.tag?.name}
            </span>
          ))}
          {(prompt.prompt_tags?.length || 0) > 2 && (
            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
              +{prompt.prompt_tags.length - 2}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PromptCard;
