

## Plan : Apercu video au hover + Toggle Image/Video

### 1. Apercu video au survol (PromptCard)

**`src/components/PromptCard.tsx`** :
- Ajouter un `useRef<HTMLVideoElement>` pour reference la balise video
- Ajouter des handlers `onMouseEnter` / `onMouseLeave` sur le conteneur de preview :
  - `onMouseEnter` : appelle `videoRef.current.play()` sur la video
  - `onMouseLeave` : appelle `videoRef.current.pause()` et remet `currentTime = 0`
- Attacher le ref a la balise `<video>` existante
- Ajouter `loop` a la balise video pour que l'apercu tourne en boucle au survol

### 2. Toggle Image / Video (Index)

**`src/pages/Index.tsx`** :
- Ajouter un state `activeTypeFilter` initialise a `"Image"` (par defaut sur Image a l'arrivee sur la page)
- Ajouter un toggle visuel (deux boutons cote a cote) entre la barre de recherche et la grille, avec les icones `ImageIcon` et `Play` de lucide
- Le toggle met a jour `activeFilters.type` via `handleFilterChange("type", value)`
- Initialiser `activeFilters.type` a `"Image"` au lieu de `null`
- Style du toggle : pilules arrondies, fond actif en `bg-primary text-primary-foreground`, inactif en `bg-secondary/50 text-muted-foreground`

### Details techniques

```text
PromptCard.tsx - Video hover :
  const videoRef = useRef<HTMLVideoElement>(null);
  
  onMouseEnter sur le div.aspect-[4/3] :
    if (videoRef.current) { videoRef.current.play(); }
  
  onMouseLeave :
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  
  <video ref={videoRef} ... loop />

Index.tsx - Toggle (place entre SearchBar et la grille) :
  const [activeFilters] = useState({ type: "Image", style: null })
  
  <div className="flex justify-center gap-2 mb-6">
    <button onClick={() => handleFilterChange("type", "Image")}
      className={activeFilters.type === "Image" ? "bg-primary ..." : "bg-secondary/50 ..."}>
      <ImageIcon /> Image
    </button>
    <button onClick={() => handleFilterChange("type", "Vidéo")}
      className={activeFilters.type === "Vidéo" ? "bg-primary ..." : "bg-secondary/50 ..."}>
      <Play /> Vidéo
    </button>
  </div>
```

Le toggle ne permet pas de deselectionner (toujours Image ou Video active). Cliquer sur le type deja actif ne fait rien.

