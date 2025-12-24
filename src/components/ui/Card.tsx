'use client';

import { HTMLAttributes, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'onDrag'
    | 'onDragEnd'
    | 'onDragStart'
    | 'onAnimationStart'
    | 'onAnimationEnd'
    | 'onAnimationIteration'
  > {
  children: React.ReactNode;
  hover?: boolean;
  glass?: boolean;
}

export function Card({
  className,
  children,
  hover = false,
  glass = false,
  ...props
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'rounded-2xl transition-all duration-300',
        glass
          ? 'glass-card shadow-xl hover:shadow-2xl'
          : 'bg-white border border-gray-100 shadow-sm hover:shadow-lg',
        hover && 'hover:-translate-y-1',
        className
      )}
      whileHover={hover ? { y: -6, scale: 1.02 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  className,
  ...props
}: Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>) {
  const headerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={headerRef}
      className={cn('px-6 py-4 border-b border-gray-200', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={contentRef} className={cn('px-6 py-4', className)} {...props} />
  );
}

export function CardFooter({
  className,
  ...props
}: Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>) {
  const footerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={footerRef}
      className={cn('px-6 py-4 border-t border-gray-200', className)}
      {...props}
    />
  );
}
