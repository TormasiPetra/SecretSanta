<script lang="ts">

  import backgroundOne from "./assets/bg-1.png";
  import Signup from "./pages/signup.svelte";

  let condition: boolean = false;

  const clickLog = () => {
    condition = !condition;
    console.log("clicked");
  };

  let currentPage = "home";

  function goToPage(page: string) {
    currentPage = page;
  }

</script>

<main class="font-custom">
  {#if currentPage === "home"}
  <section
  class="h-screen text-secondary flex flex-col items-center justify-center"
  style="background-image: url({backgroundOne})"
>
  <h1 class="font-medium text-2xl flex justify-center items-center">
    Merry Christmas!
  </h1>
  <button
    on:click={() => {
      goToPage("signup");
      clickLog();
    }}
    class="max-w-[225px] btn font-medium leading-5 h-[60px] mt-6 px-12 text-m text-primary"
    >Let's play Secret Santa</button
  >
</section>
  {:else if currentPage === "signup"}
    <Signup />
  {/if}

  
</main>
