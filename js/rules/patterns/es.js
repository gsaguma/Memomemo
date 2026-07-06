export const patterns = [
    { re: /\bhaiga\b/i, msg: '"haiga" incorrecto — usar "haya"' },
    { re: /\bhabemos\b/i, msg: '"habemos" incorrecto — usar "hay" o "somos"' },
    { re: /\bnadien\b/i, msg: '"nadien" incorrecto — usar "nadie"' },
    { re: /\b(\w+)(astes|istes)\b/i, msg: 'Terminación "$2" incorrecta — usar "$1aste" o "$1iste"' },
    { re: /\btubo\s+(?:que|de)\b/i, msg: '"tubo" seguido de preposición — ¿quiso decir "tuvo"?' },
    { re: /\bbotar\s+(?:a|en|por|un|una)\s+(?:la\s+)?(?:basura|papel|desecho)\b/i, msg: '"botar" con desecho — ¿"tirar / desechar"?' },
    { re: /\b(?:de|en)\s+base\s+a\b/i, msg: '"en base a" — preferir "basado en" o "con base en"' },
    { re: /\ba\s+nivel\s+de\b/i, msg: '"a nivel de" — preferir "en el ámbito de" o "en términos de"' },
];
