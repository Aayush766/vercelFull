import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize, Minimize, FileText } from 'lucide-react';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = ({ fileUrl, onClose, darkMode }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [fullScreen, setFullScreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate progress based on current page
  const progress = numPages ? Math.round((pageNumber / numPages) * 100) : 0;

  // Simulate loading progress
  useEffect(() => {
    let interval;
    
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          const next = prev + Math.random() * 10;
          return next > 90 ? 90 : next;
        });
      }, 200);
    } else {
      setLoadingProgress(100);
    }
    
    return () => clearInterval(interval);
  }, [isLoading]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setIsLoading(false);
    setLoadingProgress(100);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return newPageNumber > 0 && newPageNumber <= (numPages || 1) ? newPageNumber : prevPageNumber;
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.2, 2.0));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.6));
  }

  function toggleFullScreen() {
    setFullScreen(prev => !prev);
  }

  const ViewerContent = (
    <div className={`relative transition-all duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <FileText className="animate-pulse h-12 w-12 text-blue-400 mb-4" />
          <div className="w-64 mb-2">
            <progress value={loadingProgress} max="100" className="w-full h-2 rounded-lg" />
          </div>
          <p className="text-sm text-white">Loading PDF... {Math.round(loadingProgress)}%</p>
        </div>
      )}

      {/* Toolbar */}
      <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1 || isLoading}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-sm font-medium">
            {pageNumber} / {numPages || '?'}
          </span>

          <button
            onClick={nextPage}
            disabled={pageNumber >= (numPages || 0) || isLoading}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.6 || isLoading}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="text-xs">{Math.round(scale * 100)}%</span>

          <button
            onClick={zoomIn}
            disabled={scale >= 2.0 || isLoading}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            {fullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>

          <a
            href={fileUrl}
            download
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <Download className="h-4 w-4" />
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900 dark:hover:text-red-300 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="w-full h-1 bg-gray-300 dark:bg-gray-700">
          <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* PDF Document */}
      <div className={`flex justify-center p-4 ${fullScreen ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'}`}>
        <div className="flex justify-center transition-all duration-300 animate-fade-in">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-64">
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-red-500 mb-2">Failed to load PDF</p>
                <p className="text-sm text-gray-500">Please check if the file exists and try again</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderAnnotationLayer={false}
              renderTextLayer={true}
              className={`shadow-lg ${darkMode ? 'bg-white' : ''}`}
            />
          </Document>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 p-4 flex items-center justify-center`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl">
        {ViewerContent}
      </div>
    </div>
  );
};

export default PDFViewer;
