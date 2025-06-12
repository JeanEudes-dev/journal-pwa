import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 to-whatsapp-100 dark:from-whatsapp-dark-100 dark:to-whatsapp-dark-200 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 rounded-full flex items-center justify-center shadow-lg"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8v1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.63-.56 3.54-1.46.65.89 1.77 1.46 2.96 1.46 1.93 0 3.5-1.57 3.5-3.5V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
          </svg>
        </motion.div>

        <motion.h1
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Journal PWA
        </motion.h1>

        <motion.p
          className="text-gray-600 dark:text-gray-400 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          by Jean-Eudes Assogba
        </motion.p>

        <motion.div
          className="flex items-center justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="w-2 h-2 bg-whatsapp-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-whatsapp-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-2 h-2 bg-whatsapp-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </motion.div>

        <motion.p
          className="text-sm text-gray-500 dark:text-gray-400 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Loading your journal...
        </motion.p>
      </div>
    </div>
  );
};
