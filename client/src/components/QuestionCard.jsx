import { motion } from "framer-motion";

export function QuestionCard({ question, current, total, domain, difficulty }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-2xl p-6 h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6 text-sm">
        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-medium">
          Question {current} / {total}
        </span>
        <div className="flex gap-2">
          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full">{domain}</span>
          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full">{difficulty}</span>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-relaxed text-center">
          {question?.text || "Loading question..."}
        </h2>
      </div>
    </motion.div>
  );
}
