import { motion } from 'framer-motion'

export default function CurvedBackground() {
  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 0 }}>
      {/* Top right glow */}
      <div 
        className="absolute -top-[40%] right-0 w-[90%] h-[90%] opacity-[0.15]"
        style={{
          background: 'radial-gradient(circle at center, white 0%, transparent 60%)',
          filter: 'blur(80px)'
        }}
      />

      {/* Additional ambient glow */}
      <div 
        className="absolute top-[20%] left-[10%] w-[50%] h-[50%] opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle at center, white 0%, transparent 70%)',
          filter: 'blur(90px)'
        }}
      />

      {/* Bottom design */}
      <div className="absolute bottom-0 w-full">
        {/* Curved line */}
        <div className="relative h-[400px] overflow-hidden">
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[400px] opacity-[0.15]"
            style={{
              background: 'radial-gradient(ellipse at center, white 0%, transparent 60%)',
              transform: 'scale(1, 0.3)',
              filter: 'blur(30px)'
            }}
          />
        </div>

        {/* Bottom lines */}
        <div className="absolute bottom-0 w-full h-[2px] opacity-[0.15]">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent, white 20%, white 80%, transparent)' }} />
        </div>
        <div className="absolute bottom-12 w-full h-[1px] opacity-[0.1]">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent, white 30%, white 70%, transparent)' }} />
        </div>
        <div className="absolute bottom-24 w-full h-[1px] opacity-[0.05]">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent, white 40%, white 60%, transparent)' }} />
        </div>
      </div>

      {/* Animated dots */}
      <motion.div
        className="absolute inset-0"
        initial="initial"
        animate="animate"
      >
        {[
          { x: 20, y: 15 },
          { x: 40, y: 25 },
          { x: 60, y: 35 },
          { x: 80, y: 45 },
          { x: 30, y: 55 },
          { x: 50, y: 65 },
          { x: 70, y: 75 },
          { x: 90, y: 85 },
          { x: 25, y: 20 },
          { x: 45, y: 30 },
          { x: 65, y: 40 },
          { x: 85, y: 50 },
          { x: 35, y: 60 },
          { x: 55, y: 70 },
          { x: 75, y: 80 },
          { x: 95, y: 90 },
          { x: 15, y: 25 },
          { x: 35, y: 35 },
          { x: 55, y: 45 },
          { x: 75, y: 55 },
          { x: 95, y: 65 },
          { x: 25, y: 75 },
          { x: 45, y: 85 },
          { x: 65, y: 95 },
          { x: 85, y: 15 },
          { x: 15, y: 35 },
          { x: 35, y: 55 },
          { x: 55, y: 75 },
          { x: 75, y: 95 },
          { x: 95, y: 25 }
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-[0.15]"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
            animate={{
              opacity: [0.15, 0.3, 0.15],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  )
} 