import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-block border px-3 pt-0 pb-1 text-xs font-semibold rounded-full",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        gold: "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
        silver: "border-gray-400 bg-gray-400/10 text-gray-700 dark:text-gray-300",
        bronze: "border-amber-600 bg-amber-600/10 text-amber-700 dark:text-amber-400",
        created: "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400",
        "in-progress": "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
        finished: "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-400",
        "best-of-3": "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
        "best-of-5": "border-pink-500 bg-pink-500/10 text-pink-700 dark:text-pink-400",
        players: "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
        teams: "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

