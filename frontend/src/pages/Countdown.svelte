<!-- export const calculateTimeLeft = (finishDate: string | null) => {
    if(!finishDate) return

    const date = new Date(finishDate);
    const now = new Date();
    
    const difference =  date.getTime() - now.getTime();

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours:Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };

      
     const diff = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diff / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diff / (1000 * 60));
    const diffSec = Math.ceil(diff / 1000);

    return [diffDays, diffHours, diffMinutes, diffSec]; 
} 
 -->
<script lang="ts">
  import { onMount } from "svelte";
  import { readable } from "svelte/store";
  export let finishDate; 

  const calculateTimeLeft = (finishDate:string) => {
    const now = new Date();
    const targetDate = new Date(finishDate)
    const difference =  targetDate.getTime() - now.getTime() ;

    return {
      days:  Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  // Create a readable store that updates every second
  const countdown = readable(calculateTimeLeft(finishDate), (set) => {
    const interval = setInterval(() => {
      set(calculateTimeLeft(finishDate));
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

<main class="flex w-full justify-between ">
  <div>
    <h1 class="text-lg">
      {$countdown.days}
    </h1>
    <h2 class="text-sm opacity-70">days</h2>
  </div>
  <div>
    <h1 class="text-lg">
      {$countdown.hours}
    </h1>
    <h2 class="text-sm opacity-70">hours</h2>
  </div>
  <div>
    <h1 class="text-lg">
      {$countdown.minutes}
    </h1>
    <h2 class="text-sm opacity-70">mins</h2>
  </div>
  <div>
    <h1 class="text-lg">
      {$countdown.seconds}
    </h1>
    <h2 class="text-sm opacity-70">sec</h2>
  </div>
</main>
