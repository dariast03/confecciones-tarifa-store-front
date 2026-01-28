"use client";
import clsx from "clsx";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/drawer";
import { useDisclosure } from "@heroui/react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { DEFAULT_OPTION } from "@/utils/constants";
import { useAppSelector } from "@/store/hooks";
import OpenCart from "./OpenCart";
import { Price } from "../theme/ui/Price";
import CloseCart from "../common/icons/cart/CloseCart";
import { DeleteItemButton } from "../common/icons/cart/DeleteItemButton";
import { EditItemQuantityButton } from "../common/icons/cart/EditItemQuantityButton";
import { useCartDetail } from "@utils/hooks/useCartDetail";
import Image from "next/image";
import { NOT_IMAGE } from "@utils/constants";
import { isObject } from "@utils/type-guards";
import LoadingDots from "@components/common/icons/LoadingDots";
import { useFormStatus } from "react-dom";
import { redirectToCheckout } from "@/utils/actions";
import { EMAIL, getLocalStorage } from "@/store/local-storage";
import Link from "next/link";
import { createUrl, isCheckout, useAddressesFromApi, safeParse } from "@utils/helper";
import { useMediaQuery } from "@utils/hooks/useMediaQueryHook";
import { useState, useEffect } from "react";

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


type MerchandiseSearchParams = {
  [key: string]: string;
};
export default function CartModal({
  children,
  className,
  onClick,
  onClose: onCloseProp,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onClose?: () => void;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading } = useCartDetail();
  const cartDetail = useAppSelector((state) => state.cartDetail);
  const { billingAddress } = useAddressesFromApi();
  const cart = Array.isArray(cartDetail?.cart?.items?.edges)
    ? cartDetail?.cart?.items?.edges
    : [];
  const cartObj: any = cartDetail?.cart ?? {};
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // WhatsApp functionality
  const handleWhatsAppOrder = () => {
    if (!cart || cart.length === 0) return;

    let itemsList = "";
    let total = 0;

    cart.forEach((item: any, index: number) => {
      const itemPrice = parseFloat(item?.node?.price || 0);
      const quantity = item?.node?.quantity || 1;
      const subtotal = itemPrice * quantity;
      total += subtotal;

      itemsList += `${index + 1}. ${item?.node?.name}
   - SKU: ${item?.node?.sku}
   - Cantidad: ${quantity}
   - Precio unitario: Bs ${itemPrice.toFixed(2)}
   - Subtotal: Bs ${subtotal.toFixed(2)}

`;
    });

    const message = `Hola! Estoy interesado en adquirir los siguientes productos:

${itemsList}*Total del pedido: Bs ${total.toFixed(2)}*

Me gustaria coordinar la compra de estos articulos.

Quedo atento a su respuesta.`;

    const phoneNumber = "59168686060";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleOpen = () => {
    onOpen();
    if (onClick) {
      onClick();
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange();
    if (!open && onCloseProp) {
      onCloseProp();
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Abrir carrito"
        className={clsx(className, isMounted && isLoading ? "cursor-wait" : "cursor-pointer")}
        disabled={isMounted && isLoading}
        onClick={handleOpen}
      >
        {children ? (
          children
        ) : (
          <OpenCart quantity={cartDetail?.cart?.itemsQty} />
        )}
      </button>

      {
        isDesktop ? (
          <Drawer
            backdrop="blur"
            hideCloseButton={true}
            classNames={{ backdrop: "bg-white/50 dark:bg-black/50" }}
            isOpen={isOpen}
            radius="none"
            onOpenChange={handleOpenChange}
          >
            <DrawerContent>
              {(onClose) => (
                <>
                  <DrawerHeader className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold">Mi Carrito</p>
                      <button
                        aria-label="Cerrar carrito"
                        className="cursor-pointer"
                        onClick={onClose}
                      >
                        <CloseCart />
                      </button>
                    </div>
                  </DrawerHeader>

                  <DrawerBody className="py-0">
                    {(cart?.length === 0) ? (
                      <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                        <ShoppingCartIcon className="h-16" />
                        <p className="mt-6 text-center text-2xl font-bold">
                          Tu carrito está vacío.
                        </p>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col justify-between overflow-hidden">
                        <ul className="my-0 flex-grow overflow-auto py-0">
                          {Array.isArray(cart) &&
                            cart && cart?.map((item: any, i: number) => {
                              const merchandiseSearchParams =
                                {} as MerchandiseSearchParams;

                              const merchandiseUrl = createUrl(
                                `/product/${item?.node.productUrlKey}`,
                                new URLSearchParams(merchandiseSearchParams)
                              );
                              const baseImage: any = safeParse(item?.node?.baseImage);

                              return (
                                <li key={i} className="flex w-full flex-col">
                                  <div className="flex w-full flex-row justify-between gap-3 px-1 py-4">
                                    <Link
                                      className="z-30 flex flex-row space-x-4"
                                      aria-label={`${item?.node?.name}`}
                                      href={merchandiseUrl}
                                      onClick={onClose}
                                    >
                                      <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                        <Image
                                          alt={
                                            item?.node?.baseImage ||
                                            item?.product?.name
                                          }
                                          className="h-full w-full object-cover"
                                          height={64}
                                          src={baseImage?.small_image_url || ""}
                                          width={74}
                                          onError={(e) =>
                                            (e.currentTarget.src = NOT_IMAGE)
                                          }
                                        />
                                      </div>

                                      <div className="flex flex-1 flex-col text-base">
                                        <span className="line-clamp-1 font-outfit text-base font-medium">
                                          {item?.node?.name}
                                        </span>
                                        {item.name !== DEFAULT_OPTION ? (
                                          <p className="text-sm lowercase line-clamp-1 text-black dark:text-neutral-400">
                                            {item?.node?.sku}
                                          </p>
                                        ) : null}
                                      </div>
                                    </Link>

                                    <div className="flex h-16 flex-col justify-between">
                                      <Price
                                        amount={item?.node?.price}
                                        className="flex justify-end space-y-2 text-right font-outfit text-base font-medium"
                                        currencyCode={"BOB"}
                                      />
                                      <div className="flex items-center gap-x-2">
                                        <DeleteItemButton item={item} />
                                        <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                          <EditItemQuantityButton
                                            item={item}
                                            type="minus"
                                          />
                                          <p className="w-6 text-center">
                                            <span className="w-full text-sm">
                                              {item?.node?.quantity}
                                            </span>
                                          </p>
                                          <EditItemQuantityButton
                                            item={item}
                                            type="plus"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                        </ul>

                        <div className="border-0 border-t border-solid border-neutral-200 dark:border-dark-grey py-4 text-sm text-neutral-500 dark:text-neutral-400">
                          {(cartDetail as any)?.cart?.taxAmount > 0 && <div className="mb-3 flex items-center justify-between">
                            <p className="text-base font-normal text-black/[60%] dark:text-white">
                              Impuestos
                            </p>
                            <Price
                              amount={(cartDetail as any)?.cart?.taxAmount}
                              className="text-right text-base font-medium text-black dark:text-white"
                              currencyCode={"BOB"}
                            />
                          </div>}

                          <div className="mb-3 flex items-center justify-between pb-1">
                            <p className="text-base font-normal text-black/[60%] dark:text-white">
                              Total
                            </p>
                            <Price
                              amount={(cartDetail as any)?.cart?.grandTotal}
                              className="text-right text-base font-medium text-black dark:text-white"
                              currencyCode={"BOB"}
                            />
                          </div>
                        </div>

                        {/* WhatsApp Button */}
                        <button
                          type="button"
                          onClick={handleWhatsAppOrder}
                          className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 text-white transition-all duration-200 hover:bg-green-600"
                        >
                          <WhatsAppIcon className="h-5 w-5" />
                          <span className="font-medium">Ordenar por WhatsApp</span>
                        </button>

                        <form action={redirectToCheckout}>
                          <CheckoutButton
                            cartDetails={cartObj?.items?.edges ?? []}
                            isGuest={cartObj?.isGuest}
                            isEmail={cartObj?.customerEmail ?? getLocalStorage(EMAIL)}
                            isSelectShipping={(cartObj?.selectedShippingRate != null)}
                            isSeclectAddress={isObject(billingAddress)}
                            isSelectPayment={(cartObj?.paymentMethod != null)}
                          />
                        </form>
                      </div>
                    )}
                  </DrawerBody>

                  <DrawerFooter className="flex flex-col gap-1" />
                </>
              )}
            </DrawerContent>
          </Drawer>
        ) : (
          <Drawer
            backdrop="transparent"
            hideCloseButton
            isOpen={isOpen}
            radius="none"
            onOpenChange={handleOpenChange}
            classNames={{
              base: "z-50",
              backdrop: "z-40",
              wrapper: "top-[68px] bottom-[64px]",
            }}
          >
            <DrawerContent
              className="
            z-50
            h-[calc(var(--visual-viewport-height)-132px)]
            max-h-[calc(var(--visual-viewport-height)-132px)]
          "
            >
              {(onClose) => (
                <>
                  <DrawerHeader className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-semibold">Mi Carrito</p>
                    </div>
                  </DrawerHeader>

                  <DrawerBody className="py-0 !px-2">
                    {(cart?.length === 0) ? (
                      <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                        <ShoppingCartIcon className="h-16" />
                        <p className="mt-6 text-center text-2xl font-bold">
                          Tu carrito está vacío.
                        </p>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col justify-between overflow-hidden">
                        <ul className="my-0 flex-grow overflow-auto py-0">
                          {Array.isArray(cart) &&
                            cart && cart?.map((item: any, i: number) => {
                              const merchandiseSearchParams =
                                {} as MerchandiseSearchParams;

                              const merchandiseUrl = createUrl(
                                `/product/${item?.node.productUrlKey}`,
                                new URLSearchParams(merchandiseSearchParams)
                              );
                              const baseImage: any = safeParse(item?.node?.baseImage);

                              return (
                                <li key={i} className="flex w-full flex-col">
                                  <div className="flex w-full flex-row justify-between gap-1 xxs:gap-3 px-1 py-4">
                                    <Link
                                      className="z-30 flex flex-row space-x-4"
                                      aria-label={`${item?.node?.name}`}
                                      href={merchandiseUrl}
                                      onClick={onClose}
                                    >
                                      <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-dark-grey dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                        <Image
                                          alt={
                                            item?.node?.baseImage ||
                                            item?.product?.name
                                          }
                                          className="h-full w-full object-cover"
                                          height={64}
                                          src={baseImage?.small_image_url || ""}
                                          width={74}
                                          onError={(e) =>
                                            (e.currentTarget.src = NOT_IMAGE)
                                          }
                                        />
                                      </div>

                                      <div className="flex flex-1 flex-col text-base">
                                        <span className="line-clamp-1 font-outfit text-base font-medium">
                                          {item?.node?.name}
                                        </span>
                                        {item.name !== DEFAULT_OPTION ? (
                                          <p className="text-sm lowercase line-clamp-1 text-black dark:text-neutral-400">
                                            {item?.node?.sku}
                                          </p>
                                        ) : null}
                                      </div>
                                    </Link>

                                    <div className="flex h-16 flex-col justify-between">
                                      <Price
                                        amount={item?.node?.price}
                                        className="flex justify-end space-y-2 text-right font-outfit text-base font-medium"
                                        currencyCode={"BOB"}
                                      />
                                      <div className="flex items-center gap-x-2">
                                        <DeleteItemButton item={item} />
                                        <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                          <EditItemQuantityButton
                                            item={item}
                                            type="minus"
                                          />
                                          <p className="w-6 text-center">
                                            <span className="w-full text-sm">
                                              {item?.node?.quantity}
                                            </span>
                                          </p>
                                          <EditItemQuantityButton
                                            item={item}
                                            type="plus"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                        </ul>

                        <div className="border-0 border-t border-solid border-neutral-200 dark:border-dark-grey py-4 text-sm text-neutral-500 dark:text-neutral-400">
                          {(cartDetail as any)?.cart?.taxAmount > 0 && <div className="mb-3 flex items-center justify-between">
                            <p className="text-base font-normal text-black/[60%] dark:text-white">
                              Impuestos
                            </p>
                            <Price
                              amount={(cartDetail as any)?.cart?.taxAmount}
                              className="text-right text-base font-medium text-black dark:text-white"
                              currencyCode={"BOB"}
                            />
                          </div>}
                          <div className="mb-3 flex items-center justify-between pb-1">
                            <p className="text-base font-normal text-black/[60%] dark:text-white">
                              Total
                            </p>
                            <Price
                              amount={(cartDetail as any)?.cart?.grandTotal}
                              className="text-right text-base font-medium text-black dark:text-white"
                              currencyCode={"BOB"}
                            />
                          </div>
                        </div>

                        <form action={redirectToCheckout}>
                          <CheckoutButton
                            cartDetails={cartObj?.items?.edges ?? []}
                            isGuest={cartObj?.isGuest}
                            isEmail={cartObj?.customerEmail ?? getLocalStorage(EMAIL)}
                            isSelectShipping={(cartObj?.selectedShippingRate != null)}
                            isSeclectAddress={isObject(billingAddress)}
                            isSelectPayment={(cartObj?.paymentMethod != null)}
                          />
                        </form>

                        {/* WhatsApp Button */}
                        <button
                          type="button"
                          onClick={handleWhatsAppOrder}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 text-white transition-all duration-200 hover:bg-green-600"
                        >
                          <WhatsAppIcon className="h-5 w-5" />
                          <span className="font-medium">Ordenar por WhatsApp</span>
                        </button>
                      </div>
                    )}
                  </DrawerBody>

                  <DrawerFooter className="flex flex-col gap-1" />
                </>
              )}
            </DrawerContent>
          </Drawer>
        )}


    </>
  );
}



function CheckoutButton(
  {
    cartDetails,
    isGuest,
    isEmail,
    isSeclectAddress,
    isSelectShipping,
    isSelectPayment,
  }: {
    cartDetails: Array<any>;
    isGuest: boolean;
    isEmail: string;
    isSeclectAddress: boolean;
    isSelectShipping: boolean;
    isSelectPayment: boolean;
  }
) {
  const { pending } = useFormStatus();
  const email = isEmail;

  return (
    <>
      <input
        name="url"
        type="hidden"
        value={isCheckout(
          cartDetails,
          isGuest,
          email,
          isSeclectAddress,
          isSelectShipping,
          isSelectPayment
        )}
      />
      <button
        className={clsx(
          "block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100",
          pending ? "cursor-wait" : "cursor-pointer"
        )}
        disabled={pending}
        type="submit"
      >
        {
          pending ? <LoadingDots className="bg-white" /> :
            "Proceder al Pago"
        }
      </button>
    </>
  );
}

