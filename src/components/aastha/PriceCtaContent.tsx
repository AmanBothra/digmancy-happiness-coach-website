import React from "react";
import { ArrowRight } from "lucide-react";

interface PriceCtaContentProps {
  label: string;
  compareAtPrice: string;
  registrationPrice: string;
  showPrice?: boolean;
}

export function PriceCtaContent({
  label,
  compareAtPrice,
  registrationPrice,
  showPrice = true,
}: PriceCtaContentProps) {
  return (
    <span
      data-price-cta-content
      className="flex min-w-0 flex-1 flex-row items-center justify-center gap-2 whitespace-nowrap sm:flex-none"
    >
      <span className="whitespace-nowrap">{label}</span>
      {showPrice ? (
        <>
          <span aria-hidden className="hidden sm:inline">
            —
          </span>
          <span
            data-price-cta-price
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap sm:gap-2"
          >
            <s className="opacity-60 font-normal">{compareAtPrice}</s>
            <span>{registrationPrice} Only</span>
            <ArrowRight data-price-cta-arrow className="h-5 w-5 shrink-0" />
          </span>
        </>
      ) : null}
    </span>
  );
}
