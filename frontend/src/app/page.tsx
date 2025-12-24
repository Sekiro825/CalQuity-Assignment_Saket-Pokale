'use client';

// Polyfill for react-pdf in Next.js SSR
if (typeof Promise.withResolvers === 'undefined') {
    if (typeof window !== 'undefined') {
        // @ts-expect-error polyfill
        window.Promise.withResolvers = function () {
            let resolve, reject;
            const promise = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });
            return { promise, resolve, reject };
        };
    } else {
        // @ts-expect-error polyfill
        global.Promise.withResolvers = function () {
            let resolve, reject;
            const promise = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });
            return { promise, resolve, reject };
        };
    }
}

if (typeof global.DOMMatrix === 'undefined') {
    // @ts-expect-error polyfill
    (global as any).DOMMatrix = class DOMMatrix {
        constructor() { }
        translate() { return this; }
        scale() { return this; }
    };
}
import { useAppStore } from '@/store/useAppStore';
import ChatInterface from '@/components/chat/ChatInterface';
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('@/components/pdf/PdfViewer'), {
    ssr: false,
    loading: () => <div className="p-4">Loading PDF Viewer...</div>
});
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const { isPdfOpen } = useAppStore();

    return (
        <main className="flex h-screen bg-white overflow-hidden">
            {/* Sidebar (Optional - Placeholder for history) */}
            <div className="hidden md:flex w-16 lg:w-64 flex-col border-r bg-gray-50 p-4">
                <div className="font-bold text-xl text-teal-700 mb-8 flex items-center gap-2">
                    <div className="w-6 h-6 bg-teal-700 rounded-sm" />
                    <span className="hidden lg:inline">CalQuity</span>
                </div>
                <div className="flex-1">
                    <button className="flex items-center gap-3 w-full p-2 bg-white border shadow-sm rounded-full text-sm font-medium text-gray-600 hover:shadow-md transition-shadow">
                        <span className="text-lg">+</span>
                        <span className="hidden lg:inline">New Thread</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex relative">
                <motion.div
                    className="flex-1 h-full min-w-0"
                    animate={{ width: isPdfOpen ? '60%' : '100%' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <ChatInterface />
                </motion.div>

                {/* PDF Viewer Panel (Slide in) */}
                <AnimatePresence>
                    {isPdfOpen && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute right-0 top-0 h-full w-[40%] shadow-2xl z-20"
                        >
                            <PdfViewer />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
