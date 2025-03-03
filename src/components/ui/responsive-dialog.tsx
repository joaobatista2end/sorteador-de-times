import * as React from "react"
import { useMediaQuery } from "../../hooks/use-media-query"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./dialog"
import {
    SheetContent
} from "./sheet"

interface ResponsiveDialogProps extends React.ComponentProps<typeof Dialog> {
  children: React.ReactNode
}

const ResponsiveDialog = ({ children, ...props }: ResponsiveDialogProps) => {
  return (
    <Dialog {...props}>
      {children}
    </Dialog>
  )
}

interface ResponsiveDialogContentProps
  extends React.ComponentProps<typeof DialogContent> {
  children: React.ReactNode
}

const ResponsiveDialogContent = ({
  children,
  ...props
}: ResponsiveDialogContentProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return <DialogContent {...props}>{children}</DialogContent>
  }

  return (
    <SheetContent side="bottom" className="h-auto max-h-[90vh]" {...props}>
      {children}
    </SheetContent>
  )
}

const ResponsiveDialogHeader = DialogHeader
const ResponsiveDialogFooter = DialogFooter
const ResponsiveDialogTitle = DialogTitle
const ResponsiveDialogDescription = DialogDescription

export {
    ResponsiveDialog,
    ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogFooter, ResponsiveDialogHeader, ResponsiveDialogTitle
}

