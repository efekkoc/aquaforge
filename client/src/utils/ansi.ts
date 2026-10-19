/**
 * Converts standard Minecraft/Terminal ANSI escape sequences to HTML with styling.
 */
export function ansiToHtml(text: string): string {
  const colorMap: { [key: string]: string } = {
    '0': 'color: #e2e8f0; font-weight: normal;', // reset
    '1': 'font-weight: bold;',
    '30': 'color: #64748b;', // black / dark gray
    '31': 'color: #ef4444;', // red
    '32': 'color: #22c55e;', // green
    '33': 'color: #eab308;', // yellow
    '34': 'color: #3b82f6;', // blue
    '35': 'color: #d946ef;', // magenta
    '36': 'color: #06b6d4;', // cyan
    '37': 'color: #f8fafc;', // white
    '90': 'color: #94a3b8;', // bright black
    '91': 'color: #f87171;', // bright red
    '92': 'color: #4ade80;', // bright green
    '93': 'color: #fde047;', // bright yellow
    '94': 'color: #60a5fa;', // bright blue
    '95': 'color: #e879f9;', // bright magenta
    '96': 'color: #67e8f9;', // bright cyan
    '97': 'color: #ffffff;', // bright white
  };

  // Escape HTML characters first
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Replace ANSI escape codes with spans
  const ansiRegex = /\x1b\[([0-9;]+)m/g;
  let hasOpenSpan = false;

  const result = escaped.replace(ansiRegex, (match, code) => {
    const codes = code.split(';');
    let style = '';

    for (const c of codes) {
      if (colorMap[c]) {
        style += colorMap[c] + ' ';
      }
    }

    if (code === '0') {
      if (hasOpenSpan) {
        hasOpenSpan = false;
        return '</span>';
      }
      return '';
    }

    const prefix = hasOpenSpan ? '</span>' : '';
    hasOpenSpan = true;
    return `${prefix}<span style="${style.trim()}">`;
  });

  return hasOpenSpan ? result + '</span>' : result;
}
