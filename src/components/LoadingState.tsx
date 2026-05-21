import { motion } from "framer-motion";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-3 w-3 rounded-full bg-emerald-500"
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <motion.p
        className="mt-4 text-sm text-slate-400"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Analyzing sentiment...
      </motion.p>
    </div>
  );
}
