# A voz da fadinha

## Identidade (preencher uma vez, nunca mais trocar)

```
voice_id:   (vazio — escolher com o usuário na primeira locução)
modelo:     eleven_multilingual_v2   (ou o multilíngue mais recente com pt-BR)
idioma:     pt-BR
escolhida:  (data)
```

Quando estiver vazio: apresente ao usuário 3 vozes femininas, jovens, suaves, em português, e
grave a escolha aqui. A partir daí toda locução usa este id. Trocar a voz entre reels é trocar a
mascote — a criança que ouviu a fadinha uma vez espera a mesma voz na próxima.

## Ajustes que funcionam para o tom dela

- `stability` alta (≈ 0,6–0,7): ela sussurra, não interpreta; oscilação demais soa nervosa.
- `similarity_boost` alta (≈ 0,8).
- `style` baixo (≈ 0,1–0,2): sem dramatização.
- Sem `speaker_boost` se a voz ficar metálica.

## Direção

Voz próxima, quase sussurrada, como quem conta um segredo para uma criança sentada do lado.
Não é apresentadora infantil: sem voz de desenho, sem agudo, sem exclamação. Ritmo desacelera
quando a cena fica real. Microfone perto, sem reverb (o reverb entra na montagem, se entrar).

As frases que pedem emoção contida, quase engasgada — grave-as separadas, mais lentas:
*"Esse sopro aconteceu mesmo."* · *"Quem faz a mágica são elas — e ela."*

## Um arquivo por fala

`voz/01.mp3`, `voz/02.mp3`… na ordem do roteiro. Fica fácil posicionar cada fala no tempo
(`voz.txt`: `arquivo|inicio`) e regravar uma só sem tocar nas outras. Pausas dentro de uma fala:
reticências ou travessão no texto — o modelo respeita.

## Efeitos sonoros (também pela ElevenLabs, ou de banco)

| efeito | onde entra |
|---|---|
| sino único, grave | o portal abrindo no gancho |
| sino agudo, resolvido | o convite, quando o anel fecha |
| faísca / poeira | cada vez que ela some |
| campainha de apartamento | a virada para o real |
| burburinho de festa, "parabéns" abafado | as cenas reais |

Trilha sem letra. Caixinha de música → cordas → **silêncio total na virada** → piano →
resolução. O silêncio é o efeito mais forte do filme; não o preencha.
