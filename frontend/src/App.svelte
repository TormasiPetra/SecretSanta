<script lang="ts">

  import backgroundOne from "./assets/bg-1.png";
  import Login from "./pages/DatePicker.svelte";
  import Signup from "./pages/Signup.svelte";

  let condition: boolean = false;

  
    let currentPage = "home";

  function goToPage(page: string) {
    currentPage = page;
  }

</script>

<main class="font-custom">
  {#if currentPage === "home"}
  <section
  class="h-screen text-secondary flex flex-col items-center justify-center bg-no-repeat  bg-primary bg-bottom"
  style="background-image: url({backgroundOne})"
>
  <h1 class="font-medium text-2xl flex justify-center items-center">
    Merry Christmas!
  </h1>
  <button
    on:click={() => {
      goToPage("signup");
      
    }}
    class="max-w-[225px] btn font-medium leading-5 h-[60px] mt-6 px-12 text-m text-primary"
    >Let's play Secret Santa</button
  >
</section>
  {:else if currentPage === "signup"}
    <Signup />
  {/if}

  
</main>
