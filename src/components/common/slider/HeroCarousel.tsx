"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { GridTileImage } from "@/components/theme/ui/grid/Tile";
import { Shimmer } from "@/components/common/Shimmer";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { AttributeOptionNode } from '@/types/types';

interface HeroCarouselProps {
  images: { src: string; altText: string }[];
  colorOptions?: AttributeOptionNode[];
  onColorChange?: (colorId: string) => void;
}

export default function HeroCarousel({
  images,
  colorOptions,
  onColorChange,
}: HeroCarouselProps) {
  const [current, setCurrent] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const prevSlide = () => {
    setIsLoading(true);
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const nextSlide = () => {
    setIsLoading(true);
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <PhotoProvider loop>
      <div className="group relative overflow-hidden">
        <PhotoView src={images[current]?.src as string}>
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="group relative h-full max-h-184.5 w-full overflow-hidden rounded-2xl cursor-pointer"
            style={{
              aspectRatio: "5/5"
            }}
          >
            <div className="relative h-full w-full">
              {isLoading && (
                <Shimmer
                  className="absolute inset-0 z-10 h-full w-full"
                  rounded="lg"
                />
              )}
              <Image
                fill
                alt={images[current]?.altText as string}
                className={`h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                priority={true}
                sizes="(min-width: 1024px) 66vw, 100vw"
                src={images[current]?.src as string}
                onLoadingComplete={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            </div>
          </motion.div>
        </PhotoView>

        {images?.length > 1 ? (
          <>
            {/* Left Arrow */}
            <button
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-800 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110 dark:bg-gray-800/80 dark:text-white dark:hover:bg-gray-800"
              onClick={prevSlide}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>

            {/* Right Arrow */}
            <button
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-800 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110 dark:bg-gray-800/80 dark:text-white dark:hover:bg-gray-800"
              onClick={nextSlide}
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </>
        ) : null}

        {/* Color Selector at Bottom - Always show if available */}
        {colorOptions && colorOptions.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex gap-2 rounded-full bg-white/90 px-4 py-2.5 backdrop-blur-sm shadow-lg dark:bg-gray-800/90">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onColorChange?.(String(color.id));
                  }}
                  className="h-8 w-8 rounded-full border-2 border-black/30 transition-transform hover:scale-110 hover:border-black/50 dark:border-white/30 dark:hover:border-white/50"
                  style={{
                    backgroundColor: color.swatchValue || '#ccc'
                  }}
                  title={color.label || color.adminName}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {images?.length > 1 ? (
        <ul className="fade-in my-3 flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden py-1 sm:my-7 lg:mb-0">
          {images.map((image, index) => {
            const isActive = index === current;
            // Skip the current image to avoid duplication
            if (index === current) return null;

            return (
              <li
                key={image.src}
                className="relative aspect-square w-16 md:w-32 flex-shrink-0"
              >
                <PhotoView src={image.src}>
                  <button
                    className="h-full w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrent(index);
                    }}
                  >
                    <GridTileImage
                      active={isActive}
                      alt={image.altText}
                      fill
                      objectFit="cover"
                      src={image.src}
                    />
                  </button>
                </PhotoView>
              </li>
            );
          })}
        </ul>

      ) : null}
    </PhotoProvider>
  );
}
