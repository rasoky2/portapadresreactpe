'use client'

import * as React from 'react'
import DatePicker from 'react-datepicker'
import { Calendar as CalendarIcon } from 'lucide-react'
import { es } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import 'react-datepicker/dist/react-datepicker.css'
import './date-picker.css'

interface DatePickerProps {
  readonly value?: Date
  readonly onChange?: (date: Date | undefined) => void
  readonly placeholder?: string
  readonly disabled?: boolean
  readonly className?: string
  readonly minAge?: number // Edad mínima en años
  readonly maxAge?: number // Edad máxima en años
  readonly showAgeRange?: boolean // Mostrar rango de edad en el placeholder
}

export function DatePickerComponent({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  className,
  minAge = 0,
  maxAge = 100,
  showAgeRange = false
}: DatePickerProps) {
  // Calcular fechas límite basadas en la edad
  const today = new Date()
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate())
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate())
  
  // Generar placeholder con rango de edad si se solicita
  const getPlaceholder = () => {
    if (showAgeRange && (minAge > 0 || maxAge < 100)) {
      return `Seleccionar fecha (${minAge}-${maxAge} años)`
    }
    return placeholder
  }

  return (
    <div className="relative">
      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
      <DatePicker
        selected={value}
        onChange={(date) => onChange?.(date || undefined)}
        placeholderText={getPlaceholder()}
        disabled={disabled}
        locale={es}
        dateFormat="dd/MM/yyyy"
        maxDate={maxDate}
        minDate={minDate}
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        className={cn(
          'w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          disabled && 'bg-gray-100 cursor-not-allowed',
          className
        )}
        wrapperClassName="w-full"
      />
    </div>
  )
}

// Componente para rango de fechas (desde-hasta)
interface DateRangePickerProps {
  readonly startDate?: Date
  readonly endDate?: Date
  readonly onStartDateChange?: (date: Date | undefined) => void
  readonly onEndDateChange?: (date: Date | undefined) => void
  readonly startPlaceholder?: string
  readonly endPlaceholder?: string
  readonly disabled?: boolean
  readonly className?: string
  readonly minDate?: Date
  readonly maxDate?: Date
}

export function DateRangePickerComponent({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startPlaceholder = 'Fecha desde',
  endPlaceholder = 'Fecha hasta',
  disabled = false,
  className,
  minDate,
  maxDate
}: DateRangePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
        <DatePicker
          selected={startDate}
          onChange={(date) => onStartDateChange?.(date || undefined)}
          placeholderText={startPlaceholder}
          disabled={disabled}
          locale={es}
          dateFormat="dd/MM/yyyy"
          maxDate={endDate || maxDate}
          minDate={minDate}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          className={cn(
            'w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            disabled && 'bg-gray-100 cursor-not-allowed',
            className
          )}
          wrapperClassName="w-full"
        />
      </div>
      
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
        <DatePicker
          selected={endDate}
          onChange={(date) => onEndDateChange?.(date || undefined)}
          placeholderText={endPlaceholder}
          disabled={disabled}
          locale={es}
          dateFormat="dd/MM/yyyy"
          maxDate={maxDate}
          minDate={startDate || minDate}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          className={cn(
            'w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            disabled && 'bg-gray-100 cursor-not-allowed',
            className
          )}
          wrapperClassName="w-full"
        />
      </div>
    </div>
  )
}
