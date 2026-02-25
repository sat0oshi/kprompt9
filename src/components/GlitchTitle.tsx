import { motion } from "framer-motion";

const GlitchTitle = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight relative glitch-container">
        {/* Main text */}
        <span className="relative inline-block glitch-text" data-text="K Prompt">
          K Prompt
        </span>
      </h1>
      
      {/* Glitch layers */}
      <style>{`
        .glitch-container {
          position: relative;
        }
        
        .glitch-text {
          position: relative;
          animation: glitch-skew 4s infinite linear alternate-reverse;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.8;
        }
        
        .glitch-text::before {
          color: hsl(210, 100%, 60%);
          animation: glitch-anim-1 3s infinite linear alternate-reverse;
          clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
          transform: translateX(-2px);
        }
        
        .glitch-text::after {
          color: hsl(200, 80%, 50%);
          animation: glitch-anim-2 2.5s infinite linear alternate-reverse;
          clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
          transform: translateX(2px);
        }
        
        @keyframes glitch-anim-1 {
          0%, 100% {
            transform: translateX(0);
            opacity: 0;
          }
          20% {
            transform: translateX(-3px) skewX(-1deg);
            opacity: 0.7;
          }
          21% {
            transform: translateX(0);
            opacity: 0;
          }
          40% {
            transform: translateX(2px);
            opacity: 0;
          }
          41% {
            transform: translateX(3px) skewX(1deg);
            opacity: 0.5;
          }
          42% {
            transform: translateX(0);
            opacity: 0;
          }
          60% {
            transform: translateX(-2px);
            opacity: 0.6;
          }
          61% {
            transform: translateX(0);
            opacity: 0;
          }
          80% {
            transform: translateX(4px) skewX(-0.5deg);
            opacity: 0.4;
          }
          81% {
            transform: translateX(0);
            opacity: 0;
          }
        }
        
        @keyframes glitch-anim-2 {
          0%, 100% {
            transform: translateX(0);
            opacity: 0;
          }
          15% {
            transform: translateX(3px) skewX(0.5deg);
            opacity: 0.5;
          }
          16% {
            transform: translateX(0);
            opacity: 0;
          }
          35% {
            transform: translateX(-4px);
            opacity: 0.6;
          }
          36% {
            transform: translateX(0);
            opacity: 0;
          }
          55% {
            transform: translateX(2px) skewX(-1deg);
            opacity: 0.4;
          }
          56% {
            transform: translateX(0);
            opacity: 0;
          }
          75% {
            transform: translateX(-3px);
            opacity: 0.7;
          }
          76% {
            transform: translateX(0);
            opacity: 0;
          }
        }
        
        @keyframes glitch-skew {
          0%, 100% {
            transform: skewX(0deg);
          }
          20% {
            transform: skewX(0deg);
          }
          21% {
            transform: skewX(0.5deg);
          }
          22% {
            transform: skewX(0deg);
          }
          50% {
            transform: skewX(0deg);
          }
          51% {
            transform: skewX(-0.3deg);
          }
          52% {
            transform: skewX(0deg);
          }
          80% {
            transform: skewX(0deg);
          }
          81% {
            transform: skewX(0.2deg);
          }
          82% {
            transform: skewX(0deg);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default GlitchTitle;
