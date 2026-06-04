import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface SlideViewerProps {
  pdfFile: string;
}

export default function SlideViewer({ pdfFile }: SlideViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(
    typeof window !== "undefined" ? window.innerWidth - 120 : undefined,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentPage((p) => Math.min(numPages, p + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [numPages]);

  const goToPrev = useCallback(
    () => setCurrentPage((p) => Math.max(1, p - 1)),
    [],
  );
  const goToNext = useCallback(
    () => setCurrentPage((p) => Math.min(numPages, p + 1)),
    [numPages],
  );

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToNext() : goToPrev();
    }
    touchStartX.current = null;
  }

  return (
    <div className="flex w-full select-none flex-col">
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex flex-1 flex-col items-center overflow-hidden"
      >
        <Document
          file={`/pdf/${pdfFile}`}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<p className="py-8 text-gray-500">読み込み中...</p>}
          error={
            <p className="py-8 text-red-500">PDFの読み込みに失敗しました</p>
          }
        >
          <Page
            pageNumber={currentPage}
            width={containerWidth}
            renderAnnotationLayer
            renderTextLayer
          />
        </Document>
      </div>

      <div className="mt-2 flex w-full items-center justify-between">
        <button
          onClick={goToPrev}
          disabled={currentPage <= 1}
          aria-label="前のページ"
          className="cursor-pointer rounded-xl bg-gray-200 px-3 py-1 text-2xl transition-opacity hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-20"
        >
          ‹
        </button>
        {numPages > 0 && (
          <p className="text-sm text-gray-500">
            {currentPage} / {numPages}
          </p>
        )}
        <button
          onClick={goToNext}
          disabled={currentPage >= numPages}
          aria-label="次のページ"
          className="cursor-pointer rounded-xl bg-gray-200 px-3 py-1 text-2xl transition-opacity hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-20"
        >
          ›
        </button>
      </div>
    </div>
  );
}
