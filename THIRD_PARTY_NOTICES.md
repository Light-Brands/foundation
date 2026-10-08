# Third party notices

## Fonts in the home screen monogram

`src/lib/pwa/monogram-fonts.ts` embeds a subset of one face from each brand pairing, cut down to A to Z and 0 to 9, to draw the home screen icon. Each subset is a Modified Version under the SIL Open Font License 1.1, shared under that license. The full license text is in `src/lib/pwa/fonts/OFL.txt`, and each subset keeps its copyright line in its own name table.

| Pairing | Family | Copyright | Source |
|---|---|---|---|
| sanctuary | Fraunces | Copyright 2020 The Fraunces Project Authors (github.com/undercasetype/Fraunces) | https://github.com/undercasetype/Fraunces |
| modern | Inter Tight | Copyright 2022 The Inter Project Authors (https://github.com/rsms/inter-tight) | https://github.com/rsms/inter-tight |
| editorial | Monogram Editorial, a subset of Playfair Display renamed as the license requires | Copyright 2017 The Playfair Display Project Authors (https://github.com/clauseggers/Playfair-Display), with Reserved Font Name "Playfair Display". | https://github.com/clauseggers/Playfair-Display |
| grotesk | Space Grotesk (Light) | Copyright 2020 The Space Grotesk Project Authors (https://github.com/floriankarsten/space-grotesk) | https://github.com/floriankarsten/space-grotesk |
| classic | Libre Baskerville | Copyright 2012 The Libre Baskerville Project Authors (https://github.com/impallari/Libre-Baskerville) | https://github.com/impallari/Libre-Baskerville |
| humanist | Plus Jakarta Sans | Copyright 2020 The Plus Jakarta Sans Project Authors (https://github.com/tokotype/PlusJakartaSans) | https://github.com/tokotype/PlusJakartaSans |

"Playfair Display" is a Reserved Font Name, so the editorial subset carries the family name "Monogram Editorial". The other five families declare no Reserved Font Name.

The pages themselves load each family through `next/font/google` at build time, unmodified, under the same license.
