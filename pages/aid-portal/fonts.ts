/**
 * Шрифты портала — локально, из пакетов Fontsource (OFL-1.1), а не с
 * fonts.googleapis.com: Google Fonts из РФ работает медленно и нестабильно, по
 * той же причине, что и Cloudflare (ADR-038). Vite кладёт файлы шрифтов в
 * `assets/`, их отдаёт тот же шлюз, что и остальную статику.
 *
 * Только латиница и кириллица — портал пишет по-русски и по-английски.
 * Хром портала — Persefona Kit: Google Sans 400 и 500, код — Google Sans Code 400
 * (спека presentbook-6 §1.3). У Google Sans Code нет кириллицы — она идёт
 * запасным моно-стеком. Roboto — для превью типографики Driver и Rider
 * (контент продуктов, не хром).
 */
import '@fontsource/google-sans/latin-400.css';
import '@fontsource/google-sans/latin-500.css';
import '@fontsource/google-sans/cyrillic-400.css';
import '@fontsource/google-sans/cyrillic-500.css';
import '@fontsource/google-sans-code/latin-400.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import '@fontsource/roboto/cyrillic-400.css';
import '@fontsource/roboto/cyrillic-500.css';
import '@fontsource/roboto/cyrillic-700.css';
