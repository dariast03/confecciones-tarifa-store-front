"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { CatalogProductCard } from "@/components/catalog/export/CatalogProductCard";
import { getCatalogConfig } from "@/config/catalog.config";
import { baseUrl, getImageUrl, NOT_IMAGE } from "@/utils/constants";

export default function CatalogExportPage() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const catalogRef = useRef<HTMLDivElement>(null);

    const config = getCatalogConfig(searchParams);

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const response = await fetch("/api/catalog/products");
                const data = await response.json();
                setProducts(data.products || []);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    const waitForImages = (element: HTMLElement): Promise<void> => {
        const images = element.querySelectorAll('img');
        const promises = Array.from(images).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve(); // Continue even if image fails
                // Timeout after 5 seconds
                setTimeout(() => resolve(), 5000);
            });
        });
        return Promise.all(promises).then(() => { });
    };

    const generatePDF = async () => {
        if (!catalogRef.current || products.length === 0) return;

        setGenerating(true);
        setProgress(0);

        try {
            // PDF configuration - square format 1080x1080px
            const pageWidth = 1080;
            const pageHeight = 1080;
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [pageWidth, pageHeight],
                compress: true,
            });

            const cards = catalogRef.current.querySelectorAll(".catalog-card");

            for (let i = 0; i < cards.length; i++) {
                const card = cards[i] as HTMLElement;

                // Update progress
                setProgress(Math.round(((i + 1) / cards.length) * 100));

                // Wait for all images in this card to load
                await waitForImages(card);

                // Small delay to ensure rendering is complete
                await new Promise(resolve => setTimeout(resolve, 200));

                // Capture the card as canvas - capture the actual card element
                const canvas = await html2canvas(card, {
                    scale: 1,
                    width: pageWidth,
                    height: pageHeight,
                    backgroundColor: "#ffffff",
                    logging: true,
                    useCORS: true,
                    allowTaint: false,
                });

                console.log(`Card ${i + 1} captured:`, canvas.width, 'x', canvas.height);

                // Convert canvas to image
                const imgData = canvas.toDataURL("image/jpeg", 0.95);

                // Add new page if not first
                if (i > 0) {
                    pdf.addPage([pageWidth, pageHeight]);
                }

                // Add image to PDF - exact fit, no margins
                pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);
            }

            // Save PDF
            const fileName = `catalogo-${config.businessName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
            pdf.save(fileName);

            setProgress(100);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error al generar el PDF. Por favor intenta de nuevo.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">
                        Cargando productos...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            {/* Controls Header */}
            <div className="max-w-7xl mx-auto px-4 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Generador de Catálogo
                            </h1>
                            <p className="text-gray-600">
                                {products.length} productos listos para exportar
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Formato: 1080x1080px (Instagram/Facebook)
                            </p>
                        </div>
                        <button
                            onClick={generatePDF}
                            disabled={generating || products.length === 0}
                            className={`px-8 py-4 rounded-lg font-bold text-white text-lg transition-all transform hover:scale-105 ${generating || products.length === 0
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
                                }`}
                        >
                            {generating ? (
                                <span className="flex items-center gap-3">
                                    <svg
                                        className="animate-spin h-6 w-6"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Generando {progress}%
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Generar PDF
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Progress bar */}
                    {generating && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-red-600 to-red-700 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Config Info */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                        📋 Configuración Actual:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-blue-700">
                        <div>
                            <strong>Precio:</strong> {config.showPrice ? "Visible" : "Oculto"}
                        </div>
                        <div>
                            <strong>WhatsApp:</strong> {config.whatsappNumber}
                        </div>
                        <div>
                            <strong>Instagram:</strong> {config.instagram}
                        </div>
                        <div>
                            <strong>Web:</strong> {config.website}
                        </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                        💡 Puedes personalizar estos valores usando parámetros URL: ?showPrice=false&whatsappNumber=123456
                    </p>
                </div>

            </div>

            {/* Hidden Full-Size Cards for PDF Capture */}
            <div 
                ref={catalogRef}
                style={{
                    position: 'fixed',
                    left: '-99999px',
                    top: '0',
                    pointerEvents: 'none',
                }}
            >
                {products.map((product: any, index: number) => {
                    const imageUrl = getImageUrl(
                        product?.baseImageUrl,
                        baseUrl,
                        NOT_IMAGE
                    ) || NOT_IMAGE;
                    return (
                        <div key={index} className="catalog-card">
                            <CatalogProductCard
                                product={product}
                                config={config}
                                imageUrl={imageUrl}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Preview Grid - Also used for PDF generation */}
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Vista Previa del Catálogo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: any, index: number) => {
                        const imageUrl = getImageUrl(
                            product?.baseImageUrl,
                            baseUrl,
                            NOT_IMAGE
                        ) || NOT_IMAGE;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105"
                            >
                                <div style={{ width: '1080px', height: '1080px', transformOrigin: 'top left', transform: 'scale(0.35)' }}>
                                    <CatalogProductCard
                                        product={product}
                                        config={config}
                                        imageUrl={imageUrl}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
