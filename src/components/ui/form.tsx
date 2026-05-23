"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import {
    Controller,
    FormProvider,
    useFormContext,
    type ControllerProps,
} from "react-hook-form"

import { cn } from "@/lib/utils"

const Form = FormProvider

// We keep this narrow and local so eslint noise is minimal.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>

 
const FormField = (props: ControllerProps<FieldValues>) => {
    const { control } = useFormContext<FieldValues>()
    return <Controller {...props} control={control} />
}

const FormItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
))
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn("text-sm font-medium", className)}
        {...props}
    />
))
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
    HTMLElement,
    React.HTMLAttributes<HTMLElement>
>(({ ...props }, ref) => <Slot ref={ref} {...props} />)
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-red-500", className)}
        {...props}
    >
        {children}
    </p>
))
FormMessage.displayName = "FormMessage"

export {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
}
