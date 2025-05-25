// src/components/student/DocumentViewer.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import axios from 'axios';

// Set the worker URL (IMPORTANT! Adjust this for your production environment)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const DocumentViewer = () => {
    const { documentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { fileUrl, title } = location.state || {};

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scale, setScale] = useState(1.0);
    const [loadProgress, setLoadProgress] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    // New state for page turn direction
    const [pageTurnDirection, setPageTurnDirection] = useState('forward'); // 'forward' or 'backward'

    const canvasRef = useRef(null);
    const pdfDocRef = useRef(null);
    const viewerRef = useRef(null);

    // Function to render a specific page onto the canvas
    const renderPage = useCallback(async (page, currentScale) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.warn("Canvas element not found for rendering.");
            return;
        }

        const context = canvas.getContext('2d');

        const outputScale = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: currentScale });

        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.width = Math.floor(viewport.width * outputScale);

        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
            transform: transform,
        };

        try {
            await page.render(renderContext).promise;
        } catch (renderErr) {
            console.error(`Error rendering page ${page.pageNumber}:`, renderErr);
            setError(`Failed to render page ${page.pageNumber}.`);
        }
    }, []);

    // Effect to load the PDF document and render the first page
    useEffect(() => {
        const loadDocument = async () => {
            setLoading(true);
            setError(null);
            setLoadProgress(0);
            pdfDocRef.current = null;

            if (!fileUrl) {
                setError("No document URL provided. Please go back and select a document.");
                setLoading(false);
                setNumPages(null);
                setPageNumber(1);
                return;
            }

            try {
                const response = await axios.get(fileUrl, {
                    responseType: 'arraybuffer',
                    onDownloadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setLoadProgress(percentCompleted);
                    }
                });
                const pdfData = response.data;

                const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                const pdfDocument = await loadingTask.promise;
                pdfDocRef.current = pdfDocument;

                setNumPages(pdfDocument.numPages);
                setPageNumber(1);
                setScale(1.0);

                const page = await pdfDocument.getPage(1);
                await renderPage(page, 1.0);

            } catch (err) {
                console.error('Error loading PDF:', err.response ? err.response.data : err.message);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError('Access Denied: You do not have permission to view this document. Possibly an expired or invalid signed URL.');
                } else {
                    setError(`Failed to load document: ${err.message || 'Unknown error'}. Please ensure it's a valid PDF file and the URL is correct.`);
                }
                setNumPages(null);
                setPageNumber(1);
            } finally {
                setLoading(false);
            }
        };

        loadDocument();

        return () => {
            if (pdfDocRef.current) {
                pdfDocRef.current.destroy();
                pdfDocRef.current = null;
            }
        };
    }, [fileUrl, renderPage]);

    // Effect to re-render the page when pageNumber or scale changes, with transition
    useEffect(() => {
        const updatePage = async () => {
            if (pdfDocRef.current && pageNumber >= 1 && pageNumber <= numPages) {
                setIsTransitioning(true);
                // The transition duration should be slightly longer than the setTimeout
                // to allow the animation to play before the content fully changes.
                setTimeout(async () => {
                    try {
                        const page = await pdfDocRef.current.getPage(pageNumber);
                        await renderPage(page, scale);
                    } catch (err) {
                        console.error('Error rendering page:', err);
                        setError(`Failed to render page ${pageNumber}.`);
                    } finally {
                        setIsTransitioning(false);
                    }
                }, 250); // Increased timeout to match CSS transition (0.3s defined in CSS)
            }
        };
        updatePage();
    }, [pageNumber, numPages, scale, renderPage]);

    // Navigation handlers
    const goToPrevPage = useCallback(() => {
        setPageTurnDirection('backward');
        setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
    }, []);

    const goToNextPage = useCallback(() => {
        setPageTurnDirection('forward');
        setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));
    }, [numPages]);

    // Zoom handlers (no change here)
    const zoomIn = useCallback(() => {
        setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
    }, []);

    const zoomOut = useCallback(() => {
        setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
    }, []);

    const resetZoom = useCallback(() => {
        setScale(1.0);
    }, []);

    // Full screen handler (no change here)
    const toggleFullScreen = useCallback(() => {
        if (viewerRef.current) {
            if (!document.fullscreenElement) {
                viewerRef.current.requestFullscreen().catch(err => {
                    alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    }, []);

    // Keyboard navigation (updated to set pageTurnDirection)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (['ArrowLeft', 'ArrowRight', '+', '-', '0', 'f', 'F'].includes(event.key)) {
                event.preventDefault(); // Prevent default browser actions for these keys
            }

            if (event.key === 'ArrowLeft') {
                setPageTurnDirection('backward'); // Set direction for previous page
                goToPrevPage();
            } else if (event.key === 'ArrowRight') {
                setPageTurnDirection('forward'); // Set direction for next page
                goToNextPage();
            } else if (event.key === '+') {
                zoomIn();
            } else if (event.key === '-') {
                zoomOut();
            } else if (event.key === '0') {
                resetZoom();
            } else if (event.key === 'f' || event.key === 'F') {
                toggleFullScreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [goToPrevPage, goToNextPage, zoomIn, zoomOut, resetZoom, toggleFullScreen]);

    const handleGoBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);


    // Initial check for missing fileUrl (e.g., direct navigation)
    if (!fileUrl) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 text-center shadow-lg">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-indigo-400">No Document Selected</h2>
                <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-lg">It looks like you landed here without a specific document. Please go back and select one to start viewing.</p>
                <button
                    onClick={handleGoBack}
                    className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xl transition transform hover:scale-105 duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                >
                    &larr; Go Back to Library
                </button>
            </div>
        );
    }

    // Loading state UI with progress bar
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-white">
                <div className="flex items-center justify-center mb-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
                    <p className="ml-4 text-2xl font-medium text-gray-200">Loading Document...</p>
                </div>
                <div className="w-full max-w-md bg-gray-700 rounded-full h-3.5 shadow-inner">
                    <div
                        className="bg-indigo-600 h-3.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${loadProgress}%` }}
                    ></div>
                </div>
                <span className="text-md mt-3 font-semibold text-gray-300">{loadProgress}% loaded</span>
            </div>
        );
    }

    // Error state UI
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-red-400 p-4 text-center shadow-lg">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-red-500">Error Loading Document</h2>
                <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-lg">{error}</p>
                <button
                    onClick={handleGoBack}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xl transition transform hover:scale-105 duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                >
                    &larr; Go Back
                </button>
            </div>
        );
    }

    // Determine the page transition classes based on direction and state
    const pageTransitionClasses = isTransitioning
        ? pageTurnDirection === 'forward'
            ? 'animate-page-turn-forward-out'
            : 'animate-page-turn-backward-out'
        : pageTurnDirection === 'forward'
            ? 'animate-page-turn-forward-in'
            : 'animate-page-turn-backward-in';


    return (
        <div ref={viewerRef} className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-6 transition-all duration-300 ease-in-out">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center drop-shadow-lg">
                {title || 'Premium Document Viewer'}
            </h2>

            {/* Controls Section - Using a flex container for better responsiveness */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 mb-8 p-4 bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-sm border border-gray-700 w-full max-w-6xl">

                {/* Go Back Button */}
                <button
                    onClick={handleGoBack}
                    className="flex-shrink-0 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg shadow-md hover:bg-gray-600 transition duration-300 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transform hover:scale-105"
                    aria-label="Go Back"
                    title="Go Back to previous page"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>

                {/* Full Screen Button */}
                <button
                    onClick={toggleFullScreen}
                    className="flex-shrink-0 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition duration-300 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transform hover:scale-105"
                    aria-label="Toggle Full Screen"
                    title="Toggle Full Screen (F)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5v4m0 0h-4m0-4l-5 5m-5 0h-4m0 0v4m0-4l5 5m5 0h4m0 0v-4m0 4l-5-5" />
                    </svg>
                    Full Screen
                </button>

                {/* Download Button */}
                {fileUrl && (
                    <a
                        href={fileUrl}
                        download={title ? `${title}.pdf` : 'document.pdf'}
                        className="flex-shrink-0 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition transform hover:scale-105 duration-300 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download the original PDF document"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l3-3m-3 3l-3-3m-3 8h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Download
                    </a>
                )}
            </div>

            {/* Document Canvas Container */}
            <div className={`relative border-4 border-indigo-600 dark:border-indigo-700 rounded-xl shadow-3xl overflow-hidden mb-8 max-w-full bg-gray-900 ${pageTransitionClasses}`}>
                <canvas
                    ref={canvasRef}
                    className="block max-w-full h-auto mx-auto"
                    aria-label={`PDF viewer for ${title || 'document'}`}
                />
                   {/* Optional: Add a subtle overlay during transition for premium feel */}
                {isTransitioning && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center text-indigo-400 font-bold text-2xl animate-pulse">
                        Turning Page...
                    </div>
                )}
            </div>

            {/* Navigation and Zoom Controls (Moved below the document) */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 mb-6 p-4 bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-sm border border-gray-700 w-full max-w-6xl">
                {/* Page Navigation */}
                <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-2 shadow-inner">
                    <button
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1 || isTransitioning}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                        aria-label="Previous Page"
                        title="Previous Page (Arrow Left)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-lg font-bold text-indigo-200 whitespace-nowrap px-2">
                        Page {pageNumber} of {numPages || '--'}
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={pageNumber >= numPages || isTransitioning}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                        aria-label="Next Page"
                        title="Next Page (Arrow Right)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-2 shadow-inner">
                    <button
                        onClick={zoomOut}
                        disabled={scale <= 0.5}
                        className="px-3 py-1.5 bg-sky-600 text-white rounded-md shadow-sm hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
                        aria-label="Zoom Out"
                        title="Zoom Out (-)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    <span className="text-lg font-bold text-sky-200 whitespace-nowrap px-2">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        disabled={scale >= 3.0}
                        className="px-3 py-1.5 bg-sky-600 text-white rounded-md shadow-sm hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
                        aria-label="Zoom In"
                        title="Zoom In (+)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <button
                        onClick={resetZoom}
                        className="px-3 py-1.5 bg-sky-700 text-white rounded-md shadow-sm hover:bg-sky-800 transition duration-300 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
                        aria-label="Reset Zoom"
                        title="Reset Zoom (0)"
                    >
                        100%
                    </button>
                </div>
            </div>

            {numPages && (
                <p className="text-xl font-medium text-gray-300 mb-6 drop-shadow-md">
                    You're on page {pageNumber} of {numPages}
                </p>
            )}
        </div>
    );
};

export default DocumentViewer;