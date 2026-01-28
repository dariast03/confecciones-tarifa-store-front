"use client";

import { AttributeOptionNode } from "@/types/types";
import { createUrl } from "@/utils/helper";
import { getColorHex } from "@/utils/colorMap";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckIcon } from "@heroicons/react/24/solid";

interface ColorSelectorProps {
    attributeCode: string;
    options: AttributeOptionNode[];
    setUserInteracted: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ColorSelector({
    attributeCode,
    options,
    setUserInteracted,
}: ColorSelectorProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    return (
        <div className="flex flex-wrap gap-3">
            {options.map((node) => {
                const isActive = searchParams.get(attributeCode) === String(node.id);
                const isAvailable = node?.isValid;
                const nextParams = new URLSearchParams(searchParams.toString());
                nextParams.set(attributeCode, String(node.id));
                const optionUrl = createUrl(pathname, nextParams);
                const colorHex = getColorHex(node.label || node.adminName || "");
                const isWhite = colorHex === "#FFFFFF";

                return (
                    <button
                        key={node.id}
                        disabled={!isAvailable}
                        onClick={() => {
                            if (!isAvailable) return;
                            router.replace(optionUrl, { scroll: false });
                            setUserInteracted(true);
                        }}
                        className={clsx(
                            "group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ease-in-out",
                            {
                                "cursor-pointer hover:scale-110": isAvailable && !isActive,
                                "cursor-default ring-2 ring-offset-2 ring-blue-600 scale-110": isActive,
                                "cursor-not-allowed opacity-40": !isAvailable,
                            }
                        )}
                        title={node.label || node.adminName}
                        aria-label={`Select ${node.label || node.adminName} color`}
                    >
                        {/* Color circle */}
                        <div
                            className={clsx(
                                "h-10 w-10 rounded-full transition-all duration-200",
                                {
                                    "ring-1 ring-gray-300": isWhite,
                                }
                            )}
                            style={{ backgroundColor: colorHex }}
                        />

                        {/* Check icon when selected */}
                        {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <CheckIcon
                                    className={clsx("h-5 w-5", {
                                        "text-white drop-shadow-lg": !isWhite,
                                        "text-gray-800": isWhite,
                                    })}
                                />
                            </div>
                        )}

                        {/* Strikethrough for unavailable */}
                        {!isAvailable && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-px w-full rotate-45 bg-gray-400" />
                            </div>
                        )}

                        {/* Tooltip with color name */}
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
                            {node.label || node.adminName}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
