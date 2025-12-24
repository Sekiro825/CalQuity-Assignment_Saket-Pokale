'use client';
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useAppStore } from '@/store/useAppStore';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer() {
    const { currentPdfUrl, setPdfOpen, activeCitation } = useAppStore();
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState(1.0);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    useEffect(() => {
        if (activeCitation) {
            setPageNumber(activeCitation.page_number);
        }
    }, [activeCitation]);

    return (
        <div className="flex flex-col h-full bg-gray-100 border-l border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b">
                <h3 className="font-medium text-gray-800">Source Document</h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1 hover:bg-gray-100 rounded">
                        <ZoomOut size={18} />
                    </button>
                    <span className="text-xs text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-1 hover:bg-gray-100 rounded">
                        <ZoomIn size={18} />
                    </button>
                    <div className="w-[1px] h-6 bg-gray-200 mx-2" />
                    <button onClick={() => setPdfOpen(false)} className="p-1 hover:bg-red-50 hover:text-red-500 rounded">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Viewer */}
            <div className="flex-1 overflow-auto p-4 flex justify-center">
                <Document
                    file={currentPdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="shadow-lg"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        customTextRenderer={({ str, itemIndex }) => {
                            // visual highlighting logic would go here
                            // simplistic string match:
                            if (activeCitation && str.includes(activeCitation.quote.substring(0, 20))) {
                                return `<mark>${str}</mark>`;
                            }
                            return str;
                        }}
                    />
                </Document>
            </div>

            {/* Footer Nav */}
            <div className="p-2 bg-white border-t flex justify-center items-center gap-4">
                <button
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(prev => prev - 1)}
                    className="p-1 disabled:opacity-30"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600">
                    Page {pageNumber} of {numPages}
                </span>
                <button
                    disabled={pageNumber >= numPages}
                    onClick={() => setPageNumber(prev => prev + 1)}
                    className="p-1 disabled:opacity-30"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
