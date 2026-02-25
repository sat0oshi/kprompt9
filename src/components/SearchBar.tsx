import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative search-glow rounded-2xl transition-all duration-300">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Rechercher une prompt..."
          className="w-full bg-card/80 text-foreground placeholder:text-muted-foreground py-4 pl-14 pr-6 rounded-2xl border-0 outline-none focus:ring-0 text-base font-light tracking-wide"
        />
      </div>
    </motion.div>
  );
};

export default SearchBar;
