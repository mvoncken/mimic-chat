# Mimic Log&Chat — External Developer API

Mimic Log&Chat is an Owlbear Rodeo action panel that displays a shared chat log. External extensions can post messages into it using OBR's broadcast API.

## Minimal example

```js
import OBR from '@owlbear-rodeo/sdk'

await OBR.onReady(() => {
  OBR.broadcast.sendMessage(
    'com.friendlymimic.mimic-chat/md',
    { md: 'The dungeon rumbles...', title: 'DM' },
    { destination: 'ALL' }
  )
})
```

---

## Channels

| Channel | Direction | Destination |
|---|---|---|
| `com.friendlymimic.mimic-chat/md` | **send to post (preferred)** | `ALL` (or `LOCAL`) |
| `com.friendlymimic.mimic-chat/md-local` | **send with auto player name → dispatches to `…/md`** | `LOCAL` only |
| `com.friendlymimic.mimic-chat/md-local-macro` | **send for dice processing → dispatches to `…/md`** | `LOCAL` only |
| `com.friendlymimic.mimic-chat/html` | **send raw HTML (last resort)** | `ALL` (or `LOCAL`) |

---

## `com.friendlymimic.mimic-chat/md` — Main API channel

Send a message here to display it in every player's log.

### Message shape

```js
OBR.broadcast.sendMessage(
  'com.friendlymimic.mimic-chat/md',
  {
    md:     'You hit for **12** damage.',  // required — Markdown string
    title:  'Goblin Slayer',              // required — sender name
    origin: 'com.yourext.yourext',        // required — identifies your extension
    gmOnly: false,                        // optional — if true, only the GM sees it
    id:     'myext-action-42',            // optional — deduplication key
  },
  { destination: 'ALL' }
)
```

### Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `md` | `string` | — | **Required.** Markdown content. Rendered with [marked](https://marked.js.org). |
| `title` | `string` | — | **Required.** Displayed as the sender name above the message. |
| `origin` | `string` | — | **Required.** Reverse-domain identifier for your extension (e.g. `com.yourext.yourext`). Not displayed; used for debugging and future filtering. |
| `gmOnly` | `boolean` | `false` | When `true`, non-GM players silently drop the message. |
| `id` | `string` | — | Optional deduplication key. If the same `id` is received more than once (e.g. because the extension has multiple layers and fires on each), only the first is shown. Omit when the message originates from a direct UI interaction — those don't duplicate. |

### Markdown support

Full CommonMark block and inline rendering via [marked](https://marked.js.org) with `breaks: true`. Supported: headings (`#`–`######`), **bold**, *italic*, `code`, code blocks, lists, links, and horizontal rules. Heading sizes are scaled down to fit the chat context.


---

## `com.friendlymimic.mimic-chat/md-local` — Local player name channel

Send a Markdown message here without specifying a `title`. Mimic Log&Chat will fill in the local OBR player name automatically and forward the message to `com.friendlymimic.mimic-chat/md` with `destination: 'ALL'`. No macro or dice processing is applied. **Must use `destination: 'LOCAL'`.**

### Message shape

```js
OBR.broadcast.sendMessage(
  'com.friendlymimic.mimic-chat/md-local',
  {
    md:     'I move to the door.',   // required — Markdown string
    origin: 'com.yourext.yourext',  // required — identifies your extension
    title:  'Override Name',        // optional — omit to use the local player's name
  },
  { destination: 'LOCAL' }
)
```

---

## `com.friendlymimic.mimic-chat/md-local-macro` — Local macro channel

Send raw text here for dice macro processing. Mimic Log&Chat will roll any `[…]` expressions and forward the result to `com.friendlymimic.mimic-chat/md` with `destination: 'ALL'`. **Must use `destination: 'LOCAL'`.**

### Message shape

```js
OBR.broadcast.sendMessage(
  'com.friendlymimic.mimic-chat/md-local-macro',
  {
    md:     'I attack for [1d8+3] damage.',  // required — raw text with optional dice macros
    title:  'Fighter',                       // optional — defaults to local player name
    origin: 'com.yourext.yourext',           // required — identifies your extension
  },
  { destination: 'LOCAL' }
)
```

### Dice macro syntax

Expressions are evaluated by [dice-roller-parser](https://github.com/BTMorton/dice_roller). Wrap any expression it supports in `[…]` and it will be rolled and expanded inline:

| Input | Example output |
|---|---|
| `[2d6]` | `[2d6: 3+5] = **8**` |
| `[1d20+4]` | `[1d20+4: 17+4] = **21**` |
| A bare expression with no spaces (e.g. `2d6`) | auto-wrapped to `[2d6]` |

Lines starting with `/r` trigger a local info message explaining the correct syntax, and are not forwarded.

### Image URLs

Bare image URLs (ending in `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, or `.svg`) in the `md` string are automatically rendered as full-width inline images. Clicking opens the original URL in a new tab. Messages sent directly to `…/md` are rendered as plain Markdown — use standard Markdown image syntax (`![alt](url)`) there.

---

## `com.friendlymimic.mimic-chat/html` — Raw HTML channel

**Prefer `…/md` whenever possible.** Use this channel only when Markdown isn't expressive enough.

Incoming `html` is sanitized with [DOMPurify](https://github.com/cure53/DOMPurify) before rendering. Scripts, event handlers, and other dangerous constructs are stripped.

### Message shape

```js
OBR.broadcast.sendMessage(
  'com.friendlymimic.mimic-chat/html',
  {
    html:   '<strong>Critical hit!</strong> <em>12 damage.</em>',  // required — raw HTML string
    title:  'Goblin Slayer',                                        // required — sender name
    origin: 'com.yourext.yourext',                                  // required
    gmOnly: false,                                                   // optional
    id:     'myext-action-42',                                      // optional — deduplication key
  },
  { destination: 'ALL' }
)
```

### Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `html` | `string` | — | **Required.** Raw HTML. Sanitized by [DOMPurify](https://github.com/cure53/DOMPurify) before display. |
| `md` | — | — | Ignored. |

All other fields (`title`, `origin`, `gmOnly`, `id`) behave identically to the `…/md` channel.

---

## Built-in bridges

Mimic Log&Chat automatically bridges several third-party extensions into the log. See [`src/extensions-bridge/`](src/extensions-bridge/) for the full list and implementation details.
