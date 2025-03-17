import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mui/x-date-pickers': '@mui/x-date-pickers/modern',
    },
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material']
        }
      }
    }
  },
  define: {
    // This suppresses the React Router deprecation warnings
    'process.env.NODE_ENV': '"development"',
    '__REACT_ROUTER_FUTURE_FLAG.startTransition': true,
    '__REACT_ROUTER_FUTURE_FLAG.relativeSplatPath': true
  }
})
