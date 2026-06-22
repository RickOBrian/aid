import './StatesPlatformTable.css'

const ROWS = [
  {
    web: 'hovered',
    ios: '—',
    android: '—',
    note: 'наведение',
  },
  {
    web: 'pressed',
    ios: 'hightlighted',
    android: 'rippled',
    note: 'зажатие',
  },
  {
    web: 'selected',
    ios: '—',
    android: '—',
    note: 'выбранный',
  },
  {
    web: 'disabled',
    ios: 'disabled',
    android: 'disabled',
    note: 'недоступный',
  },
  {
    web: 'focused',
    ios: '—',
    android: '—',
    note: 'синяя рамка tab',
  },
  {
    web: 'actived',
    ios: 'actived',
    android: 'actived',
    note: 'активный элемент (поле)',
  },
] as const

export function StatesPlatformTable() {
  return (
    <div className="states-platform-table">
      <div className="states-platform-table__column">
        <div className="states-platform-table__cell states-platform-table__cell--head">
          WEB
        </div>
        {ROWS.map((row) => (
          <div key={row.web} className="states-platform-table__cell">
            {row.web}
          </div>
        ))}
      </div>
      <div className="states-platform-table__column">
        <div className="states-platform-table__cell states-platform-table__cell--head">
          ios
        </div>
        {ROWS.map((row) => (
          <div key={row.web} className="states-platform-table__cell">
            {row.ios}
          </div>
        ))}
      </div>
      <div className="states-platform-table__column">
        <div className="states-platform-table__cell states-platform-table__cell--head">
          Android
        </div>
        {ROWS.map((row) => (
          <div key={row.web} className="states-platform-table__cell">
            {row.android}
          </div>
        ))}
      </div>
      <div className="states-platform-table__column">
        <div className="states-platform-table__cell states-platform-table__cell--head">
          Примечание
        </div>
        {ROWS.map((row) => (
          <div
            key={row.web}
            className="states-platform-table__cell states-platform-table__cell--note"
          >
            {row.note}
          </div>
        ))}
      </div>
    </div>
  )
}
