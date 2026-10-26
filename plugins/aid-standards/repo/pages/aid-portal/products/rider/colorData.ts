/**
 * Rider semantic color tokens from Figma «🤑 WB AID Rider Tokens - Styles», section color-sem (node 28:2282).
 * Source: https://www.figma.com/design/yrfG6u9osujKX8e1B14lpT/?node-id=28-2282
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

const BackgroundRows: SemanticColorRow[] = [
  {
    name: 'Primary',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#202024', opacity: 100 },
    description: 'Основной фон в светлой теме',
  },
  {
    name: 'Secondary',
    day: { hex: '#F5F5F5', opacity: 100 },
    night: { hex: '#2A2A31', opacity: 100 },
    description: 'Дополнительный фон в светлой теме',
  },
  {
    name: 'Tertiary',
    day: { hex: '#0F0F1F', opacity: 12 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: '',
  },
  {
    name: 'Quaternary',
    day: { hex: '#0F0F1F', opacity: 26 },
    night: { hex: '#0F0F1F', opacity: 54 },
    description: 'Для оверлея',
  },
  {
    name: 'Primary Overlay',
    day: { hex: '#FFFFFF', opacity: 70 },
    night: { hex: '#0F0F1F', opacity: 54 },
    description: 'Для использования в бейджах',
  },
  {
    name: 'Tooltip',
    day: { hex: '#34343D', opacity: 100 },
    night: { hex: '#EEEEEE', opacity: 100 },
    description: 'Бэк для тултипов в светлой теме',
  },
  {
    name: 'Promo',
    day: { hex: '#34343D', opacity: 100 },
    night: { hex: '#5F6073', opacity: 100 },
    description: 'Бэк для шильдиков промокодов и помощника',
  },
  {
    name: 'Accent',
    day: { hex: '#8526FF', opacity: 100 },
    night: { hex: '#884DFF', opacity: 100 },
    description: 'Акцентный бэкграунд для свитчеров',
  },
  {
    name: 'Success Surface',
    day: { hex: '#D6EDE1', opacity: 100 },
    night: { hex: '#D6EDE1', opacity: 100 },
    description: 'Для каллаута',
  },
  {
    name: 'Success',
    day: { hex: '#23AD58', opacity: 100 },
    night: { hex: '#23AD58', opacity: 100 },
    description: 'Акцентный бэкграунд для тостов',
  },
  {
    name: 'Attention Surface',
    day: { hex: '#F9E8BF', opacity: 100 },
    night: { hex: '#F9E8BF', opacity: 100 },
    description: 'Для каллаута',
  },
  {
    name: 'Attention',
    day: { hex: '#FFC700', opacity: 100 },
    night: { hex: '#FFC700', opacity: 100 },
    description: 'Для отображения номера авто и предупреждений',
  },
  {
    name: 'Attention Deep',
    day: { hex: '#FF7200', opacity: 100 },
    night: { hex: '#FF7200', opacity: 100 },
    description: 'Для отображения низкого заряда в самокатах',
  },
  {
    name: 'Warning',
    day: { hex: '#D62347', opacity: 100 },
    night: { hex: '#D62347', opacity: 100 },
    description: 'Для отображения критическийх предупреждений',
  },
  {
    name: 'Constant White',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#FFFFFF', opacity: 100 },
    description: 'Постоянный белый бэкграунд',
  },
  {
    name: 'Constant White Secondary',
    day: { hex: '#FFFFFF', opacity: 50 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: 'Второстепенный постоянный белый цвет на контрастных ему фонах',
  },
  {
    name: 'Constant Dark',
    day: { hex: '#202024', opacity: 100 },
    night: { hex: '#202024', opacity: 100 },
    description: 'Постоянный тёмный бэкграунд',
  },
  {
    name: 'Constant Dark Secondary',
    day: { hex: '#393944', opacity: 100 },
    night: { hex: '#393944', opacity: 100 },
    description: 'Фон карточки в программе лояльности',
  },
  {
    name: 'Zone Parking',
    day: { hex: '#005AFF', opacity: 15 },
    night: { hex: '#005AFF', opacity: 15 },
    description: 'Бэк для зоны парковки в кикшеринге',
  },
  {
    name: 'Zone Attention',
    day: { hex: '#FF7200', opacity: 10 },
    night: { hex: '#FF7200', opacity: 10 },
    description: 'Бэк для зоны ограничения скорости в кикшеринге',
  },
  {
    name: 'Zone Warning',
    day: { hex: '#D62347', opacity: 10 },
    night: { hex: '#D62347', opacity: 10 },
    description: 'Бэк запретной зоны для катания в кикшеринге',
  },
  {
    name: 'Splash',
    day: { hex: '#54008C', opacity: 100 },
    night: { hex: '#54008C', opacity: 100 },
    description: 'Для сплеш скрина',
  },
  {
    name: 'Navbar',
    day: { hex: '#F5F5F5', opacity: 60 },
    night: { hex: '#2A2A31', opacity: 60 },
    description: 'Навигационная панель внизу экрана',
  },
  {
    name: 'Energy',
    day: { hex: '#21CA8B', opacity: 100 },
    night: { hex: '#27D494', opacity: 100 },
    description: 'Уровень зарядки самоката',
  },
  {
    name: 'Neon',
    day: { hex: '#9DFF00', opacity: 100 },
    night: { hex: '#9DFF00', opacity: 100 },
    description: 'Фон маркеров и уведомлений в навбаре',
  },
  {
    name: 'Separator',
    day: { hex: '#777788', opacity: 20 },
    night: { hex: '#777788', opacity: 30 },
    description: 'Цвет для дивайдеров и разделителей',
  },
  {
    name: 'Overlay',
    day: { hex: '#000000', opacity: 30 },
    night: { hex: '#000000', opacity: 30 },
    description: 'Цвет заливки фона при открытии модалок',
  }
];

const TextRows: SemanticColorRow[] = [
  {
    name: 'Primary',
    day: { hex: '#0F0F1F', opacity: 87 },
    night: { hex: '#F8FAFF', opacity: 100 },
    description: 'Основной текст',
  },
  {
    name: 'Secondary',
    day: { hex: '#0F0F1F', opacity: 54 },
    night: { hex: '#FFFFFF', opacity: 50 },
    description: 'Второстепенный текст, подписи, пояснения',
  },
  {
    name: 'Tertiary',
    day: { hex: '#0F0F1F', opacity: 38 },
    night: { hex: '#FFFFFF', opacity: 38 },
    description: 'Подписи, неактивные состояния в полях, тексты на малозначимых элементах интерфейса',
  },
  {
    name: 'Disabled',
    day: { hex: '#0F0F1F', opacity: 26 },
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
    name: 'Warning',
    day: { hex: '#D62347', opacity: 100 },
    night: { hex: '#D62347', opacity: 100 },
    description: 'Для состояния ошибок',
  },
  {
    name: 'Success',
    day: { hex: '#23AD58', opacity: 100 },
    night: { hex: '#23AD58', opacity: 100 },
    description: 'Акцентные тексты',
  },
  {
    name: 'Special',
    day: { hex: '#005AFF', opacity: 100 },
    night: { hex: '#005AFF', opacity: 100 },
    description: '',
  },
  {
    name: 'Attention',
    day: { hex: '#FFC700', opacity: 100 },
    night: { hex: '#FFC700', opacity: 100 },
    description: 'Для предупреждений',
  },
  {
    name: 'Attention Deep',
    day: { hex: '#FF7200', opacity: 100 },
    night: { hex: '#FF7200', opacity: 100 },
    description: 'Для особо важных предупреждений',
  },
  {
    name: 'Neon',
    day: { hex: '#9DFF00', opacity: 100 },
    night: { hex: '#9DFF00', opacity: 100 },
    description: ' ',
  },
  {
    name: 'Primary Opposite',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#0F0F1F', opacity: 87 },
    description: 'Основной текст для тёмных областей',
  },
  {
    name: 'Secondary Opposite',
    day: { hex: '#E9EAEE', opacity: 100 },
    night: { hex: '#393944', opacity: 100 },
    description: '',
  },
  {
    name: 'Tertiary Opposite',
    day: { hex: '#FFFFFF', opacity: 38 },
    night: { hex: '#0F0F1F', opacity: 38 },
    description: 'Подписи и неактивные состояния для тёмных областей',
  },
  {
    name: 'Constant Black',
    day: { hex: '#0F0F1F', opacity: 87 },
    night: { hex: '#0F0F1F', opacity: 87 },
    description: 'Постоянный тёмный цвет таекста на белых кнопках в сторисах',
  },
  {
    name: 'Constant White',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#F8FAFF', opacity: 100 },
    description: 'Постоянный белый цвет на контрастных ему фонах — как в светлой, так и в тёмной теме',
  },
  {
    name: 'Constant White Secondary',
    day: { hex: '#FFFFFF', opacity: 50 },
    night: { hex: '#FFFFFF', opacity: 50 },
    description: 'Второстепенный постоянный белый цвет на контрастных ему фонах — как в светлой, так и в тёмной теме',
  },
  {
    name: 'Primary Clean',
    day: { hex: '#393944', opacity: 100 },
    night: { hex: '#D6D7DC', opacity: 100 },
    description: '',
  },
  {
    name: 'Secondary Clean',
    day: { hex: '#7E7E86', opacity: 100 },
    night: { hex: '#7E7E86', opacity: 100 },
    description: '',
  }
];

const IconRows: SemanticColorRow[] = [
  {
    name: 'Primary',
    day: { hex: '#0F0F1F', opacity: 87 },
    night: { hex: '#F8FAFF', opacity: 100 },
    description: 'Для важных акцентных состояний. Когда иконка является ключевой составляющей элемента.',
  },
  {
    name: 'Secondary',
    day: { hex: '#0F0F1F', opacity: 54 },
    night: { hex: '#FFFFFF', opacity: 50 },
    description: 'Для иконок действий',
  },
  {
    name: 'Tertiary',
    day: { hex: '#0F0F1F', opacity: 38 },
    night: { hex: '#FFFFFF', opacity: 38 },
    description: 'Для информационных иконок',
  },
  {
    name: 'Disabled',
    day: { hex: '#0F0F1F', opacity: 26 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: 'В неактивном состоянии',
  },
  {
    name: 'Accent',
    day: { hex: '#8526FF', opacity: 100 },
    night: { hex: '#9966FF', opacity: 100 },
    description: 'Акцентное состояние для максимального привлечения внимания.',
  },
  {
    name: 'Warning',
    day: { hex: '#D62347', opacity: 100 },
    night: { hex: '#D62347', opacity: 100 },
    description: 'Для состояния ошибок',
  },
  {
    name: 'Success',
    day: { hex: '#23AD58', opacity: 100 },
    night: { hex: '#23AD58', opacity: 100 },
    description: 'Акцентное состояние',
  },
  {
    name: 'Special',
    day: { hex: '#005AFF', opacity: 100 },
    night: { hex: '#005AFF', opacity: 100 },
    description: '',
  },
  {
    name: 'Attention',
    day: { hex: '#FFC700', opacity: 100 },
    night: { hex: '#FFC700', opacity: 100 },
    description: 'Для предупреждений',
  },
  {
    name: 'Attention Deep',
    day: { hex: '#FF7200', opacity: 100 },
    night: { hex: '#FF7200', opacity: 100 },
    description: 'Для особо важных предупреждений',
  },
  {
    name: 'Neon',
    day: { hex: '#9DFF00', opacity: 100 },
    night: { hex: '#9DFF00', opacity: 100 },
    description: ' ',
  },
  {
    name: 'Primary Opposite',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#0F0F1F', opacity: 87 },
    description: 'Для важных акцентных состояний на тёмном фоне',
  },
  {
    name: 'Secondary Opposite',
    day: { hex: '#E9EAEE', opacity: 100 },
    night: { hex: '#393944', opacity: 100 },
    description: 'Драгер',
  },
  {
    name: 'Tertiary Opposite',
    day: { hex: '#FFFFFF', opacity: 38 },
    night: { hex: '#0F0F1F', opacity: 38 },
    description: '',
  },
  {
    name: 'Constant Black',
    day: { hex: '#0F0F1F', opacity: 87 },
    night: { hex: '#0F0F1F', opacity: 87 },
    description: '',
  },
  {
    name: 'Constant White',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#F8FAFF', opacity: 100 },
    description: 'Постоянный белый цвет на контрастных ему фонах — как и в светлой, так и в тёмной теме',
  },
  {
    name: 'Constant White Secondary',
    day: { hex: '#FFFFFF', opacity: 50 },
    night: { hex: '#FFFFFF', opacity: 50 },
    description: 'Второстепенный постоянный белый цвет на контрастных ему фонах — как в светлой, так и в тёмной теме',
  },
  {
    name: 'Primary Clean',
    day: { hex: '#393944', opacity: 100 },
    night: { hex: '#D6D7DC', opacity: 100 },
    description: 'Основной цвет для иконок на карте',
  },
  {
    name: 'Secondary Clean',
    day: { hex: '#7E7E86', opacity: 100 },
    night: { hex: '#7E7E86', opacity: 100 },
    description: 'Второстепенный цвет для иконок на карте',
  }
];

const StrokeRows: SemanticColorRow[] = [
  {
    name: 'Primary',
    day: { hex: '#E9EAEE', opacity: 100 },
    night: { hex: '#393944', opacity: 100 },
    description: '',
  },
  {
    name: 'Disabled',
    day: { hex: '#0F0F1F', opacity: 38 },
    night: { hex: '#FFFFFF', opacity: 38 },
    description: 'Зоны запрещённые для парковки на самокатах',
  },
  {
    name: 'Accent',
    day: { hex: '#8526FF', opacity: 100 },
    night: { hex: '#9966FF', opacity: 100 },
    description: '',
  },
  {
    name: 'Warning',
    day: { hex: '#D62347', opacity: 100 },
    night: { hex: '#D62347', opacity: 100 },
    description: '',
  },
  {
    name: 'Special',
    day: { hex: '#A8C6FF', opacity: 100 },
    night: { hex: '#005AFF', opacity: 100 },
    description: 'Зона парковки самокатов',
  },
  {
    name: 'Special Deep',
    day: { hex: '#3458E9', opacity: 100 },
    night: { hex: '#A8C6FF', opacity: 100 },
    description: ' ',
  },
  {
    name: 'Attention',
    day: { hex: '#FFC700', opacity: 100 },
    night: { hex: '#FFC700', opacity: 100 },
    description: 'Зона ограничения скорости в самокатах',
  },
  {
    name: 'Attention Deep',
    day: { hex: '#FF7200', opacity: 100 },
    night: { hex: '#FF7200', opacity: 100 },
    description: 'Для особо важных предупреждений',
  },
  {
    name: 'Opposite',
    day: { hex: '#393944', opacity: 100 },
    night: { hex: '#D6D7DC', opacity: 100 },
    description: 'Линия построенного маршрута на экране прайсинга / перенёс в Route',
  },
  {
    name: 'Separator',
    day: { hex: '#777788', opacity: 20 },
    night: { hex: '#777788', opacity: 30 },
    description: 'Цвет для дивайдеров и разделителей',
  },
  {
    name: 'Contrast',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#0F0F1F', opacity: 100 },
    description: ' ',
  },
  {
    name: 'Neon',
    day: { hex: '#9DFF00', opacity: 100 },
    night: { hex: '#9DFF00', opacity: 100 },
    description: ' ',
  }
];

const PastelRows: SemanticColorRow[] = [
  {
    name: 'Barney',
    day: { hex: '#EEEEEE', opacity: 100 },
    night: { hex: '#363636', opacity: 100 },
    description: '',
  },
  {
    name: 'Lenny',
    day: { hex: '#E7F1EC', opacity: 100 },
    night: { hex: '#3D4340', opacity: 100 },
    description: '',
  },
  {
    name: 'Lisa',
    day: { hex: '#EDE4E4', opacity: 100 },
    night: { hex: '#3B3838', opacity: 100 },
    description: '',
  },
  {
    name: 'Bart',
    day: { hex: '#F3EBDA', opacity: 100 },
    night: { hex: '#363430', opacity: 100 },
    description: '',
  },
  {
    name: 'Apu',
    day: { hex: '#4E4E60', opacity: 100 },
    night: { hex: '#2D2D38', opacity: 100 },
    description: '',
  },
  {
    name: 'Ralph',
    day: { hex: '#303038', opacity: 100 },
    night: { hex: '#34343D', opacity: 100 },
    description: '',
  },
  {
    name: 'Moe',
    day: { hex: '#E5EBF1', opacity: 100 },
    night: { hex: '#484957', opacity: 100 },
    description: '',
  },
  {
    name: 'Joe',
    day: { hex: '#EBEFE3', opacity: 100 },
    night: { hex: '#3D3F39', opacity: 100 },
    description: '',
  },
  {
    name: 'Jasper',
    day: { hex: '#F2E3F2', opacity: 100 },
    night: { hex: '#40383F', opacity: 100 },
    description: '',
  },
  {
    name: 'Hans',
    day: { hex: '#E5E6F1', opacity: 100 },
    night: { hex: '#3F4048', opacity: 100 },
    description: '',
  },
  {
    name: 'Martin',
    day: { hex: '#E9F1F2', opacity: 100 },
    night: { hex: '#383D40', opacity: 100 },
    description: '',
  },
  {
    name: 'Milhouse',
    day: { hex: '#EFE7F9', opacity: 100 },
    night: { hex: '#3F3D42', opacity: 100 },
    description: '',
  },
  {
    name: 'Nelson',
    day: { hex: '#D6EDE1', opacity: 100 },
    night: { hex: '#393F3B', opacity: 100 },
    description: '',
  },
  {
    name: 'Patty',
    day: { hex: '#E6EFF8', opacity: 100 },
    night: { hex: '#3D3F42', opacity: 100 },
    description: '',
  },
  {
    name: 'Selma',
    day: { hex: '#F8E6F3', opacity: 100 },
    night: { hex: '#413D40', opacity: 100 },
    description: '',
  },
  {
    name: 'Maggie',
    day: { hex: '#ECE3FF', opacity: 100 },
    night: { hex: '#3E3C44', opacity: 100 },
    description: '',
  }
];

const TechnicalRows: SemanticColorRow[] = [
  {
    name: 'Invisible Deep',
    day: { hex: '#000000', opacity: 100 },
    night: { hex: '#000000', opacity: 100 },
    description: 'Технический цвет',
  },
  {
    name: 'Invisible Surface',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#FFFFFF', opacity: 100 },
    description: 'Технический цвет',
  },
  {
    name: 'Visible Deep',
    day: { hex: '#000000', opacity: 100 },
    night: { hex: '#000000', opacity: 100 },
    description: 'Для оверлея в андроиде',
  }
];

const ButtonRows: SemanticColorRow[] = [
  {
    name: 'Primary',
    day: { hex: '#8526FF', opacity: 100 },
    night: { hex: '#884DFF', opacity: 100 },
    description: 'Для кнопок, выполняющих главное или рекомендуемое действие.',
  },
  {
    name: 'Secondary',
    day: { hex: '#E9EAEE', opacity: 100 },
    night: { hex: '#393944', opacity: 100 },
    description: 'Для кнопок, выполняющих второстепенное или нерекомендованное дейсвие',
  },
  {
    name: 'Disabled',
    day: { hex: '#F5F5F5', opacity: 100 },
    night: { hex: '#2B2D34', opacity: 100 },
    description: 'Неактивное состояние кнопок.',
  },
  {
    name: 'Constant White',
    day: { hex: '#FFFFFF', opacity: 100 },
    night: { hex: '#FFFFFF', opacity: 100 },
    description: 'Для белых кнопок',
  },
  {
    name: 'Constant White Secondary',
    day: { hex: '#FFFFFF', opacity: 50 },
    night: { hex: '#FFFFFF', opacity: 50 },
    description: 'Для кнопок, выполняющих второстепенное действие в паре с белой',
  },
  {
    name: 'Warning',
    day: { hex: '#D62347', opacity: 100 },
    night: { hex: '#D62347', opacity: 100 },
    description: 'Акцентное состояние кнопок, в кейсе экстренной помощи.',
  },
  {
    name: 'Apple Pay',
    day: { hex: '#000000', opacity: 100 },
    night: { hex: '#000000', opacity: 100 },
    description: 'Для кнопки Apple Pay',
  },
  {
    name: 'Sber Pay',
    day: { hex: '#21A038', opacity: 100 },
    night: { hex: '#21A038', opacity: 100 },
    description: 'Для кнопки Sber Pay',
  }
];

const LegacyButtonRows: SemanticColorRow[] = [
  {
    name: 'Pressed',
    day: { hex: '#9966FF', opacity: 100 },
    night: { hex: '#9966FF', opacity: 100 },
    description: 'Для нажатого состояния старой Primary кнопки',
  },
  {
    name: 'Secondary Pressed',
    day: { hex: '#E9EAEE', opacity: 100 },
    night: { hex: '#393944', opacity: 100 },
    description: 'Для нажатого состояния старой кнопки',
  },
  {
    name: 'Secondary Accent',
    day: { hex: '#393944', opacity: 100 },
    night: { hex: '#393944', opacity: 100 },
    description: 'Для старой кнопки Secondary Accent',
  },
  {
    name: 'Secondary Accent Pressed',
    day: { hex: '#7E7E86', opacity: 100 },
    night: { hex: '#2A2A31', opacity: 100 },
    description: 'Для нажатого состояния старой Secondary Accent кнопки',
  },
  {
    name: 'Secondary Alpha',
    day: { hex: '#FFFFFF', opacity: 26 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: 'Для старой кнопки Secondary Alpha',
  },
  {
    name: 'Disabled Alpha',
    day: { hex: '#FFFFFF', opacity: 26 },
    night: { hex: '#FFFFFF', opacity: 16 },
    description: 'Для Disabled состояния старой кнопки Secondary Alpha',
  },
  {
    name: 'Warning Pressed',
    day: { hex: '#C71C3E', opacity: 100 },
    night: { hex: '#C71C3E', opacity: 100 },
    description: 'Для Pressed состояния кнопки Warning',
  }
];

const FieldRows: SemanticColorRow[] = [
  {
    name: 'Primary',
    day: { hex: '#F5F5F5', opacity: 100 },
    night: { hex: '#2B2D34', opacity: 100 },
    description: 'Заливка используется в состояниях text-field&amp;#39;a, таких как: empty, disabled, filled',
  },
  {
    name: 'Focused',
    day: { hex: '#E9EAEE', opacity: 100 },
    night: { hex: '#393944', opacity: 100 },
    description: 'Заливка используется в состоянии focused',
  }
];

const RouteRows: SemanticColorRow[] = [
  {
    name: 'Primary',
    day: { hex: '#393944', opacity: 100 },
    night: { hex: '#D6D7DC', opacity: 100 },
    description: 'Линия построенного маршрута на экране прайсинга',
  },
  {
    name: 'Primary Overlay',
    day: { hex: '#FFFFFF', opacity: 38 },
    night: { hex: '#0F0F1F', opacity: 54 },
    description: 'Цвет поверх полилайна',
  },
  {
    name: 'Traffic Free',
    day: { hex: '#23AD58', opacity: 100 },
    night: { hex: '#23AD58', opacity: 100 },
    description: 'Цвет пробок',
  },
  {
    name: 'Traffic Slow',
    day: { hex: '#FFC700', opacity: 100 },
    night: { hex: '#FFC700', opacity: 100 },
    description: 'Цвет пробок',
  },
  {
    name: 'Traffic Congested',
    day: { hex: '#FC3434', opacity: 100 },
    night: { hex: '#FC3434', opacity: 100 },
    description: 'Цвет пробок',
  },
  {
    name: 'Traffic Blocked',
    day: { hex: '#A12806', opacity: 100 },
    night: { hex: '#A12806', opacity: 100 },
    description: 'Цвет пробок',
  }
];

const StoriesRows: SemanticColorRow[] = [
  {
    name: 'Smithers',
    day: { hex: '#EFF6E5', opacity: 100 },
    night: { hex: '#EFF6E5', opacity: 100 },
    description: '',
  },
  {
    name: 'Carl',
    day: { hex: '#DAEADE', opacity: 100 },
    night: { hex: '#DAEADE', opacity: 100 },
    description: '',
  },
  {
    name: 'Brockman',
    day: { hex: '#DBECEB', opacity: 100 },
    night: { hex: '#DBECEB', opacity: 100 },
    description: '',
  },
  {
    name: 'Krusty',
    day: { hex: '#E8EFFA', opacity: 100 },
    night: { hex: '#E8EFFA', opacity: 100 },
    description: '',
  },
  {
    name: 'Clancy',
    day: { hex: '#DFE3F5', opacity: 100 },
    night: { hex: '#DFE3F5', opacity: 100 },
    description: '',
  },
  {
    name: 'Larry',
    day: { hex: '#E4E2F6', opacity: 100 },
    night: { hex: '#E4E2F6', opacity: 100 },
    description: '',
  },
  {
    name: 'Manjula',
    day: { hex: '#F7E1F7', opacity: 100 },
    night: { hex: '#F7E1F7', opacity: 100 },
    description: '',
  },
  {
    name: 'Mona',
    day: { hex: '#FBE7F5', opacity: 100 },
    night: { hex: '#FBE7F5', opacity: 100 },
    description: '',
  },
  {
    name: 'Maggie',
    day: { hex: '#FFEAE8', opacity: 100 },
    night: { hex: '#FFEAE8', opacity: 100 },
    description: '',
  },
  {
    name: 'Ned',
    day: { hex: '#FFF1E5', opacity: 100 },
    night: { hex: '#FFF1E5', opacity: 100 },
    description: '',
  }
];

export const colorTokenCollection = {
  collectionName: 'rider-colors-semantic',
  artifact: 'Rider Colors/Semantic',
} as const;

export const semanticColorSections: SemanticColorSection[] = [
  { title: 'Background', rows: BackgroundRows },
  { title: 'Text', rows: TextRows },
  { title: 'Icon', rows: IconRows },
  { title: 'Stroke', rows: StrokeRows },
  { title: 'Pastel', rows: PastelRows },
  { title: 'Technical', rows: TechnicalRows },
  { title: 'Button', rows: ButtonRows },
  { title: 'Legacy Button', rows: LegacyButtonRows },
  { title: 'Field', rows: FieldRows },
  { title: 'Route', rows: RouteRows },
  { title: 'Stories', rows: StoriesRows },
];
