export const Price = ({
  amount,
  className,
  currencyCode = "BOB",
  ...rest
}: {
  amount: string;
  className?: string;
  currencyCode: string;
} & React.ComponentProps<"p">) => (
  <p className={className} suppressHydrationWarning={true} {...rest}>
    {`${new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).format(parseFloat(amount))}`}
  </p>
);
