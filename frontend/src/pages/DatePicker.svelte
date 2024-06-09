<script lang="ts">
  import {
    daysToWeeks,
    eachDayOfInterval,
    endOfMonth,
    format,
    formatDistance,
    startOfMonth,
    startOfToday,
    subDays,
    endOfWeek,
    add,
    isToday,
    isSameMonth,
    isEqual,
    getDay,
  } from "date-fns";
  import { parse } from "date-fns";
  import ChevronLeft from "../util/ChevronLeft.svelte";
  import ChevronRight from "../util/ChevronRight.svelte";

  import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

function handleDayClick(day: Date) {
  selectedDay = day;
  let formattedDaySelected = format(selectedDay, 'yyyy-MMMM-dd')
  dispatch('daySelected', { selectedDay });
}

  let today = startOfToday();
  let selectedDay = today;
  let currentMonth = format(today, "MMM-yyyy");

  let firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());

  const nextMonth = () => {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });

    firstDayCurrentMonth = firstDayNextMonth;
    currentMonth = format(firstDayNextMonth, "MMM-yyyy");

    getNewDays();
  };
  const prevMonth = () => {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });

    firstDayCurrentMonth = firstDayNextMonth;
    currentMonth = format(firstDayNextMonth, "MMM-yyyy");

    getNewDays();
  };

  let newDays = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: add(endOfWeek(endOfMonth(firstDayCurrentMonth)), { days: 1 }),
  });

  const getNewDays = () => {
    newDays = eachDayOfInterval({
      start: firstDayCurrentMonth,
      end: add(endOfWeek(endOfMonth(firstDayCurrentMonth)), { days: 1 }),
    });
  };

  let colStartClasses = [
    "col-start-7",
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
  ];
</script>

<main>
  <div class="">
    <div class="max-w-md px-4 mx-auto">
      <div class="grid divide-x divide-gray-200">
        <div class="p-4">
          <div class="flex items-center w-full">
            <h2 class="flex-auto font-semibold text-gray-900">
              {format(firstDayCurrentMonth, "MMMM yyy")}
            </h2>
            <button
              on:click={prevMonth}
              type="button"
              class="my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span class="sr-only">Previous month</span>

              <ChevronLeft />
            </button>
            <button
              on:click={nextMonth}
              type="button"
              class="my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span class="sr-only">Next month</span>

              <ChevronRight />
            </button>
          </div>
          <div
            class="grid grid-cols-7 mt-10-text-xs leading-6 text-center text-gray-500 place-items-center"
          >
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
            <div>S</div>
          </div>
          <div class="grid grid-cols-7 mt-2 text-sm gap-y-2 gap-x-2">
            {#each newDays as day, index}
              <div
                class={`flex justify-center items-center  ${index === 0 ? colStartClasses[getDay(day)] : ""}`}
              >
                <button
                  type="button"
                  on:click={() => {
                    handleDayClick(day)
                  }}
                  class={`btn h-6 text-[10px] rounded-[100px] aspect-square border-none min-h-2 p-0 hover:bg-gray-200 
                ${isSameMonth(day, firstDayCurrentMonth) ? "text-gray-800" : "text-gray-500"} ${isToday(day) ? "text-red-800 bg-transparent" : "bg-transparent"}
                ${isEqual(day, selectedDay) ? "bg-gray-200" : ""}
                `}
                >
                  <time datetime={format(day, "yyyy-MM-dd")}>
                    {format(day, "d")}</time
                  >
                </button>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
