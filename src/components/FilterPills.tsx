import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTags, DataFetchError } from "@/hooks/usePrompts";
import { RefreshCw, AlertCircle } from "lucide-react";
interface FilterPillsProps {
  activeFilters: {
    type: string | null;
    style: string | null;
  };
  onFilterChange: (category: "type" | "style", value: string | null) => void;
}

const LOADING_TIMEOUT_MS = 12000; // 12 seconds fallback

const FilterPills = ({
  activeFilters,
  onFilterChange
}: FilterPillsProps) => {
  const {
    data: tags,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useTags();
  const [loadingTooLong, setLoadingTooLong] = useState(false);

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
  const handleClick = (category: "type" | "style", value: string) => {
    if (activeFilters[category] === value) {
      onFilterChange(category, null);
    } else {
      onFilterChange(category, value);
    }
  };

  // Get error details for display
  const getErrorDetails = () => {
    if (loadingTooLong) return "Chargement trop long";
    if (error instanceof DataFetchError) {
      switch (error.type) {
        case "timeout":
          return "Timeout";
        case "network":
          return "Erreur réseau";
        case "backend":
          return error.status ? `Erreur ${error.status}` : "Erreur serveur";
      }
    }
    return "Erreur inconnue";
  };
  const showError = isError || loadingTooLong;
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.6,
    delay: 0.4
  }} className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">

      

      {/* Style filters from database */}
      
    </motion.div>;
};
export default FilterPills;