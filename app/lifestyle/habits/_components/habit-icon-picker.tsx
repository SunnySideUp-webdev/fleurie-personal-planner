import type { HabitIconType } from "../../_data/use-habit-data";
import { HabitIcon } from "../../_components/habit-icon";

export { HabitIcon } from "../../_components/habit-icon";

type HabitIconOption = {
  value: HabitIconType;
  label: string;
};

export const habitIconOptions: HabitIconOption[] = [
  { value: "sparkles", label: "Cuidado personal" },
  { value: "water", label: "Tomar agua" },
  { value: "exercise", label: "Ejercicio" },
  { value: "read", label: "Lectura" },
  { value: "leaf", label: "Bienestar" },
  { value: "journal", label: "Escribir en el diario" },
  { value: "walk", label: "Caminar" },
  { value: "stretch", label: "Estiramiento" },
  { value: "meditate", label: "Meditación" },
  { value: "sleep", label: "Dormir" },
  { value: "morning", label: "Rutina de mañana" },
  { value: "nutrition", label: "Alimentación" },
  { value: "coffee", label: "Café o té" },
  { value: "medicine", label: "Medicamento" },
  { value: "heart", label: "Salud" },
  { value: "selfcare", label: "Autocuidado" },
  { value: "beauty", label: "Belleza" },
  { value: "study", label: "Estudio" },
  { value: "focus", label: "Enfoque" },
  { value: "work", label: "Trabajo" },
  { value: "clean", label: "Limpieza" },
  { value: "home", label: "Hogar" },
  { value: "money", label: "Finanzas" },
  { value: "music", label: "Música" },
  { value: "creative", label: "Creatividad" },
  { value: "write", label: "Escribir" },
  { value: "calendar", label: "Planificar" },
  { value: "tasks", label: "Tareas" },
  { value: "time", label: "Tiempo" },
  { value: "rest", label: "Descanso" },
  { value: "bike", label: "Ciclismo" },
  { value: "meal", label: "Comidas" },
  { value: "bath", label: "Higiene" },
  { value: "pet", label: "Mascota" },
  { value: "language", label: "Idiomas" },
  { value: "alarm", label: "Despertar" },
  { value: "computer", label: "Computadora" },
  { value: "shopping", label: "Compras" },
  { value: "personal", label: "Personal" },
];

export function HabitIconPicker({ value, onChange }: { value: HabitIconType; onChange: (value: HabitIconType) => void }) {
  return (
    <fieldset className="habit-icon-field">
      <legend>Icon</legend>
      <div className="habit-icon-picker" role="radiogroup" aria-label="Choose a habit icon">
        {habitIconOptions.map(({ value: optionValue, label }) => (
          <button
            key={optionValue}
            type="button"
            className={value === optionValue ? "selected" : ""}
            onClick={() => onChange(optionValue)}
            role="radio"
            aria-checked={value === optionValue}
            aria-label={label}
            title={label}
          >
            <HabitIcon type={optionValue} size={22} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}
