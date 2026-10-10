import { Check } from "lucide-react";
import { habitWeekdays } from "../../_data/use-habit-data";

export function HabitDaysPicker({ value, onChange }: { value: number[]; onChange: (days: number[]) => void }) {
  function toggleDay(day: number) {
    onChange(value.includes(day) ? value.filter((item) => item !== day) : [...value, day].sort((a, b) => a - b));
  }

  return (
    <fieldset className="habit-days-field">
      <legend>Choose days</legend>
      <div>
        {habitWeekdays.map((day) => {
          const checked = value.includes(day.value);
          return <button key={day.value} type="button" className={checked ? "selected" : ""} onClick={() => toggleDay(day.value)} aria-pressed={checked}><span>{checked && <Check size={12} />}</span>{day.short}</button>;
        })}
      </div>
      {!value.length && <small>Choose at least one day.</small>}
    </fieldset>
  );
}
