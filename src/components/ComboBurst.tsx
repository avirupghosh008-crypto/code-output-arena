import { AnimatePresence, motion } from "framer-motion";

export function ComboBurst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-40 grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="rounded-3xl border-2 border-acid bg-ink/90 px-8 py-6 text-center shadow-[0_0_80px_rgba(214,255,63,0.35)]"
          >
            <p className="text-[11px] uppercase tracking-[0.4em] text-acid">combo streak</p>
            <p className="font-display text-5xl font-extrabold text-white">2x XP</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
