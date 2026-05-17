# Mimic Chat&Log

A chat and dice log extension for [Owlbear Rodeo](https://owlbear.rodeo).

## Why it exists

Owlbear Rodeo has no built-in persistent chat. Mimic Chat&Log fills that gap: a shared log that lives inside your OBR session, visible to everyone at the table, without leaving the game interface.

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
