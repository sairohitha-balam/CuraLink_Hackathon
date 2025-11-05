'use client';

import { motion } from 'framer-motion';

// This component wraps any other component ("children")
// and makes it fade in as it enters the screen.
export default function FadeInWrapper({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Start invisible and slightly down
      whileInView={{ opacity: 1, y: 0 }} // Animate to fully visible at original position
      viewport={{ once: true }} // Only animate once when it comes into view
      transition={{
        duration: 0.5, // Animation lasts 0.5 seconds
        delay: delay, // Apply any passed-in delay
      }}
    >
      {children}
    </motion.div>
  );
}