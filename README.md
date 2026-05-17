# Mimic Log&Chat

A chat and dice log extension for [Owlbear Rodeo](https://owlbear.rodeo).

## Why it exists

Roll20 and Foundry have a built-in chat panel that extensions publish dice rolls and events to. Owlbear Rodeo has no equivalent.

Mimic Log&Chat fills that gap — primarily as a **dice log**, secondarily as a chat. Your default dice rolls will appear here automatically.

## Features

- **Room chat** — type a message, everyone sees it instantly
- **Inline dice** — wrap any expression in `[…]`: `[2d6]` `[1d20+4]` `[2d20kh1]`; or just type a bare expression like `2d6` on its own line
- **Full Markdown** — bold, italic, code, headings, lists, links
- **Images** — paste a direct image URL and it renders inline
- **Multiline input** — Shift+Enter for a new line; Enter sends
- **Input history** — Arrow Up/Down to cycle through previous messages
- **GM-only messages** — entries flagged `gmOnly` are invisible to players
- **Native publishers** — [Owl20](https://owl20.uberdragon.org/) and [ShadowDarklings Roller](https://darklings-roller.friendlymimic.com/) post directly into the log
- **Dice bridges** — roll events from Owlbear Rodeo Dice, Battle System Bones/Friends, and SD Character Sheet appear automatically
- **Dark and light theme** — follows the OBR theme setting automatically
- **Open API** — any OBR extension can post into the log; see [API-README.md](API-README.md)

## Installation

Add this URL as an extension in Owlbear Rodeo:

```
https://mimiclog.friendlymimic.com/manifest.json
```

## Quick reference

Type `/h` in the chat input for an in-app help summary.

## Links

- [About / documentation](https://mimiclog.friendlymimic.com/about.html)
- [GitHub](https://github.com/mvoncken/mimic-chat)
- [Developer API](API-README.md)
