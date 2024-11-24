<script lang="ts">
  import { Accordion as AccordionPrimitive } from "bits-ui";
  import { slide } from "svelte/transition";
  import { cn } from "$lib/utils.js";

  type $$Props = AccordionPrimitive.ContentProps;

  let className: $$Props["class"] = undefined;
  export let transition: $$Props["transition"] = slide;
  export let transitionConfig: $$Props["transitionConfig"] = {
    duration: 200,
  };
  export { className as class };
</script>

<AccordionPrimitive.Content
  class={cn("overflow-hidden pb-4 pt-0 text-sm transition-all", className)}
  {transition}
  {transitionConfig}
  {...$$restProps}
>
  <slot />
</AccordionPrimitive.Content>
