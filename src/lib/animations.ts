export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const slideIn = {
  initial: { x: -60, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 60, opacity: 0 }
};

export const scaleUp = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};

export const buttonHover = {
  scale: 1.05,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 10
  }
}; 