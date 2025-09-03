type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function BirthdateField({ value, onChange }: Props) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">Birthdate</label>
      <input
        className="w-full rounded border p-2"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        max={new Date().toISOString().slice(0, 10)}
      />
    </div>
  );
}
