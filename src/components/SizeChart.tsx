const rows = [
  { size: 'S', chest: 23, length: 27, shoulder: 21, sleeve: 9 },
  { size: 'M', chest: 24, length: 28, shoulder: 22, sleeve: 9.5 },
  { size: 'L', chest: 25, length: 29, shoulder: 23, sleeve: 10 },
  { size: 'XL', chest: 26, length: 30, shoulder: 24, sleeve: 10.5 },
  { size: 'XXL', chest: 27, length: 31, shoulder: 25, sleeve: 11 },
];

export function SizeChart() {
  return (
    <details className="mt-6 border-t border-black/10 pt-4 group">
      <summary className="font-mono text-[10px] tracking-[0.25em] uppercase cursor-pointer flex justify-between items-center list-none">
        <span>Size Chart</span>
        <span className="text-[var(--color-muted-light)] group-open:hidden">+</span>
        <span className="text-[var(--color-muted-light)] hidden group-open:inline">−</span>
      </summary>

      <div className="mt-5">
        <table className="w-full font-mono text-[11px]">
          <thead>
            <tr className="text-left text-[var(--color-muted-light)] uppercase tracking-[0.15em] text-[10px]">
              <th className="py-2 font-normal">Size</th>
              <th className="py-2 font-normal">Chest</th>
              <th className="py-2 font-normal">Length</th>
              <th className="py-2 font-normal">Shoulder</th>
              <th className="py-2 font-normal">Sleeve</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.size} className="border-t border-black/10">
                <td className="py-2.5">{r.size}</td>
                <td className="py-2.5">{`${r.chest}"`}</td>
                <td className="py-2.5">{`${r.length}"`}</td>
                <td className="py-2.5">{`${r.shoulder}"`}</td>
                <td className="py-2.5">{`${r.sleeve}"`}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-[0.05em] text-[var(--color-muted-light)]">
          Measurements are of the garment laid flat, in inches. Chest is half-width, pit to pit.
          Oversized fit — size down for a relaxed fit, true to size for the intended drop.
          Tolerance ±0.5 inch.
        </p>
      </div>
    </details>
  );
}
