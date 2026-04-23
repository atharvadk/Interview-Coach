import { motion } from "framer-motion";

export function EmotionBadge({ emotion }) {
  if (!emotion) return null;

  return (
    <motion.div 
      key={emotion.emotion}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-slate-900/80 backdrop-blur-md border border-slate-700 shadow-lg flex items-center gap-2 px-3 py-2 rounded-full"
    >
      <span className="text-xl">{emotion.emoji}</span>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-slate-200">{emotion.emotion}</span>
        <span className="text-[10px] text-emerald-400">{emotion.confidence}%</span>
      </div>
    </motion.div>
  );
}
