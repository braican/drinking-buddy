<script lang="ts">
  import { page } from '$app/state';

  interface Props {
    form: { error?: string } | null;
  }

  let { form }: Props = $props();
</script>

<svelte:head>
  <title>Sign in</title>
</svelte:head>

<div class="login">
  <h1 class="margin-bottom-lg">Drinking Buddy</h1>

  <form method="POST">
    <input type="hidden" name="redirectTo" value={page.url.searchParams.get('redirectTo') ?? '/'} />
    <label class="fs-sm color-opacity-50" for="password">Password</label>
    <input
      id="password"
      name="password"
      type="password"
      autocomplete="current-password"
      required
      class="password-input margin-top-xs" />
    {#if form?.error}
      <p class="error fs-sm margin-top-sm">{form.error}</p>
    {/if}
    <button type="submit" class="button button-orange margin-top-md">Sign in</button>
  </form>
</div>

<style lang="scss">
  .login {
    max-width: 24rem;
    margin: var(--spacing-xl) auto 0;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  .error {
    color: var(--color-accent);
  }

  .password-input {
    border-radius: var(--border-radius);
    background: var(--color-black);
  }
</style>
