"use client";

import { FC, JSX } from "react";
import { OptionDataTypes } from "@/types/types";
import { ThemeCustomizationTranslationNode } from "@/types/theme/theme-customization";
import { usePathname } from "next/navigation";
import { safeParse } from "@utils/helper";
import {
  TruckIcon,
  ArrowPathRoundedSquareIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

export interface ServiceContentDataTypes {
  name?: string;
  serviceData: ThemeCustomizationTranslationNode[];
}

export interface ServiceContenRenderTypes {
  serviceList: {
    options: OptionDataTypes;
  };
}

const ServiceContent: FC<ServiceContentDataTypes> = ({ serviceData }) => {
  return serviceData?.slice(0, 1)?.map((service, index: number) => {
    const options =
      typeof service.options === "string"
        ? safeParse(service.options)
        : service.options;

    return <ServiceCarouselRender key={index} serviceList={{ options }} />;
  });
};

const iconMapping: Record<string, JSX.Element> = {
  "icon-truck": <TruckIcon className="w-12 h-12 stroke-[1.5] text-blue-600 dark:text-blue-400" />,
  "icon-product": <ArrowPathRoundedSquareIcon className="w-12 h-12 stroke-[1.5] text-blue-600 dark:text-blue-400" />,
  "icon-dollar-sign": <ShieldCheckIcon className="w-12 h-12 stroke-[1.5] text-blue-600 dark:text-blue-400" />,
  "icon-support": <UserGroupIcon className="w-12 h-12 stroke-[1.5] text-blue-600 dark:text-blue-400" />,
};

const ServiceCarouselRender: FC<ServiceContenRenderTypes> = ({
  serviceList,
}) => {
  const { options } = serviceList;
  const { services } = options;
  const pathname = usePathname();

  // Don't render service content on customer auth pages
  if (
    pathname === "/customer/login" ||
    pathname === "/customer/register" ||
    pathname === "/customer/forget-password"
  ) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-6 max-lg:flex-wrap max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-8 max-md:text-center md:gap-10 lg:gap-20">
      {services?.map((list, index: number) => {
        const iconKey = list?.service_icon;

        return (
          <div
            key={index}
            className="group flex flex-col items-center justify-center gap-3 max-md:gap-3 max-md:px-4 max-md:py-2 transition-transform duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
              {iconMapping[iconKey]}
            </div>
            <p className="mt-2.5 max-w-[217px] text-center font-outfit text-sm font-medium max-md:mt-0 max-md:text-base max-sm:text-xs text-neutral-700 dark:text-neutral-300">
              {list.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ServiceContent;
