// External API — see API-README.md
export const API_CHANNEL = 'com.friendlymimic.mimic-chat/md'
export const HTML_CHANNEL = 'com.friendlymimic.mimic-chat/html'

// Local-only pre-processing step: dice macros are resolved here before
// re-broadcasting on API_CHANNEL. Never send this cross-player.
export const LOCAL_MACRO_CHANNEL = 'com.friendlymimic.mimic-chat/md-local-macro'
