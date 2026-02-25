import { useState, useRef } from "react";
import { Upload, X, Link, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  index: number;
}

const compressImage = async (file: File): Promise<File> => {
  // Skip videos and GIFs — not compressible via Canvas
  const skipTypes = ["image/gif", "video/mp4", "video/webm", "video/quicktime"];
  if (skipTypes.includes(file.type)) return file;

  // Skip if already webp
  if (file.type === "image/webp") return file;

  // Only compress images
  if (!file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX_WIDTH = 2000;
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const newName = file.name.replace(/\.[^/.]+$/, ".webp");
          resolve(new File([blob], newName, { type: "image/webp" }));
        },
        "image/webp",
        0.8
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

const ImageUpload = ({ value, onChange, onRemove, index }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<"url" | "upload">(value ? "url" : "upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Type de fichier non supporté",
        description: "Formats acceptés: JPG, PNG, GIF, WebP, MP4, WebM, MOV",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 50MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Compress image before upload
      const processedFile = await compressImage(file);
      const fileExt = processedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("prompt-assets")
        .upload(filePath, processedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("prompt-assets")
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      toast({ title: "Fichier uploadé avec succès" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erreur lors de l'upload",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            mode === "upload"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="w-3 h-3 inline mr-1" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            mode === "url"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link className="w-3 h-3 inline mr-1" />
          URL
        </button>
      </div>

      <div className="flex items-center gap-2">
        {mode === "upload" ? (
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {value ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm truncate">
                  {value.split("/").pop()}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-3 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Changer"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-dashed border-border text-muted-foreground text-sm hover:border-primary hover:text-foreground transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Cliquez pour uploader une image ou vidéo
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            placeholder="https://example.com/image.jpg"
          />
        )}
        <button
          type="button"
          onClick={onRemove}
          className="p-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preview */}
      {value && (
        <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden bg-secondary">
          {value.match(/\.(mp4|webm|mov)$/i) ? (
            <video
              src={value}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          ) : (
            <img
              src={value}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
