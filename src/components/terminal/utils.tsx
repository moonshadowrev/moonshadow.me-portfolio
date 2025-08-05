export const parseAnsiColors = (text: string): JSX.Element[] => {
  const ansiRegex = /\x1b\[([0-9;]*)m/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let currentClasses = [];

  const ansiToClass = {
    '30': 'text-terminal-black',
    '31': 'text-terminal-red',
    '32': 'text-terminal-green',
    '33': 'text-terminal-yellow',
    '34': 'text-terminal-blue',
    '35': 'text-terminal-magenta',
    '36': 'text-terminal-cyan',
    '37': 'text-terminal-white',
    '90': 'text-terminal-bright-black',
    '91': 'text-terminal-bright-red',
    '92': 'text-terminal-bright-green',
    '93': 'text-terminal-bright-yellow',
    '94': 'text-terminal-bright-blue',
    '95': 'text-terminal-bright-magenta',
    '96': 'text-terminal-bright-cyan',
    '97': 'text-terminal-bright-white',
    '1': 'font-bold',
    '0': '', // reset
  };

  while ((match = ansiRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index);
      if (textContent) {
        parts.push(
          <span key={parts.length} className={currentClasses.join(' ')}>
            {textContent}
          </span>
        );
      }
    }

    const codes = match[1].split(';');
    codes.forEach(code => {
      if (code === '0') {
        currentClasses = [];
      } else if (ansiToClass[code]) {
        if (code === '1') {
          currentClasses.push(ansiToClass[code]);
        } else {
          currentClasses = currentClasses.filter(c => !c.startsWith('text-terminal-'));
          currentClasses.push(ansiToClass[code]);
        }
      }
    });

    lastIndex = ansiRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    const textContent = text.slice(lastIndex);
    if (textContent) {
      parts.push(
        <span key={parts.length} className={currentClasses.join(' ')}>
          {textContent}
        </span>
      );
    }
  }

  return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
};