import { DatePicker, HStack, TextField } from '@navikt/ds-react'
import type React from 'react'

interface DateTimePickerProps {
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  label?: string
  minDate?: Date
  maxDate?: Date
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  setSelectedDate,
  label = 'Dato',
  minDate,
  maxDate,
}) => {
  const timeValue = selectedDate
    ? `${selectedDate.getHours().toString().padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}`
    : ''

  function handleDateSelect(date: Date | undefined) {
    if (!date) {
      setSelectedDate(null)
      return
    }
    if (selectedDate) {
      date.setHours(selectedDate.getHours(), selectedDate.getMinutes())
    }
    setSelectedDate(date)
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const base = selectedDate ? new Date(selectedDate) : new Date()
    base.setHours(hours, minutes, 0, 0)
    setSelectedDate(base)
  }

  const dateLabel = label || 'Dato'
  const hideLabels = !label

  return (
    <HStack gap="space-8" align="end">
      <DatePicker
        mode="single"
        selected={selectedDate ?? undefined}
        defaultMonth={selectedDate ?? minDate ?? new Date()}
        onSelect={handleDateSelect}
        fromDate={minDate}
        toDate={maxDate}
      >
        <DatePicker.Input label={dateLabel} hideLabel={hideLabels} size="small" />
      </DatePicker>
      <TextField
        label="Klokkeslett"
        hideLabel={hideLabels}
        type="time"
        size="small"
        value={timeValue}
        onChange={handleTimeChange}
        style={{ width: '7rem' }}
      />
    </HStack>
  )
}

export default DateTimePicker
