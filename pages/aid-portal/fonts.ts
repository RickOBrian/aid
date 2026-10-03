/**
 * Шрифты портала — локально, из пакетов Fontsource (OFL-1.1), а не с
 * fonts.googleapis.com: Google Fonts из РФ работает медленно и нестабильно, по
 * той же причине, что и Cloudflare (ADR-038). Vite кладёт файлы шрифтов в
 * `assets/`, их отдаёт тот же шлюз, что и остальную статику.
 *
 * Только латиница и кириллица — портал пишет по-русски и по-английски.
 * Начертания — те же, что раньше запрашивались у Google Fonts.
 */
import '@fontsource/google-sans/latin-400.css';
import '@fontsource/google-sans/latin-500.css';
import '@fontsource/google-sans/latin-600.css';
import '@fontsource/google-sans/latin-700.css';
import '@fontsource/google-sans/cyrillic-400.css';
import '@fontsource/google-sans/cyrillic-500.css';
import '@fontsource/google-sans/cyrillic-600.css';
import '@fontsource/google-sans/cyrillic-700.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import '@fontsource/roboto/cyrillic-400.css';
import '@fontsource/roboto/cyrillic-500.css';
import '@fontsource/roboto/cyrillic-700.css';
