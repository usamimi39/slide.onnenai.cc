import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface Props {
  pdfUrl: string;
}

export default function SlideThumbnail({ pdfUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(Math.floor(entries[0].contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const placeholder = (
    <div style={{ width: "100%", aspectRatio: "16/9", background: "#f5f5f5", borderRadius: 8 }} />
  );

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {width === null ? (
        placeholder
      ) : error ? (
        <div
          style={{
            width,
            height: Math.round(width * 0.5625),
            borderRadius: 8,
            background: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#aaa",
            fontSize: 13,
          }}
        >
          No Preview
        </div>
      ) : (
        <Document
          file={pdfUrl}
          onLoadError={() => setError(true)}
          loading={<div style={{ width, height: Math.round(width * 0.5625), background: "#f5f5f5", borderRadius: 8 }} />}
        >
          <Page
            pageNumber={1}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      )}
    </div>
  );
}
