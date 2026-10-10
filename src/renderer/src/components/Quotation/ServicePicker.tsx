export const serviceLabels: Record<string, string> = {
  pickup: 'Pickup from the shipper',
  origin_handling: 'Origin terminal handling',
  export_clearance: 'Export customs clearance',
  main_carriage: 'Main freight transport',
  destination_handling: 'Destination terminal handling',
  import_clearance: 'Import customs clearance',
  delivery: 'Final delivery',
  insurance: 'Cargo insurance',
  duties: 'Duties and taxes',
  other: 'Other services'
}
export const isService = (value: string) =>
  Object.prototype.hasOwnProperty.call(serviceLabels, value)
export const serviceLabel = (value: string) => (isService(value) ? serviceLabels[value] : value)
export const splitServices = (value: unknown) =>
  String(value || '')
    .split(/[|;,]/)
    .map((s) => s.trim())
    .filter(Boolean)

export default function ServicePicker({
  selected,
  onChange,
  disabled,
  mode
}: {
  selected: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  mode?: unknown
}) {
  const knownSelected = selected.filter(isService)
  return (
    <fieldset disabled={disabled} style={{ border: '1px solid #999', padding: 12 }}>
      <legend>Services to ask the agent to quote</legend>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 10
        }}
      >
        {Object.entries(serviceLabels).map(([key, label]) => (
          <label key={key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={selected.includes(key)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...knownSelected, key]
                    : knownSelected.filter((v) => v !== key)
                )
              }
            />
            {key === 'main_carriage'
              ? mode === 'air'
                ? 'Air freight'
                : mode === 'ocean'
                  ? 'Ocean freight'
                  : label
              : label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
