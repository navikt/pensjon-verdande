import type React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Label } from '@navikt/ds-react'
import { nb } from 'date-fns/locale'
import styles from './DateTimePicker.module.css'

interface DateTimePickerProps {
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  id?: string
  dateFormat?: string
  timeFormat?: string
  timeIntervals?: number
  timeCaption?: string
  placeholderText?: string
  ariaLabel?: string
  label?: string
  tabIndex?: number
  name?: string
  minDate?: Date
  maxDate?: Date
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  setSelectedDate,
  id = 'date-picker',
  label = 'Dato',
  dateFormat = 'yyyy-MM-dd HH:mm',
  timeFormat = 'HH:mm',
  timeIntervals = 15,
  timeCaption = 'Klokkeslett',
  placeholderText = 'Velg dato',
  ariaLabel = 'Velg dato',
  tabIndex,
  name,
  minDate,
  maxDate,
}) => {
  return (
    <div className="aksel-form-field aksel-form-field--small">
      <Label htmlFor={id} size="small">
        {label}
      </Label>
      <div>
        <DatePicker
          id={id}
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showTimeSelect
          timeFormat={timeFormat}
          timeIntervals={timeIntervals}
          timeCaption={timeCaption}
          dateFormat={dateFormat}
          locale={nb}
          placeholderText={placeholderText}
          className={`${styles.akselInputEmulering}`}
          aria-label={ariaLabel}
          tabIndex={tabIndex}
          name={name}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>
    </div>
  )
}

export default DateTimePicker
