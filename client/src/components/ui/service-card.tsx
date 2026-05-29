"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import type React from "react";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "group relative flex min-h-[220px] overflow-hidden rounded-card border border-border p-6 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-cardHover",
  {
    variants: {
      variant: {
        default: "bg-white text-[#1A1A1A]",
        gray: "bg-[#F7F7F2] text-[#1A1A1A]",
        yellow: "bg-[#F5C518] text-[#1A1A1A]",
        black: "bg-[#1A1A1A] text-white",
        lightgray: "bg-[#F7F7F2] text-[#1A1A1A]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ServiceCardProps extends VariantProps<typeof cardVariants> {
  title: string;
  href: string;
  imgSrc: string;
  imgAlt: string;
  className?: string;
  topContent?: React.ReactNode;
  description?: string;
}

export function ServiceCard({
  title,
  href,
  imgSrc,
  imgAlt,
  variant,
  className,
  topContent,
  description,
}: ServiceCardProps) {
  return (
    <article className={cn(cardVariants({ variant }), className)}>
      <img
        src={imgSrc}
        alt={imgAlt}
        loading="lazy"
        className="absolute bottom-0 right-0 h-28 w-32 translate-x-4 translate-y-4 rounded-tl-card object-cover opacity-20 transition-all duration-300 group-hover:opacity-30 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/10" />

      <div className="relative z-10 flex h-full flex-col">
        {topContent && <div className="mb-3">{topContent}</div>}
        <h3 className="max-w-[220px] text-xl font-extrabold tracking-tight">{title}</h3>
        {description && (
          <p className="mt-2 max-w-[240px] text-sm leading-relaxed opacity-75">{description}</p>
        )}
        <a
          href={href}
          className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-xs font-extrabold uppercase tracking-[0.08em] opacity-80 transition-opacity hover:opacity-100"
        >
          Learn More
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </article>
  );
}
