import m from './slices/modals.json' with { type: 'json' };

const body = `    if (debugPanel) debugPanel.classList.add("hidden");
    setCogClickCount(0);
  }`;

const undoStateSetters = (s) => {
  let out = s;
  for (const [name, setter] of Object.entries(m.stateSetters || {})) {
    const re = new RegExp(`(?<![\\w$.])${setter}\\(([^()]*)\\)`, 'g');
    console.log('  regex:', re.source, '| setter:', JSON.stringify(setter));
    out = out.replace(re, `${name} = $1;`);
  }
  return out;
};

console.log('stateSetters =', JSON.stringify(m.stateSetters));
console.log('result =', JSON.stringify(undoStateSetters(body)));
