<script>
  import MimicLog from './MimicLog.svelte'
  import ChatInput from './ChatInput.svelte'
  import ResizeBar from './ResizeBar.svelte'

  let resizeExpanded = $state(false)
</script>

<header class="title-bar">
  <span class="title-bar__name">Mimic chat</span>
  <ResizeBar bind:expanded={resizeExpanded} />
</header>
<MimicLog />
<ChatInput />
