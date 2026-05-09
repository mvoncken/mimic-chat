<script>
  import MimicLog from './MimicLog.svelte'
  import ChatInput from './ChatInput.svelte'

  let { playerName } = $props()
</script>

<MimicLog />
<ChatInput {playerName} />
