<script lang="ts">
  import backgroundTwo from "./../assets/bg-2.png";
  import { createGroup } from "./../lib/creategrouppapi";

  let groupname = "";
  let username = "";
  let email = "";

  let success: boolean | null = null;

  const handleGroupCreate = async () => {
    const response = await createGroup(groupname, username, email);
    console.log(groupname, username, email);
    success = response.success;
  };
</script>

<main class="font-custom bg-white">
  <section
    class="h-screen text-primary flex flex-col items-center justify-center"
    style="background-image: url({backgroundTwo})"
  >
    <h1 class="font-medium text-2xl flex justify-center items-center">
      Join to group!
    </h1>
    <input
    bind:value={groupname}
      class="text-center mt-6 placeholder-input text-m input input-bordered border-primary w-full max-w-xs"
      type="text"
      placeholder="Enter your group's name"
    />

    <input
    bind:value={username}
      class="text-center mt-6 placeholder-input text-input text-m input input-bordered border-primary w-full max-w-xs"
      type="text"
      placeholder="Enter your name"
    />

    <input
    bind:value={email}
      class="text-center mt-6 placeholder-input text-input text-m input input-bordered border-primary w-full max-w-xs"
      type="text"
      placeholder="Enter your e-mail"
    />

    <button on:click={() => handleGroupCreate()} 
      class="w-full max-w-xs btn border-[none] font-medium h-[60px] mt-6 px-12 text-m text-secondary bg-primary"
      >Submit</button
    >
    <button   class="mt-2">or create a new group</button>
  </section>

  {#if success === false}
    <section class="alert alert-error max-w-[300px] flex justify-between mt-6">
      Error!!
      <button on:click={() => (success = null)} class="btn btn-ghost"
        >Close</button
      >
    </section>
  {:else if success === true}
    <section
      class="alert alert-success max-w-[300px] flex justify-between mt-6"
    >
      Success!!
      <button on:click={() => (success = null)} class="btn btn-ghost"
        >Close</button
      >
    </section>
  {/if}
</main>
