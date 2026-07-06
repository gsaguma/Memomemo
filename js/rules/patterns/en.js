const HE_SHE_IT = /\b(he|she|it|this|that|who)\s+(\w+)\b/gi;

export const patterns = [
    { re: /\b(?:could|would|should)\s+of\b/i, msg: '"$&" incorrecto — usar "could/would/should have"' },
    { re: /\b(?:dont|cant|wont|didnt|isnt|doesnt|wasnt|arent|havent|couldnt|wouldnt|shouldnt)\b/i, msg: 'Falta apóstrofe en "$&"' },
    { re: /\balot\b/i, msg: '"alot" incorrecto — usar "a lot"' },
    { re: /\bgonna\b/i, msg: '"gonna" informal — usar "going to"' },
    { re: /\bwanna\b/i, msg: '"wanna" informal — usar "want to"' },
    { re: /\bgotta\b/i, msg: '"gotta" informal — usar "got to"' },
];
