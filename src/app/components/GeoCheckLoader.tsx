import { Globe } from "lucide-react";
import { motion } from "motion/react";

interface GeoCheckLoaderProps {
  isDarkMode?: boolean;
}

export function GeoCheckLoader({ isDarkMode = false }: GeoCheckLoaderProps) {
  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center gap-6 ${
        isDarkMode ? "bg-[#0d0d0d]" : "bg-gray-50"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Globe className="w-6 h-6 text-[#022179]" />
        <span className="text-[#022179] font-bold text-xl tracking-tight">GENODDS</span>
      </div>

      {/* Spinner */}
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#022179]/20"
          style={{ borderTopColor: "#022179" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <p className={`text-xs ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
        Verifying access…
      </p>
    </div>
  );
}
