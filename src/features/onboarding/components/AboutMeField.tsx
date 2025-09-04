type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function AboutMeField({ value, onChange }: Props) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">About Me</label>
      <textarea
        className="w-full min-h-[120px] text-xl rounded border p-2"
        placeholder="Tell us a bit about yourself…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
