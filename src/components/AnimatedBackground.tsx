import { motion } from "framer-motion";

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base deep black */}
      <div className="absolute inset-0 bg-[#050505]" />
      
      {/* Matrix waves from center - multiple rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Ring 1 */}
        <motion.div
          className="absolute rounded-full border border-primary/20"
          style={{ width: 100, height: 100 }}
          animate={{
            width: [100, 2000],
            height: [100, 2000],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Ring 2 - offset timing */}
        <motion.div
          className="absolute rounded-full border border-primary/15"
          style={{ width: 100, height: 100 }}
          animate={{
            width: [100, 2000],
            height: [100, 2000],
            opacity: [0.3, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: 1.6,
          }}
        />
        
        {/* Ring 3 */}
        <motion.div
          className="absolute rounded-full border border-primary/10"
          style={{ width: 100, height: 100 }}
          animate={{
            width: [100, 2000],
            height: [100, 2000],
            opacity: [0.25, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: 3.2,
          }}
        />
        
        {/* Ring 4 */}
        <motion.div
          className="absolute rounded-full border border-cyan-500/15"
          style={{ width: 100, height: 100 }}
          animate={{
            width: [100, 2000],
            height: [100, 2000],
            opacity: [0.2, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: 4.8,
          }}
        />

        {/* Ring 5 */}
        <motion.div
          className="absolute rounded-full border border-cyan-400/10"
          style={{ width: 100, height: 100 }}
          animate={{
            width: [100, 2000],
            height: [100, 2000],
            opacity: [0.15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: 6.4,
          }}
        />

        {/* Central glow pulse */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            background: "radial-gradient(circle, hsl(210 100% 50% / 0.15), transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Horizontal scan lines - matrix style */}
      <div className="absolute inset-0 opacity-[0.02]">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-px bg-primary"
            style={{ top: `${i * 2}%` }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scaleX: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(hsl(210 50% 20% / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(210 50% 20% / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Very subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
