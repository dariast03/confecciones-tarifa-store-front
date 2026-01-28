"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { ConfigurableProductIndexData } from "@/types/types";
import { useAddProduct } from "@utils/hooks/useAddToCart";
import LoadingDots from "@components/common/icons/LoadingDots";
import { getVariantInfo } from "@utils/hooks/useVariantInfo";
import { safeParse } from "@utils/helper";

// WhatsApp Icon Component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function SubmitButton({
  selectedVariantId,
  pending,
  type,
  isSaleable,
}: {
  selectedVariantId: boolean;
  pending: boolean;
  type: string;
  isSaleable: string;
}) {
  const buttonClasses =
    "relative flex w-full max-w-[16rem] cursor-pointer h-fit items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-wait opacity-60";

  if (!isSaleable || isSaleable === "") {
    return (
      <button
        aria-disabled
        aria-label="Agotado"
        type="button"
        disabled
        className={clsx(buttonClasses, " opacity-60 !cursor-not-allowed")}
      >
        Agotado
      </button>
    );
  }

  if (!selectedVariantId && type === "configurable") {
    return (
      <button
        aria-disabled
        aria-label="Por favor selecciona una opción"
        type="button"
        disabled={!selectedVariantId}
        className={clsx(buttonClasses, " opacity-60 !cursor-not-allowed")}
      >
        Agregar al Carrito
      </button>
    );
  }

  return (
    <button
      aria-disabled={pending}
      aria-label="Agregar al Carrito"
      type="submit"
      className={clsx(buttonClasses, {
        "hover:opacity-90": true,
        [disabledClasses]: pending,
      })}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (pending) e.preventDefault();
      }}
    >
      <div className="absolute left-0 ml-4">
        {pending ? <LoadingDots className="mb-3 bg-white" /> : ""}
      </div>
      Agregar al Carrito
    </button>
  );
}

export function AddToCart({
  productSwatchReview,
  index,
  productId,
  userInteracted,
}: {
  productSwatchReview: any;
  productId: string;
  index: ConfigurableProductIndexData[];
  userInteracted: boolean;
}) {
  const isSaleable = productSwatchReview?.isSaleable || "";
  const { onAddToCart, isCartLoading } = useAddProduct();
  const { handleSubmit, setValue, control, register } = useForm({
    defaultValues: {
      quantity: 1,
      isBuyNow: false,
    },
  });

  const quantity = useWatch({
    control,
    name: "quantity",
  });

  const increment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue("quantity", Number(quantity) + 1);
  };

  const decrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue("quantity", Math.max(1, Number(quantity) - 1));
  };

  const searchParams = useSearchParams();
  const type = productSwatchReview?.type;

  const superAttributes = productSwatchReview?.superAttributeOptions
    ? safeParse(productSwatchReview.superAttributeOptions)
    : productSwatchReview?.superAttributes?.edges?.map(
      (e: { node: any }) => e.node,
    ) || [];

  const isConfigurable = superAttributes.length > 0;

  const { productid: selectedVariantId, Instock: checkStock } = getVariantInfo(
    isConfigurable,
    searchParams.toString(),
    superAttributes,
    JSON.stringify(index),
  );
  const buttonStatus = !!selectedVariantId;

  const actionWithVariant = async (data: any) => {
    const pid =
      type === "configurable"
        ? String(selectedVariantId)
        : (String(productId).split("/").pop() ?? "");
    onAddToCart({
      productId: pid,
      quantity: data.quantity,
    });
  };

  // WhatsApp functionality
  const handleWhatsAppConsulta = () => {
    const productName = productSwatchReview?.name || "Producto";
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';

    // Get selected variant details
    const selectedColor = searchParams.get("color");
    const selectedSize = searchParams.get("size");

    let variantDetails = "";

    if (selectedColor || selectedSize) {
      const colorAttribute = superAttributes.find((attr: any) => attr.code === "color");
      const sizeAttribute = superAttributes.find((attr: any) => attr.code === "size");

      const colorName = colorAttribute?.options?.find((opt: any) => String(opt.id) === selectedColor)?.label;
      const sizeName = sizeAttribute?.options?.find((opt: any) => String(opt.id) === selectedSize)?.label;

      if (colorName) variantDetails += `\nColor: ${colorName}`;
      if (sizeName) variantDetails += `\nTalla: ${sizeName}`;
    }

    const message = `Hola! Estoy interesado en consultar sobre este producto:

*${productName}*${variantDetails}
${quantity > 1 ? `Cantidad: ${quantity}` : ''}

Link: ${productUrl}

Podrian darme mas informacion?`;

    const phoneNumber = "59168686060";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {!checkStock && type === "configurable" && userInteracted && (
        <div className="gap-1 px-2 py-1 my-2 font-bold">
          <h1>SIN STOCK DISPONIBLE</h1>
        </div>
      )}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(actionWithVariant)}>
        <div className="flex gap-x-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center rounded-full border-2 border-blue-500">
              <div
                aria-label="Disminuir cantidad"
                role="button"
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-l-full text-gray-600 transition-colors hover:text-gray-800 dark:text-white hover:dark:text-white/[80%]"
                onClick={decrement}
              >
                <MinusIcon className="h-4 w-4" />
              </div>

              <input
                type="hidden"
                {...register("quantity", { valueAsNumber: true })}
              />

              <div className="flex h-12 min-w-[3rem] items-center justify-center px-4 font-medium text-gray-800 dark:text-white">
                {quantity}
              </div>

              <div
                aria-label="Aumentar cantidad"
                role="button"
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-r-full text-gray-600 transition-colors hover:text-gray-800 dark:text-white hover:dark:text-white/[80%]"
                onClick={increment}
              >
                <PlusIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
          <SubmitButton
            pending={isCartLoading}
            selectedVariantId={buttonStatus}
            type={type || ""}
            isSaleable={isSaleable}
          />
        </div>

        {/* WhatsApp Button */}
        <button
          type="button"
          onClick={handleWhatsAppConsulta}
          className="flex w-full md:max-w-[16rem] items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-4 text-white transition-all duration-200 hover:bg-green-600 hover:scale-105"
        >
          <WhatsAppIcon className="h-5 w-5" />
          <span className="font-medium">Consultar por WhatsApp</span>
        </button>
      </form>
    </>
  );
}
