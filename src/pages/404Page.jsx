import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Red accent elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-red-600 rounded-full opacity-20"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <motion.h1
        className="text-9xl font-bold mb-4 text-red-600"
        variants={itemVariants}
      >
        404
      </motion.h1>

      <motion.div
        className="text-6xl mb-8"
        variants={itemVariants}
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        🚫
      </motion.div>

      <motion.h2
        className="text-3xl font-medium mb-6 text-center"
        variants={itemVariants}
      >
        Page Not Found
      </motion.h2>

      <motion.p
        className="text-xl max-w-2xl text-center mb-12 leading-relaxed opacity-80"
        variants={itemVariants}
      >
        The page you're looking for doesn't exist or has been moved. Let's get
        you back to safety.
      </motion.p>

      <motion.button
        onClick={() => navigate("/")}
        className="px-8 py-4 text-xl bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium relative overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate="pulse"
        variants={pulseVariants}
      >
        Return Home
        <motion.span
          className="absolute inset-0 bg-white opacity-0 hover:opacity-10"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
    </motion.div>
  );
};

export default NotFoundPage;
