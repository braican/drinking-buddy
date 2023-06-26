<script>
  import { HomeIcon, SearchIcon } from "@icons";

</script>

<nav class="nav">
  <a class="nav-button" href="/" aria-label="Home">
    <HomeIcon />
  </a>
  <button class="nav-button" aria-label="Search">
    <SearchIcon />
  </button>
</nav>

<style lang="scss">
.nav {
  position: fixed;
  bottom: 0;
  right: 0;
  display: flex;
}

.nav-button {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;

  :global(svg) {
    width: 100%;
    display: block;
  }
}
</style>
