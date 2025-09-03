type Props = { total: number; current: 1 | 2 | 3 };

export default function Stepper({ total, current }: Props) {
  return (
    <ol className="flex items-center gap-4" aria-label="Onboarding progress">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const isActive = n === current;
        const isDone = n < current;
        return (
          <li key={n} className="flex items-center gap-2">
            <span
              className={[
                "h-8 w-8 grid place-items-center rounded-full border",
                isDone ? "bg-green-600 text-white border-green-600" : "",
                isActive ? "bg-black text-white border-black" : "",
                !isActive && !isDone ? "bg-white text-gray-600 border-gray-300" : "",
              ].join(" ")}
            >
              {n}
            </span>
            {n < total && <span className="w-10 h-[2px] bg-gray-300" />}
          </li>
        );
      })}
    </ol>
  );
}
