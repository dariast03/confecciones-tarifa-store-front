"use client";

import { FC, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shimmer } from "@/components/common/Shimmer";

interface ImageCarouselProps {
    options: {
        images: {
            image: string;
            link: string;
            title?: string;
        }[];
    };
}

const ImageCarousel: FC<ImageCarouselProps> = ({ options }) => {
    const { images } = options;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);

    const getFullImageUrl = useCallback((imagePath: string): string => {
        if (!imagePath) return "";
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        const backendUrl = process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT;
        if (!backendUrl) return "";

        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        const cleanBase = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

        return `${cleanBase}/${cleanPath}`;
    }, []);

    const startAutoplay = useCallback(() => {
        if (!images || images.length <= 1) return;

        autoplayRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
    }, [images]);

    const stopAutoplay = useCallback(() => {
        if (autoplayRef.current) {
            clearInterval(autoplayRef.current);
            autoplayRef.current = null;
        }
    }, []);

    const handleDotClick = useCallback((index: number) => {
        setCurrentIndex(index);
        setIsPaused(true);
        stopAutoplay();

        setTimeout(() => {
            setIsPaused(false);
        }, 10000);
    }, [stopAutoplay]);

    useEffect(() => {
        if (!isPaused && images && images.length > 1) {
            startAutoplay();
        }
        return () => stopAutoplay();
    }, [isPaused, images, startAutoplay, stopAutoplay]);

    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const mouseStartX = useRef<number | null>(null);
    const mouseEndX = useRef<number | null>(null);

    if (!Array.isArray(images) || images.length === 0) return null;

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        touchEndX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = () => {
        if (touchStartX.current !== null && touchEndX.current !== null) {
            const distance = touchStartX.current - touchEndX.current;
            if (distance > 50) {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            } else if (distance < -50) {
                setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
            }
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        mouseStartX.current = e.clientX;
    };
    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        mouseEndX.current = e.clientX;
        if (mouseStartX.current !== null && mouseEndX.current !== null) {
            const distance = mouseStartX.current - mouseEndX.current;
            if (distance > 50) {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            } else if (distance < -50) {
                setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
            }
        }
        mouseStartX.current = null;
        mouseEndX.current = null;
    };

    return (
        <section className="w-full h-[calc(100vh-240px)]  lg:h-[calc(100vh-78px)]">
            <div
                className="group relative w-full overflow-hidden h-full"
                style={{
                    //position: 'relative',
                    width: '100%',
                    //height: "93.8vh"
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                {images.map((img, index) => {
                    const imageUrl = getFullImageUrl(img.image);
                    const isActive = index === currentIndex;
                    const altText = img.title || `Banner ${index + 1}`;
                    const title = img.title || `Descubre Nuestra Colección`;

                    return (
                        <div
                            key={index}
                            className={`absolute h-full inset-0 transition-opacity duration-700 ${isActive ? "opacity-100 z-0" : "opacity-0 z-0"}`}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        >
                            <div className="relative h-full w-full">
                                <Shimmer className="h-full w-full" />
                                <Image
                                    src={imageUrl}
                                    alt={altText}
                                    fill
                                    className="object-cover z-0 object-[900]"
                                    priority={index === 0}
                                    sizes="100vw"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />

                                {/* Content Overlay */}
                                <div className="absolute inset-0 z-20 flex items-center">
                                    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-16">
                                        <div className="max-w-2xl">
                                            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                                {title}
                                            </h1>
                                            <p className={`text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 transition-all duration-700 delay-100 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                                Encuentra la calidad y estilo que buscas en cada prenda
                                            </p>
                                            <div className={`transition-all duration-700 delay-200 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                                <Link
                                                    href="/search"
                                                    className="inline-flex items-center justify-center px-8 py-4 text-base sm:text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                                                >
                                                    Comprar Ahora
                                                    <svg
                                                        className="ml-2 w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                                                        />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm md:bottom-6">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${index === currentIndex
                                    ? "w-8 bg-white"
                                    : "w-2.5 bg-white/50 hover:bg-white/80 hover:w-4"
                                    }`}
                                type="button"
                                aria-label={`Ir a la diapositiva ${index + 1}`}
                                aria-current={index === currentIndex}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ImageCarousel;