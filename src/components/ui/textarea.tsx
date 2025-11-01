import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
  return (
    <textarea
        ref={ref}
      className={cn(
          "flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50",
          className,
      )}
      {...props}
    />
  )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
