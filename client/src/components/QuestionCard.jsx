import { motion } from "framer-motion";

export function QuestionCard({ question, current, total, domain, difficulty }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-2xl p-6 flex flex-col"
      style={{ height: "100%" }}
    >
      {/* Header badges */}
      <div className="flex justify-between items-center mb-6 text-sm flex-shrink-0">
        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-medium">
          Question {current} / {total}
        </span>
        <div className="flex gap-2">
          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full uppercase text-xs">
            {domain}
          </span>
          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs">
            {difficulty}
          </span>
        </div>
      </div>

      {/* Question text — takes all remaining space, scrollable */}
      <div
        className="flex-1 overflow-y-auto flex items-center justify-center"
        style={{ minHeight: 0 }}
      >
        <p className="text-2xl sm:text-3xl font-bold text-white leading-relaxed text-center w-full whitespace-pre-wrap break-words px-2">
          {question?.question || "Loading question..."}
        </p>
      </div>
    </motion.div>
  );
}