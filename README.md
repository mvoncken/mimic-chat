# Mimic Chat

A chat extension for [Owlbear Rodeo](https://owlbear.rodeo).

## Why it exists

Owlbear Rodeo has no built-in persistent chat. When players want to communicate, they have to use a separate Discord, a phone, or shout across the table. Mimic Chat fills that gap: a dedicated chat window that lives inside your OBR session, visible to everyone at the table, without leaving the game interface.

## Features

- **Plain-text room chat** — type a message, everyone in the session sees it instantly
- **Dice roll feed** — roll events from [ShadowDarklings Roller](https://darklings-roller.friendlymimic.com) appear in the same log, so nothing is missed
- **Chronological order** — messages appear oldest-at-top, newest-at-bottom, auto-scrolling to the latest entry (like every chat app you've ever used)
- **Dark and light theme** — follows the OBR theme setting automatically

## Installation

Add this URL as an extension in Owlbear Rodeo:

```
https://mimiclog.friendlymimic.com/manifest.json
```

## Planned

- Multiple event sources (other OBR extensions can push entries into the log)
- Timestamps
