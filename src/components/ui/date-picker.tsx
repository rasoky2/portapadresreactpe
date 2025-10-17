"use client"

import * as React from "react"
import DatePicker from "react-datepicker"
import { Calendar as CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import "react-datepicker/dist/react-datepicker.css"
import "./date-picker.css"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePickerComponent({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className
}: DatePickerProps) {
  return (
    <div className="relative">
      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
      <DatePicker
        selected={value}
        onChange={(date) => onChange?.(date || undefined)}
        placeholderText={placeholder}
        disabled={disabled}
        locale={es}
        dateFormat="dd/MM/yyyy"
        maxDate={new Date()}
        minDate={new Date("1900-01-01")}
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        className={cn(
          "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
          disabled && "bg-gray-100 cursor-not-allowed",
          className
        )}
        wrapperClassName="w-full"
      />
    </div>
  )
}
