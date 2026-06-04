'use client';

import { motion } from 'framer-motion';
import { Download, FileText, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Extend window type for PDF.js
declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

interface AnimatePresenceProps {
  children: React.ReactNode;
}

export default function Portfolio() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const isRenderingRef = useRef(false);

  // Default portfolio PDF URL - replace with your actual PDF
  const portfolioUrl = '/elias-portfolio.pdf';

  // Load PDF.js library
  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
    };
    document.head.appendChild(script);
  }, []);

  // Load and render PDF
  useEffect(() => {
    if (!isModalOpen || !canvasRef.current) return;

    const loadPDF = async () => {
      try {
        setIsLoading(true);
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) return;

        const pdf = await pdfjsLib.getDocument(portfolioUrl).promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        // Let the page change effect handle rendering
        setCurrentPage(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  // Render specific page
  const renderPage = async (pageNum: number, pdf?: any) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas not available for rendering');
      return;
    }

    // Cancel previous render task if it's still running
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (error) {
        // Task might already be complete, ignore
      }
    }

    try {
      const pdfDoc = pdf || pdfDocRef.current;
      if (!pdfDoc) {
        console.warn('PDF document not available');
        return;
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        console.error('Failed to get canvas context');
        return;
      }

      // Clear canvas before rendering
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;
    } catch (error) {
      if ((error as any).name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', error);
      }
    }
  };

  // Handle page changes
  useEffect(() => {
    if (
      isModalOpen &&
      pdfDocRef.current &&
      canvasRef.current &&
      totalPages > 0
    ) {
      renderPage(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, scale, isModalOpen, totalPages]);

  // Force render when modal opens
  useEffect(() => {
    if (
      isModalOpen &&
      pdfDocRef.current &&
      canvasRef.current &&
      totalPages > 0
    ) {
      const timer = setTimeout(() => {
        renderPage(currentPage);
      }, 100);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  // Handle zoom
  const handleZoom = (direction: 'in' | 'out') => {
    setScale((prev) => {
      const newScale =
        direction === 'in' ? prev + 0.2 : Math.max(0.5, prev - 0.2);
      return newScale;
    });
  };

  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = portfolioUrl;
    link.download = 'elias-portfolio.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      if (e.key === 'ArrowRight' && currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, currentPage, totalPages, setCurrentPage, setIsModalOpen]);

  return (
    <main className='relative isolate bg-gradient-to-b from-background via-slate-900/20 to-background text-foreground min-h-screen'>
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-0 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2' />
      </div>

      {/* Header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20'
      >
        <div className='max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className='text-center space-y-6'
          >
            <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight'>
              <span className='block text-white mb-2'>Our Portfolio</span>
              <span className='block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent'>
                Success Stories & Case Studies
              </span>
            </h1>
            <p className='text-base sm:text-lg text-slate-300 max-w-2xl mx-auto'>
              Explore our comprehensive portfolio showcasing revenue recovery
              transformations and business growth strategies.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Portfolio Preview Cards */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className='relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16'
      >
        <div className='max-w-6xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Portfolio Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className='rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm p-6 sm:p-8 space-y-4 hover:border-purple-500/60 transition-all duration-300'
            >
              <div className='flex items-center gap-3'>
                <div className='p-3 rounded-lg bg-purple-500/20'>
                  <FileText className='w-6 h-6 text-purple-300' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-white'>
                  Full Portfolio
                </h3>
              </div>
              <p className='text-slate-300 text-sm sm:text-base leading-relaxed'>
                View our complete collection of case studies, client success
                stories, and revenue recovery transformations.
              </p>
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-3 rounded-lg transition-all duration-300 text-sm sm:text-base'
              >
                View PDF Portfolio
              </motion.button>
            </motion.div>

            {/* Portfolio Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className='rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm p-6 sm:p-8 space-y-4 hover:border-purple-500/60 transition-all duration-300'
            >
              <div className='flex items-center gap-3'>
                <div className='p-3 rounded-lg bg-blue-500/20'>
                  <Download className='w-6 h-6 text-blue-300' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-white'>
                  Download PDF
                </h3>
              </div>
              <p className='text-slate-300 text-sm sm:text-base leading-relaxed'>
                Download our portfolio as a PDF document for offline viewing and
                easy sharing with your team.
              </p>
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2'
              >
                <Download className='w-4 h-4' />
                Download Now
              </motion.button>
            </motion.div>

            {/* Portfolio Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className='rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm p-6 sm:p-8 space-y-4 hover:border-purple-500/60 transition-all duration-300'
            >
              <div className='flex items-center gap-3'>
                <div className='p-3 rounded-lg bg-pink-500/20'>
                  <FileText className='w-6 h-6 text-pink-300' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-white'>
                  Quick Preview
                </h3>
              </div>
              <p className='text-slate-300 text-sm sm:text-base leading-relaxed'>
                Get a quick preview of our portfolio highlights and key metrics
                before diving into the full document.
              </p>
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition-all duration-300 text-sm sm:text-base'
              >
                Quick View
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className='w-full h-[90vh] max-w-5xl bg-slate-900 rounded-2xl border border-purple-500/40 overflow-hidden flex flex-col'
            >
              {/* Toolbar */}
              <div className='flex items-center justify-between bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-purple-500/40 p-4 sm:p-6'>
                <div className='flex items-center gap-2 sm:gap-4'>
                  <h3 className='text-white font-bold text-sm sm:text-base'>
                    Portfolio PDF Viewer
                  </h3>
                  {totalPages > 0 && (
                    <span className='text-slate-300 text-xs sm:text-sm'>
                      Page {currentPage} of {totalPages}
                    </span>
                  )}
                </div>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleZoom('out')}
                    className='p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 transition-colors'
                    title='Zoom Out'
                  >
                    <ZoomOut className='w-4 h-4 sm:w-5 sm:h-5' />
                  </motion.button>
                  <span className='text-slate-300 text-xs sm:text-sm min-w-12 text-center'>
                    {Math.round(scale * 100)}%
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleZoom('in')}
                    className='p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 transition-colors'
                    title='Zoom In'
                  >
                    <ZoomIn className='w-4 h-4 sm:w-5 sm:h-5' />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className='p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 transition-colors hidden sm:block'
                    title='Download PDF'
                  >
                    <Download className='w-4 h-4 sm:w-5 sm:h-5' />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(false)}
                    className='p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 transition-colors'
                    title='Close'
                  >
                    <X className='w-4 h-4 sm:w-5 sm:h-5' />
                  </motion.button>
                </div>
              </div>

              {/* PDF Canvas */}
              <div className='flex-1 overflow-auto flex items-center justify-center bg-slate-950/50'>
                {isLoading ? (
                  <div className='flex flex-col items-center gap-4'>
                    <div className='w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin' />
                    <p className='text-slate-300'>Loading PDF...</p>
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef}
                    className='max-w-full max-h-full shadow-2xl'
                  />
                )}
              </div>

              {/* Navigation Controls */}
              {totalPages > 0 && (
                <div className='flex items-center justify-between bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-t border-purple-500/40 p-4 sm:p-6'>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className='px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
                  >
                    Previous
                  </motion.button>

                  <div className='flex items-center gap-2 sm:gap-4'>
                    <input
                      type='number'
                      min='1'
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = Math.min(
                          totalPages,
                          Math.max(1, parseInt(e.target.value) || 1)
                        );
                        setCurrentPage(page);
                      }}
                      className='w-12 sm:w-16 px-2 py-1 rounded bg-slate-800/50 border border-slate-700 text-white text-center text-sm'
                    />
                    <span className='text-slate-300 text-sm'>
                      / {totalPages}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className='px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
                  >
                    Next
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Helper component for AnimatePresence
function AnimatePresence({ children }: AnimatePresenceProps) {
  return <>{children}</>;
}
