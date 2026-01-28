import { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { graphqlRequest } from "../../lib/graphql-fetch";
import { GET_HOME_CATEGORIES } from "@/graphql/catelog/queries/HomeCategories";
import { NOT_IMAGE } from "@/utils/constants";

interface CategoryCarouselProps {
  options: {
    filters: Record<string, any>;
  };
}

const CategoryCarousel: FC<CategoryCarouselProps> = async ({
  options: _options,
}) => {
  try {
    const data = await graphqlRequest<any>(
      GET_HOME_CATEGORIES,
      {},
      {
        tags: ["categories"],
        life: "days",
      }
    );

    const categories: any[] =
      data?.categories?.edges?.map((edge: any) => edge.node) || [];

    const topCategories = categories
      .filter((category: any) => category.id !== "1")
      .filter((category: any) => ["Hombre", "Mujer", "Niños"].includes(category.translation.name))
      .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
      .slice(0, 4);

    if (!topCategories.length) return null;

    return (
      <section className="pt-8 sm:pt-12 lg:pt-20 container mx-auto px-4">
        <div className="md:max-w-4.5xl mx-auto mb-10 sm:mb-16 w-auto text-center md:px-36">
          <h2 className="mb-2 text-xl md:text-4xl font-semibold">
            Comprar por Categoría
          </h2>
          <p className="text-sm md:text-base font-normal text-black/60 dark:text-neutral-300">
            ¡Descubre las últimas tendencias! Productos frescos recién añadidos—compra nuevos estilos, tecnología y esenciales antes de que se acaben.
          </p>
        </div>

        <div className="w-full">
          <ul className="flex flex-wrap justify-center items-start gap-6 sm:gap-8 xl:gap-12">
            <li className="group flex flex-col items-center basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Link
                className="flex flex-col items-center w-full"
                href={`/search`}
                aria-label={`Comprar todas las categorías`}
              >
                <div className="relative w-full aspect-square max-w-[280px] mb-4 overflow-hidden rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Image
                    fill
                    alt={`Imagen de todas las categorías`}
                    className="object-cover"
                    src={NOT_IMAGE}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                  />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-center text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Todas las Categorías
                </h3>
              </Link>
            </li>

            {topCategories.map((category: any) => (
              <li
                key={category.id}
                className="group flex flex-col items-center basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <Link
                  className="flex flex-col items-center w-full"
                  href={`/search/${category.translation.slug}`}
                  aria-label={`Comprar categoría ${category.translation.name}`}
                >
                  <div className="relative w-full aspect-square max-w-[280px] mb-4 overflow-hidden rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <Image
                      fill
                      alt={`Imagen de la categoría ${category.translation.name}`}
                      className="object-cover"
                      src={category.logoUrl || NOT_IMAGE}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-center text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {category.translation.name}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
};

export default CategoryCarousel;
