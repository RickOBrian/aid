/**
 * Semantic color tokens from Figma «⚔️ Персонаж», section color-sem (node 1763:113).
 * Source: https://www.figma.com/design/qaf3M4WfYpM4BEfExdT9tD/?node-id=1763-113
 */

export interface ColorModeValue {
  hex: string;
  opacity: number;
}

export interface SemanticColorRow {
  name: string;
  day: ColorModeValue;
  night: ColorModeValue;
  description: string;
}

export interface SemanticColorSection {
  title: string;
  rows: SemanticColorRow[];
}

const bgRows: SemanticColorRow[] = [
  {
    name: 'Primary',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#2D2C2E', opacity: 100 },
    description: 'Основной фон',
  },
  {
    name: 'Secondary',
    day: { hex: '#F5F5F5', opacity: 100 },
    night: { hex: '#202021', opacity: 100 },
    description: 'Используется для обозначения "нулевого" слоя-подложки.',
  },
  {
    name: 'Actions',
    day: { hex: '#2D2C2E', opacity: 100 },
    night: { hex: '#000000', opacity: 100 },
    description: 'Обычно используется для бэкграундов с действиями — для обособления поля',
  },
];

const textsRows: SemanticColorRow[] = [
  {
    name: 'Primary 1',
    day: { hex: '#000000', opacity: 87 },
    night: { hex: '#FFFFFF', opacity: 100 },
    description: 'Основной текст',
  },
  {
    name: 'Primary 2',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#000000', opacity: 87 },
    description: 'Основной текст для тёмных/светлых областей',
  },
  {
    name: 'Secondary 1',
    day: { hex: '#000000', opacity: 54 },
    night: { hex: '#FFFFFF', opacity: 70 },
    description: 'Второстепенный текст, подписи, пояснения',
  },
  {
    name: 'Secondary 2',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#000000', opacity: 54 },
    description: 'Второстепенный текст для тёмных/светлых областей',
  },
  {
    name: 'Tertiary',
    day: { hex: '#000000', opacity: 38 },
    night: { hex: '#FFFFFF', opacity: 38 },
    description: 'Подписи, неактивные состояния в полях, тексты на малозначимых элементах интерфейса',
  },
  {
    name: 'Disabled',
    day: { hex: '#000000', opacity: 26 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: 'Для текстов в неактивном состоянии',
  },
  {
    name: 'Accent',
    day: { hex: '#8526FF', opacity: 100 },
    night: { hex: '#9966FF', opacity: 100 },
    description: 'Акцентное состояние для максимального привлечения внимания.',
  },
  {
    name: 'Positive',
    day: { hex: '#23AD58', opacity: 100 },
    night: { hex: '#23AD58', opacity: 100 },
    description: 'Акцентные тексты и обозначение положительного баланса сумм.',
  },
  {
    name: 'Warning',
    day: { hex: '#D62347', opacity: 100 },
    night: { hex: '#D62347', opacity: 100 },
    description: 'Для состояния ошибок',
  },
  {
    name: 'Link',
    day: { hex: '#005AFF', opacity: 100 },
    night: { hex: '#0056F5', opacity: 100 },
    description: 'Для ссылок',
  },
  {
    name: 'Primary dark ind',
    day: { hex: '#000000', opacity: 87 },
    night: { hex: '#000000', opacity: 87 },
    description: 'Основной текст. Не зависит от темы.',
  },
  {
    name: 'Secondary dark ind',
    day: { hex: '#000000', opacity: 54 },
    night: { hex: '#000000', opacity: 54 },
    description: 'Второстепенный текст, подписи, пояснения. Не зависит от темы.',
  },
  {
    name: 'Accent light ind',
    day: { hex: '#9966FF', opacity: 100 },
    night: { hex: '#9966FF', opacity: 100 },
    description: 'Акцентное состояние для максимального привлечения внимания. Не зависит от темы.',
  },
  {
    name: 'Primary light ind',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#FFFFFF', opacity: 100 },
    description: 'Основной текст. Не зависит от темы.',
  },
  {
    name: 'Secondary light ind',
    day: { hex: '#FFFFFF', opacity: 70 },
    night: { hex: '#FFFFFF', opacity: 70 },
    description: 'Второстепенный текст, подписи, пояснения. Не зависит от темы.',
  },
  {
    name: 'Tertiary light ind',
    day: { hex: '#FFFFFF', opacity: 38 },
    night: { hex: '#FFFFFF', opacity: 38 },
    description: 'Подписи, неактивные состояния в полях. Не зависит от темы.',
  },
  {
    name: 'Disabled light ind',
    day: { hex: '#FFFFFF', opacity: 16 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: 'Для текстов в неактивном состоянии. Не зависит от темы.',
  },
];

const iconsRows: SemanticColorRow[] = [
  {
    name: 'Primary 1',
    day: { hex: '#2D2C2E', opacity: 100 },
    night: { hex: '#FFFFFF', opacity: 100 },
    description: 'Для важных акцентных состояний. Когда иконка является ключевой составляющей элемента. Например, для иконок в FAB.',
  },
  {
    name: 'Primary 2',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#2D2C2E', opacity: 100 },
    description: 'Для важных акцентных состояний на тёмном/светлом фоне',
  },
  {
    name: 'Secondary 1',
    day: { hex: '#000000', opacity: 54 },
    night: { hex: '#FFFFFF', opacity: 50 },
    description: 'Для иконок действий. Например, для закрытия виджета.',
  },
  {
    name: 'Secondary 2',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#000000', opacity: 54 },
    description: 'Для иконок действий на тёмных/цветных областях',
  },
  {
    name: 'Informative',
    day: { hex: '#000000', opacity: 38 },
    night: { hex: '#FFFFFF', opacity: 38 },
    description: 'Для информационных иконок. Например, для указания подъезда.',
  },
  {
    name: 'Inactive',
    day: { hex: '#000000', opacity: 26 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: 'Неактивное состояние иконок.',
  },
  {
    name: 'Accent',
    day: { hex: '#8526FF', opacity: 100 },
    night: { hex: '#884DFF', opacity: 100 },
    description: 'Акцентное состояние для максимального привлечения внимания.',
  },
  {
    name: 'Positive',
    day: { hex: '#23AD58', opacity: 100 },
    night: { hex: '#23AD58', opacity: 100 },
    description: 'Акцентное состояние кнопок, в кейсе заказов.',
  },
  {
    name: 'Warning',
    day: { hex: '#D62347', opacity: 100 },
    night: { hex: '#D62347', opacity: 100 },
    description: 'Для состояния ошибок',
  },
  {
    name: 'Special',
    day: { hex: '#005AFF', opacity: 100 },
    night: { hex: '#005AFF', opacity: 100 },
    description: 'Для очереди',
  },
  {
    name: 'Primary dark ind',
    day: { hex: '#2D2C2E', opacity: 100 },
    night: { hex: '#2D2C2E', opacity: 100 },
    description: 'Для важных акцентных состояний. Не зависит от темы.',
  },
  {
    name: 'Secondary dark ind',
    day: { hex: '#000000', opacity: 54 },
    night: { hex: '#000000', opacity: 54 },
    description: 'Для иконок действий. Не зависит от темы.',
  },
  {
    name: 'Accent light ind',
    day: { hex: '#884DFF', opacity: 100 },
    night: { hex: '#884DFF', opacity: 100 },
    description: 'Акцентное состояние для максимального привлечения внимания. Не зависит от темы.',
  },
  {
    name: 'Primary light ind',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#FFFFFF', opacity: 100 },
    description: 'Для важных акцентных состояний. Не зависит от темы.',
  },
  {
    name: 'Secondary light ind',
    day: { hex: '#FFFFFF', opacity: 50 },
    night: { hex: '#FFFFFF', opacity: 50 },
    description: 'Для иконок действий. Не зависит от темы.',
  },
  {
    name: 'Informative light ind',
    day: { hex: '#FFFFFF', opacity: 38 },
    night: { hex: '#FFFFFF', opacity: 38 },
    description: 'Для информационных иконок. Не зависит от темы.',
  },
  {
    name: 'Inactive light ind',
    day: { hex: '#FFFFFF', opacity: 16 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: 'Неактивное состояние иконок. Не зависит от темы.',
  },
];

const strokesRows: SemanticColorRow[] = [
  {
    name: 'Primary',
    day: { hex: '#2D2C2E', opacity: 100 },
    night: { hex: '#CBCACC', opacity: 100 },
    description: 'Для обводок важных элементов',
  },
  {
    name: 'Secondary',
    day: { hex: '#000000', opacity: 38 },
    night: { hex: '#FFFFFF', opacity: 38 },
    description: 'Для обводок второстепенных элементов',
  },
  {
    name: 'Tertiary',
    day: { hex: '#000000', opacity: 12 },
    night: { hex: '#FFFFFF', opacity: 20 },
    description: 'Для обводок небольших элементов',
  },
  {
    name: 'Informative',
    day: { hex: '#EBEDF0', opacity: 100 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: 'Для лёгкого отображения границ элемента',
  },
  {
    name: 'Informative light ind',
    day: { hex: '#FFFFFF', opacity: 16 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: 'Для лёгкого отображения границ элемента. Не зависит от темы.',
  },
];

const pastelsRows: SemanticColorRow[] = [
  {
    name: 'Wisteria',
    day: { hex: '#8E6EB8', opacity: 100 },
    night: { hex: '#855FB8', opacity: 100 },
    description: '—',
  },
  {
    name: 'Plum',
    day: { hex: '#E1D5F0', opacity: 100 },
    night: { hex: '#4E4657', opacity: 100 },
    description: '—',
  },
  {
    name: 'Lips',
    day: { hex: '#CC5A87', opacity: 100 },
    night: { hex: '#BD4B78', opacity: 100 },
    description: '—',
  },
  {
    name: 'Orchid',
    day: { hex: '#EBCEE1', opacity: 100 },
    night: { hex: '#52414C', opacity: 100 },
    description: '—',
  },
  {
    name: 'Shame',
    day: { hex: '#EB676B', opacity: 100 },
    night: { hex: '#CC5255', opacity: 100 },
    description: '—',
  },
  {
    name: 'Oyster',
    day: { hex: '#EBCECE', opacity: 100 },
    night: { hex: '#524141', opacity: 100 },
    description: '—',
  },
  {
    name: 'Bronze',
    day: { hex: '#A37B5B', opacity: 100 },
    night: { hex: '#996843', opacity: 100 },
    description: '—',
  },
  {
    name: 'Skin',
    day: { hex: '#F0D4C5', opacity: 100 },
    night: { hex: '#574942', opacity: 100 },
    description: '—',
  },
  {
    name: 'Wheat',
    day: { hex: '#E6D5B8', opacity: 100 },
    night: { hex: '#4C4537', opacity: 100 },
    description: '—',
  },
  {
    name: 'Peach',
    day: { hex: '#F0A869', opacity: 100 },
    night: { hex: '#CC8B52', opacity: 100 },
    description: '—',
  },
  {
    name: 'Corn',
    day: { hex: '#E8BB53', opacity: 100 },
    night: { hex: '#CCA039', opacity: 100 },
    description: '—',
  },
  {
    name: 'Parchment',
    day: { hex: '#F6EEDF', opacity: 100 },
    night: { hex: '#5C564C', opacity: 100 },
    description: '—',
  },
  {
    name: 'Pesto',
    day: { hex: '#8C8F56', opacity: 100 },
    night: { hex: '#868A48', opacity: 100 },
    description: '—',
  },
  {
    name: 'Olive',
    day: { hex: '#DFE0C5', opacity: 100 },
    night: { hex: '#464739', opacity: 100 },
    description: '—',
  },
  {
    name: 'Avocado',
    day: { hex: '#6E9E4C', opacity: 100 },
    night: { hex: '#608F3F', opacity: 100 },
    description: '—',
  },
  {
    name: 'Leaf',
    day: { hex: '#D0E0C5', opacity: 100 },
    night: { hex: '#3F4739', opacity: 100 },
    description: '—',
  },
  {
    name: 'Wealth',
    day: { hex: '#749987', opacity: 100 },
    night: { hex: '#618F78', opacity: 100 },
    description: '—',
  },
  {
    name: 'Nebula',
    day: { hex: '#CDE6DA', opacity: 100 },
    night: { hex: '#3E4C45', opacity: 100 },
    description: '—',
  },
  {
    name: 'Turquoise',
    day: { hex: '#659BA8', opacity: 100 },
    night: { hex: '#568B99', opacity: 100 },
    description: '—',
  },
  {
    name: 'Opal',
    day: { hex: '#CAE5E5', opacity: 100 },
    night: { hex: '#3D4C4C', opacity: 100 },
    description: '—',
  },
  {
    name: 'Sign',
    day: { hex: '#6997CC', opacity: 100 },
    night: { hex: '#5C86B8', opacity: 100 },
    description: '—',
  },
  {
    name: 'Pigeon',
    day: { hex: '#DFE7F5', opacity: 100 },
    night: { hex: '#4C525C', opacity: 100 },
    description: '—',
  },
  {
    name: 'Vk',
    day: { hex: '#6386A3', opacity: 100 },
    night: { hex: '#437299', opacity: 100 },
    description: '—',
  },
  {
    name: 'Ghost',
    day: { hex: '#C3D9EB', opacity: 100 },
    night: { hex: '#3D4952', opacity: 100 },
    description: '—',
  },
  {
    name: 'Morion',
    day: { hex: '#4D4D5C', opacity: 100 },
    night: { hex: '#818199', opacity: 100 },
    description: '—',
  },
  {
    name: 'Concrete',
    day: { hex: '#E6E6EB', opacity: 100 },
    night: { hex: '#4B4952', opacity: 100 },
    description: '—',
  },
];

const buttonsRows: SemanticColorRow[] = [
  {
    name: 'Primary',
    day: { hex: '#2D2C2E', opacity: 100 },
    night: { hex: '#CBCACC', opacity: 100 },
    description: 'Для кнопок, выполняющих главное или рекомендуемое действие.',
  },
  {
    name: 'Secondary',
    day: { hex: '#EBEDF0', opacity: 100 },
    night: { hex: '#504F52', opacity: 100 },
    description: 'Для кнопок, выполняющих второстепенное действие',
  },
  {
    name: 'Disabled',
    day: { hex: '#F5F5F5', opacity: 100 },
    night: { hex: '#373638', opacity: 100 },
    description: 'Неактивное состояние кнопок.',
  },
  {
    name: 'Positive',
    day: { hex: '#23AD58', opacity: 100 },
    night: { hex: '#23AD58', opacity: 100 },
    description: 'Акцентное состояние кнопок, в кейсе заказов.',
  },
  {
    name: 'Positive deep',
    day: { hex: '#0E8A3D', opacity: 100 },
    night: { hex: '#0E8A3D', opacity: 100 },
    description: 'Прогресс в акцентной кнопке.',
  },
  {
    name: 'Positive disabled',
    day: { hex: '#EDF5F0', opacity: 100 },
    night: { hex: '#373D39', opacity: 100 },
    description: 'Неактивное состояние акцентной кнопки.',
  },
  {
    name: 'Accent',
    day: { hex: '#8526FF', opacity: 100 },
    night: { hex: '#8526FF', opacity: 100 },
    description: 'Акцентное состояние для максимального привлечения внимания.',
  },
  {
    name: 'Accent deep',
    day: { hex: '#660BDB', opacity: 100 },
    night: { hex: '#660BDB', opacity: 100 },
    description: 'Акцентное состояние для максимального привлечения внимания.',
  },
  {
    name: 'Fab',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#504F52', opacity: 100 },
    description: 'Для навигационных FAB. Например, на карте.',
  },
];

const controlsRows: SemanticColorRow[] = [
  {
    name: 'Checked',
    day: { hex: '#2D2C2E', opacity: 100 },
    night: { hex: '#FFFFFF', opacity: 100 },
    description: '—',
  },
  {
    name: 'Unchecked',
    day: { hex: '#CBCACC', opacity: 100 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: '—',
  },
  {
    name: 'Key',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#2D2C2E', opacity: 100 },
    description: '—',
  },
];

const fieldsRows: SemanticColorRow[] = [
  {
    name: 'Primary 1',
    day: { hex: '#2D2C2E', opacity: 100 },
    night: { hex: '#CBCACC', opacity: 100 },
    description: 'Для текстовых полей в фокусе и в заполненном состоянии',
  },
  {
    name: 'Primary 2',
    day: { hex: '#EBEDF0', opacity: 100 },
    night: { hex: '#000000', opacity: 38 },
    description: 'Для поисковых полей в фокусе',
  },
  {
    name: 'Secondary 1',
    day: { hex: '#000000', opacity: 38 },
    night: { hex: '#FFFFFF', opacity: 38 },
    description: 'Для текстовых полей в неактивном состоянии',
  },
  {
    name: 'Secondary 2',
    day: { hex: '#F5F5F5', opacity: 100 },
    night: { hex: '#000000', opacity: 26 },
    description: 'Для поисковых полей в неактивном и заполненном состояниях',
  },
  {
    name: 'Disabled',
    day: { hex: '#000000', opacity: 26 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: 'Для текстовых полей в заблокированном состоянии',
  },
  {
    name: 'Warning',
    day: { hex: '#D62347', opacity: 100 },
    night: { hex: '#D62347', opacity: 100 },
    description: 'Для текстовых полей в состоянии ошибки',
  },
];

const messagesRows: SemanticColorRow[] = [
  {
    name: 'Default',
    day: { hex: '#EBEDF0', opacity: 100 },
    night: { hex: '#202021', opacity: 100 },
    description: 'Для отображения комментариев и для сообщений от собеседника',
  },
  {
    name: 'Push',
    day: { hex: '#2D2C2E', opacity: 100 },
    night: { hex: '#FFFFFF', opacity: 100 },
    description: 'Для отображения комментариев и для сообщений от собеседника',
  },
  {
    name: 'Action',
    day: { hex: '#8526FF', opacity: 100 },
    night: { hex: '#884DFF', opacity: 100 },
    description: 'Для отображения собственных сообщений',
  },
  {
    name: 'Positive',
    day: { hex: '#23AD58', opacity: 100 },
    night: { hex: '#23AD58', opacity: 100 },
    description: 'Для отображения сообщений, связанных с заказом',
  },
  {
    name: 'Attention',
    day: { hex: '#F0A11D', opacity: 100 },
    night: { hex: '#F0A11D', opacity: 100 },
    description: 'Для отображения сообщений, требующих внимания или ожидания',
  },
  {
    name: 'Warning',
    day: { hex: '#D62347', opacity: 100 },
    night: { hex: '#D62347', opacity: 100 },
    description: 'Для состояния ошибок и предупреждений',
  },
];

export const colorTokenCollection = {
  collectionName: 'colors-semantic',
  artifact: 'Colors/Semantic',
} as const;

export const semanticColorSections: SemanticColorSection[] = [
  { title: 'Bg', rows: bgRows },
  { title: 'Texts', rows: textsRows },
  { title: 'Icons', rows: iconsRows },
  { title: 'Strokes', rows: strokesRows },
  { title: 'Pastels', rows: pastelsRows },
  { title: 'Buttons', rows: buttonsRows },
  { title: 'Controls', rows: controlsRows },
  { title: 'Fields', rows: fieldsRows },
  { title: 'Messages', rows: messagesRows },
];
