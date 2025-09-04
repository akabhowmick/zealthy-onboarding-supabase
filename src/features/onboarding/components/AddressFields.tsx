type Props = {
  street: string;
  city: string;
  state: string;
  zip: string;
  onChange: (patch: Partial<{ street: string; city: string; state: string; zip: string }>) => void;
};

export default function AddressFields({ street, city, state, zip, onChange }: Props) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Address</legend>
      <input
        className="w-full text-xl rounded border p-2"
        placeholder="Street address"
        value={street}
        onChange={(e) => onChange({ street: e.target.value })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          className="rounded text-xl border p-2"
          placeholder="City"
          value={city}
          onChange={(e) => onChange({ city: e.target.value })}
        />
        <input
          className="rounded text-xl border p-2"
          placeholder="State"
          value={state}
          onChange={(e) => onChange({ state: e.target.value })}
        />
        <input
          className="rounded text-xl border p-2"
          placeholder="ZIP"
          value={zip}
          onChange={(e) => onChange({ zip: e.target.value })}
        />
      </div>
    </fieldset>
  );
}
