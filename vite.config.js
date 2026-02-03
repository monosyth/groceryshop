import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - rarely changes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // MUI - large but stable
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          // Firebase - separate for caching
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          // Charts - only used by Analytics
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
})
