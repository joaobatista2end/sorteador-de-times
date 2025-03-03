import { ChevronRight, Home } from "lucide-react"
import * as React from "react"
import { Link } from "react-router-dom"

import { cn } from "../../lib/utils"

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  segments: {
    name: string
    href?: string
  }[]
  separator?: React.ReactNode
  homeHref?: string
}

export function Breadcrumb({
  segments,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  homeHref = "/",
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("mb-4 flex items-center text-sm text-muted-foreground", className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5">
        <li>
          <Link
            to={homeHref}
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {segments.map((segment, index) => (
          <React.Fragment key={index}>
            <li className="flex items-center">{separator}</li>
            <li>
              {segment.href ? (
                <Link
                  to={segment.href}
                  className="hover:text-foreground transition-colors"
                >
                  {segment.name}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{segment.name}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  )
} 