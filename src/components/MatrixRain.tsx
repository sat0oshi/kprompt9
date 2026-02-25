import { useEffect, useRef } from "react";

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charArray = chars.split("");
    
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    
    const drops: number[] = [];
    const kColumns: Set<number> = new Set();
    const kTimers: Map<number, number> = new Map();
    
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Randomly select columns that will show golden K
    const updateKColumns = () => {
      kColumns.clear();
      const numKs = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numKs; i++) {
        const col = Math.floor(Math.random() * columns);
        kColumns.add(col);
        kTimers.set(col, Math.floor(Math.random() * 50) + 20);
      }
    };
    
    updateKColumns();
    setInterval(updateKColumns, 3000);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        let char: string;
        let color: string;

        // Check if this column should show a golden K
        if (kColumns.has(i)) {
          const timer = kTimers.get(i) || 0;
          if (timer > 0) {
            kTimers.set(i, timer - 1);
            char = "K";
            color = "#FFD700"; // Gold color
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#FFD700";
          } else {
            char = charArray[Math.floor(Math.random() * charArray.length)];
            color = `hsl(200, 100%, ${50 + Math.random() * 20}%)`;
            ctx.shadowBlur = 0;
          }
        } else {
          char = charArray[Math.floor(Math.random() * charArray.length)];
          // Blue shades
          color = `hsl(200, 100%, ${50 + Math.random() * 20}%)`;
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Reset shadow
        ctx.shadowBlur = 0;

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 opacity-40"
      style={{ background: "linear-gradient(180deg, #000510 0%, #001020 100%)" }}
    />
  );
};

export default MatrixRain;
