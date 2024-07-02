<script lang="ts">
  import backgroundOne from "./../assets/bg-1.png";

  import backgroundTwo from "./../assets/bg-2.png";
  import backgroundThree from "./../assets/bg-3.png";
  import back from "./../assets/back.png";
  import money from "./../assets/money.png";
  import moneySVG from "./../assets/money.svg";
  import members from "./../assets/members.png";
  import datePNG from "./../assets/date.png";
  import dateSVG from "./../assets/date.svg";
  import {
    joinGroup,
    login,
    init,
    signup,
    create,
    startDraw,
    stopDraw,
    deleteFromList,
    editSelf,
    drawName,
    deleteGroup,
  } from "../api";
  import { onMount } from "svelte";
  import { firstLetterUpperCase } from "../util/formatId";
  import { GroupSchema, UserSchema } from "../model";
  import type { z } from "zod";
  import { createEventDispatcher } from "svelte";
  import DatePicker from "./DatePicker.svelte";
  import { format, parse } from "date-fns";
  import { readable } from "svelte/store";
  import Countdown from "./Countdown.svelte";

  const dispatch = createEventDispatcher();

  let groupname = "";
  let username = "";
  let password = "";

  type Group = z.infer<typeof GroupSchema>;
  type User = z.infer<typeof UserSchema>;

  let budget: number | null = null;
  let finishDate: string | null = null;

  let isInitializing: boolean | null = null;
  let groupsOfUser: Group[] | null = null;

  let joinSuccess: boolean | null = null;
  let createSuccess: boolean | null = null;
  let loginSuccess: boolean | null = null;
  let signupSuccess: boolean | null = null;
  let loggedInUserName: string | null = null;

  let currentGroup: Group | null = null;
  let currentGroupName: string | null = null;

  let isDisabled: boolean = true;
  let isEditOpen: boolean = false;

  let editedUsername: string | null = null;
  let chosenUser: User | null = null;

  let showDatePicker: boolean = false;

  let deleteSuccess: boolean | null = null;

  const handleInitialize = async () => {
    if (loginSuccess) {
      isInitializing = true;
      const response = await init();
      isInitializing = false;
      if (!response.success) return;
      loggedInUserName = response.data.username;
      groupsOfUser = response.data.groupsOfUser;
    }
  };

  onMount(handleInitialize);

  const handleGroupCreate = async () => {
    const response = await create(
      loggedInUserName,
      groupname,
      budget,
      finishDate
    );
    createSuccess = response.success;
    handleInitialize();
    allToNull();
    if (createSuccess === true) {
      currentPage = "profile";
    }
  };

  const handleJoinGroup = async (
    groupname: string,
    username: string | null
  ) => {
    const response = await joinGroup(groupname, username);
    joinSuccess = response.success;
    handleInitialize();
    allToNull();
    currentPage = "profile";
  };

  let currentPage = "login";

  const allToNull = () => {
    groupname = "";
    username = "";
    password = "";
    budget = null;
    finishDate = null;
  };

  function goToPage(page: string) {
    currentPage = page;
    allToNull();
  }

  const logout = () => {
    localStorage.removeItem("token");
    loginSuccess = null;

    currentPage = "signup";
  };

  const handleLogin = async () => {
    const response = await login(username, password);
    loginSuccess = response.success;
    if (response.success) {
      loggedInUserName = username;
      localStorage.setItem("token", response.data.token);
      allToNull();
      handleInitialize();
      currentPage = "profile";
    }
  };

  const handleSignup = async () => {
    const response = await signup(username, password);
    signupSuccess = response.success;
    const loginResponse = await login(username, password);
    loginSuccess = response.success;
    if (loginResponse.success) {
      loggedInUserName = username;
      localStorage.setItem("token", loginResponse.data.token);
      allToNull();
      handleInitialize();
      currentPage = "profile";
    }
    /*     allToNull();
    handleInitialize();
    currentPage = "profile"; */
  };

  const handleStartDraw = async (groupname: string) => {
    const response = await startDraw(groupname);
    handleInitialize();
    isDisabled = false;
  };

  const handleStopDraw = async (groupname: string) => {
    const response = await stopDraw(groupname);
    handleInitialize();
    isDisabled = true;
  };

  const handleDeleteFromList = async (
    groupname: string | null,
    username: string | null
  ) => {
    const response = await deleteFromList(groupname, username);
    handleInitialize();
  };

  const handleEditSelf = async (
    groupname: string | null,
    username: string | null,
    editedUsername: string | null
  ) => {
    const response = await editSelf(groupname, username, editedUsername);
    handleInitialize();
  };

  const toggleEdit = () => {
    isEditOpen = !isEditOpen;
  };

  const handleDrawName = async (
    groupname: string | null,
    username: string | null
  ) => {
    const response = await drawName(groupname, username);
    if (!response.success) return;

    chosenUser = response.data.chosenUser;
    currentGroupName = response.data.currentGroup.groupname;
    currentGroup = response.data.currentGroup;
    handleInitialize();
    currentPage = "chosen";
    console.log(chosenUser);
  };

  const seeWhoIGot = (username: string | null, groupname: string) => {
    handleInitialize();
    if (!groupsOfUser) return;
    groupsOfUser.forEach((group) => {
      if (group.groupname === groupname) {
        group.alreadyDrawnUsers.forEach((user) => {
          if (user.user.username === username) {
            chosenUser = user.santa;
            }
          finishDate = group.finishDate
        });
      }
    });
    
    currentPage = "chosen";
  };

  let selectedDay: Date = new Date();

  interface DaySelectedEventDetail {
    selectedDay: Date;
  }

  type DaySelectedEvent = CustomEvent<DaySelectedEventDetail>;

  function handleDaySelected(event: DaySelectedEvent): void {
    selectedDay = event.detail.selectedDay;
  }

  const deleteGroupForever = async (
    groupname: string | null,
    username: string | null
  ) => {
    console.log(groupname);
    const response = await deleteGroup(groupname, username);
    if (!response.success) return;

    deleteSuccess = response.data.success;
    handleInitialize();
  };
</script>

<main class="font-custom bg-white">
  {#if isInitializing}
    <div class="flex justify-center h-screen items-center">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
  {/if}

  {#if !isInitializing}
    {#if currentPage === "login"}
      <section
        class="relative h-screen text-primary flex flex-col items-center justify-center bg-no-repeat bg-center bg-primary bg-opacity-35"
        style="background-image: url({backgroundTwo})"
      >
        <button
          on:click={() => {
            goToPage("signup");
          }}
          class="absolute top-10 right-6 btn font-medium text-m text-secondary bg-primary border-none"
        >
          Sign up
        </button>

        <h1 class="font-medium text-2xl flex justify-center items-center">
          Login
        </h1>

        <input
          bind:value={username}
          class="text-center mt-10 placeholder-input text-input text-m input input-bordered border-primary w-full max-w-xs"
          type="text"
          placeholder="Enter your name"
        />

        <input
          bind:value={password}
          class="text-center mt-2 placeholder-input text-input text-m input input-bordered border-primary w-full max-w-xs"
          type="password"
          placeholder="Enter your password"
        />

        <button
          on:click={() => handleLogin()}
          class="w-full max-w-xs btn border-[none] font-medium h-[60px] mt-6 px-12 text-m text-secondary bg-primary border-none"
          >Let's go</button
        >
      </section>
      {#if loginSuccess === false}
        <section
          class="absolute top-0 left-0 h-full w-full bg-white bg-opacity-85 flex justify-center items-center"
        >
          <div
            class="alert bg-primary max-w-[320px] flex justify-between border-none text-white"
          >
            No luck! Try again
            <button on:click={() => (loginSuccess = null)} class="btn btn-ghost"
              >x</button
            >
          </div>
        </section>
      {/if}
    {/if}

    {#if currentPage === "profile"}
      <section
        class="relative min-h-screen text-primary flex flex-col items-center bg-no-repeat bg-center bg-primary bg-opacity-35 justify-center"
        style="background-image: url({backgroundThree})"
      >
        <h1 class="text-myPrimary font-medium text-[24px] my-2 mt-6">
          Hi {firstLetterUpperCase(loggedInUserName)}!
        </h1>
        <div
          class="relative your-groups min-h-screen-70 mb-6 bg-white bg-opacity-40 w-[94%] border-primary border rounded-[12px] p-3 flex justify-center"
        >
          <div class="min-h-[90%] w-full">
            <h2>Your groups</h2>

            {#if groupsOfUser !== null}
              {#each groupsOfUser as group}
                <div class="flex items-end">
                  <div
                    class="relative card card-body w-full bg-primary mt-2 text-white flex items-start flex-col"
                  >
                    <button
                      class="flex justify-center items-center"
                      on:click={() => {
                        currentGroupName = group.groupname;
                        currentGroup = group;
                        currentPage = "selectedGroup";
                      }}
                    >
                      <img
                        class="absolute top-2 right-2 z-10 w-10 h-10 transform scale-x-[-1]"
                        src={back}
                        alt="back"
                      />
                    </button>
                    <button
                      on:click={() => {
                        currentGroupName = group.groupname;
                        deleteGroupForever(group.groupname, loggedInUserName);
                      }}
                      class="flex justify-center items-center absolute bottom-2 right-2 z-10 w-10 h-10"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path
                          d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                        />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>

                    <div>{firstLetterUpperCase(group.groupname)} group</div>
                    <div class="flex justify-center w-full text-[12px]">
                      <div class="w-full">
                        <div class="flex flex-row w-full gap-4 mt-2">
                          <img class="object-contain" src={datePNG} alt="" />
                          <h3>{format(group.finishDate, "yyyy-MM-dd")}</h3>
                        </div>
                        <div class="flex flex-row w-full gap-4 mt-2">
                          <img class="  object-contain" src={members} alt="" />
                          <h3>{group.users.length}</h3>
                        </div>
                      </div>
                      <div class="flex flex-row w-full gap-4 mt-2">
                        <img
                          class="h-[24px] object-contain"
                          src={money}
                          alt=""
                        />
                        <h3>{group.budget} HUF</h3>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </div>
        <div
          class="w-full flex justify-center items-center flex-col py-4 gap-2"
        >
          <button
            on:click={() => (currentPage = "create")}
            class="w-full max-w-xs btn font-medium h-[60px] px-12 text-m text-secondary bg-primary border-none"
            >Create new group</button
          >

          <button
            on:click={() => (currentPage = "join")}
            class=" w-full max-w-xs btn border-[none] font-medium h-[60px] px-12 text-m text-secondary bg-primary border-none"
            >Join to group</button
          >
        </div>
      </section>
    {/if}

    {#if currentPage === "signup"}
      <section
        class="relative h-screen text-primary flex flex-col items-center justify-center bg-no-repeat bg-center bg-primary bg-opacity-35"
        style="background-image: url({backgroundTwo})"
      >
        <button
          on:click={() => {
            goToPage("login");
          }}
          class="absolute top-10 right-6 btn font-medium text-m text-secondary bg-primary border-none"
        >
          Login
        </button>

        <h1 class="font-medium text-2xl flex justify-center items-center">
          Sign up
        </h1>

        <input
          bind:value={username}
          class="text-center mt-10 placeholder-input text-input text-m input input-bordered border-primary w-full max-w-xs"
          type="text"
          placeholder="Enter your name"
        />

        <input
          bind:value={password}
          class="text-center mt-2 placeholder-input text-input text-m input input-bordered border-primary w-full max-w-xs"
          type="password"
          placeholder="Enter your password"
        />

        <button
          on:click={() => handleSignup()}
          class="w-full max-w-xs btn font-medium h-[60px] mt-6 px-12 text-m text-secondary bg-primary border-none"
          >Let's go</button
        >
      </section>
      {#if signupSuccess === false}
        <section
          class="absolute top-0 left-0 h-full w-full bg-white bg-opacity-85 flex justify-center items-center"
        >
          <div
            class="alert bg-primary max-w-[320px] flex justify-between border-none text-white"
          >
            No luck! Try again
            <button
              on:click={() => (signupSuccess = null)}
              class="btn btn-ghost">x</button
            >
          </div>
        </section>
      {/if}
    {/if}

    {#if currentPage === "join"}
      <section
        class="relative h-screen text-primary flex flex-col items-center justify-center bg-no-repeat bg-center bg-primary bg-opacity-35"
        style="background-image: url({backgroundTwo})"
      >
        <button
          on:click={() => {
            goToPage("profile");
            handleInitialize();
          }}
          class="absolute top-[22px] left-[22px]"
        >
          <img src={back} alt="back" />
        </button>

        <h1 class="font-medium text-2xl flex justify-center items-center">
          Join to group!
        </h1>
        <input
          bind:value={groupname}
          class="text-center mt-6 placeholder-input text-m input input-bordered border-primary w-full max-w-xs"
          type="text"
          placeholder="Enter your group's name"
        />

        <button
          on:click={() => handleJoinGroup(groupname, loggedInUserName)}
          class="w-full max-w-xs btn border-[none] font-medium h-[60px] mt-6 px-12 text-m text-secondary bg-primary border-none"
          >Join</button
        >
        <button
          on:click={() => {
            goToPage("create");
          }}
          class="mt-2">or create a new group</button
        >
      </section>

      {#if joinSuccess === false}
        <section
          class="absolute top-0 left-0 h-full w-full bg-white bg-opacity-85 flex justify-center items-center"
        >
          <div
            class="alert bg-primary max-w-[320px] flex justify-between border-none text-white"
          >
            No luck! Try again
            <button on:click={() => (joinSuccess = null)} class="btn btn-ghost"
              >x</button
            >
          </div>
        </section>
      {:else if joinSuccess === true}
        <section
          class="alert alert-success max-w-[300px] flex justify-between mt-6"
        >
          Success!!
          <button on:click={() => (joinSuccess = null)} class="btn btn-ghost"
            >x</button
          >
        </section>
      {/if}
    {/if}

    {#if currentPage === "create"}
      <section
        class=" relative h-screen text-primary flex flex-col items-center justify-center bg-no-repeat bg-center bg-primary bg-opacity-35"
        style="background-image: url({backgroundTwo})"
      >
        <button
          on:click={() => {
            goToPage("profile");
            handleInitialize();
          }}
          class="absolute top-[22px] left-[22px]"
        >
          <img src={back} alt="back" />
        </button>
        <!--   <button
          on:click={() => {
            goToPage("login");
          }}
          class="absolute top-2 right-2 btn border-[none] font-medium text-m text-secondary bg-primary border-none"
        >
          Login
        </button> -->

        <h1 class="font-medium text-2xl flex justify-center items-center">
          Create new group!
        </h1>
        <input
          bind:value={groupname}
          class="text-center mt-6 placeholder-input text-m input input-bordered border-primary w-full max-w-xs"
          type="text"
          placeholder="Enter group's name"
        />

        <input
          bind:value={budget}
          class="text-center mt-2 placeholder-input text-input text-m input input-bordered border-primary w-full max-w-xs"
          type="text"
          placeholder="Enter budget"
        />

        <div class="relative max-w-xs w-full z-10">
          <input
            on:click={() => {
              showDatePicker = !showDatePicker;
              finishDate = selectedDay.toISOString();
            }}
            class="text-center mt-2 placeholder-input text-input text-m input input-bordered border-primary w-full z-50"
            type="text"
            placeholder={format(selectedDay, "yyyy-MMMM-dd")}
          />
          {#if showDatePicker}
            <div
              class="absolute top-12 bg-secondary bg-opacity-95 rounded-b-3xl w-full -z-50"
            >
              <DatePicker on:daySelected={handleDaySelected} />
            </div>
          {/if}
        </div>
        <button
          on:click={() => {
            handleGroupCreate();
            console.log(finishDate);
          }}
          class="w-full max-w-xs btn border-[none] font-medium h-[60px] mt-6 px-12 text-m text-secondary bg-primary border-none"
          >Create</button
        >
        <button
          on:click={() => {
            goToPage("join");
          }}
          class="mt-2">or join group</button
        >
      </section>
      {#if createSuccess === false}
        <section
          class="absolute top-0 left-0 h-full w-full bg-black bg-opacity-80 flex justify-center items-center"
        >
          <div
            class="alert bg-primary max-w-[320px] flex justify-between border-none text-white"
          >
            No luck! Try again
            <button
              on:click={() => {
                createSuccess = null;
                allToNull();
              }}
              class="btn btn-ghost">x</button
            >
          </div>
        </section>
      {/if}
    {/if}

    {#if currentPage === "selectedGroup"}
      <section
        class="relative h-screen text-primary flex flex-col items-center bg-no-repeat bg-center bg-primary"
        style="background-image: url({backgroundOne})"
      >
        <button
          on:click={() => {
            goToPage("profile");
            handleInitialize();
          }}
          class="absolute top-[22px] left-[22px]"
        >
          <img src={back} alt="back" />
        </button>
        {#if groupsOfUser}
          {#each groupsOfUser as group}
            {#if group.groupname === currentGroupName && group.admin !== null}
              <div class="text-white mt-10">
                <h1 class="">{firstLetterUpperCase(group.groupname)} group</h1>
              </div>
              <div
                class="absolute bottom-0 bg-white w-full min-h-screen-90 rounded-t-lg p-4"
              >
                <div
                  class="flex justify-between items-center w-full text-[12px]"
                >
                  <div class="w-1/2">
                    <div class="flex flex-row w-full gap-4 mt-2">
                      <img class="object-contain" src={dateSVG} alt="" />
                      <h3>{format(group.finishDate, "yyyy-MM-dd")}</h3>
                    </div>

                    <div class="flex flex-row w-full gap-4 mt-2">
                      <img
                        class="h-[24px] object-contain"
                        src={moneySVG}
                        alt=""
                      />
                      <h3>{group.budget} HUF</h3>
                    </div>
                  </div>

                  {#if loggedInUserName === group.admin.username && !group.isActive}
                    <div class="flex justify-end items-center">
                      <button
                        on:click={() => {
                          handleStartDraw(group.groupname);
                        }}
                        class="w-stretch btn border-[none] font-medium h-[60px] px-12 text-m text-secondary bg-primary border-none"
                        >Allow draw
                      </button>
                    </div>
                  {/if}
                  {#if loggedInUserName === group.admin.username && group.isActive && !group.isFinished}
                    <div class="flex justify-end items-center">
                      <button
                        on:click={() => {
                          handleStopDraw(group.groupname);
                        }}
                        class="w-stretch btn border-[none] font-medium h-[60px] px-12 text-m text-secondary bg-primary border-none"
                        >Edit
                      </button>
                    </div>
                  {/if}
                  {#if group.isFinished}
                    <div class="flex justify-end items-center">
                      <card
                        class="w-stretch btn border-[none] font-medium min-h-[60px] text-m text-secondary bg-primary border-none"
                        >Get ready for gifting!
                      </card>
                    </div>
                  {/if}
                </div>
                <hr class="w-full border-t-2 border-primary my-4" />

                <div class="flex flex-col">
                  {#if loggedInUserName === group.admin.username}
                    {#each group.users as user}
                      {#if user.user.username === loggedInUserName}
                        <div class="flex justify-between items-center">
                          <h2>
                            {firstLetterUpperCase(user.user.username)}
                            <span>(you)</span>
                          </h2>
                        </div>
                        <hr class="w-full border-t-2 border-primary my-4" />
                      {/if}
                    {/each}

                    {#each group.users as user}
                      {#if user.user.username !== loggedInUserName}
                        <div class="flex justify-between items-center min-h-10">
                          <h2>{firstLetterUpperCase(user.user.username)}</h2>
                          {#if !group.drawStarted}
                            <button
                              on:click={() => {
                                handleDeleteFromList(
                                  group.groupname,
                                  user.user.username
                                );
                              }}
                              class="btn border-[none] font-medium text-m text-primary bg-transparent border-none"
                            >
                              x
                            </button>
                          {/if}
                        </div>
                      {/if}
                    {/each}
                  {/if}
                  {#if loggedInUserName !== group.admin.username}
                    {#each group.users as user}
                      {#if user.user.username === loggedInUserName}
                        <div class="flex justify-between items-center min-h-10">
                          <h2>
                            {firstLetterUpperCase(user.user.username)}
                            <span>(you)</span>
                          </h2>
                          <!--  <button
                        class="btn border-[none] font-medium h-[60px] text-m text-primary bg-transparent border-none"
                        >
                        Edit
                      </button> -->
                        </div>
                        <hr class="w-full border-t-2 border-primary my-4" />
                      {/if}
                    {/each}
                    {#each group.users as user}
                      {#if user.user.username !== loggedInUserName}
                        <div class="flex justify-start items-center">
                          <h2 class="min-h-10">
                            {firstLetterUpperCase(user.user.username)}
                          </h2>
                        </div>
                      {/if}
                    {/each}
                  {/if}
                </div>
              </div>
            {/if}

            {#each group.users as user}
              {#if user.user.username === loggedInUserName && !user.alreadyDrawn}
                {#if group.isActive}
                  <button
                    on:click={() => {
                      handleDrawName(group.groupname, loggedInUserName);
                      currentPage = "chosen";
                    }}
                    class="absolute bottom-4 w-full max-w-xs btn border-[none] font-medium h-[60px] px-12 text-m text-secondary bg-primary border-none"
                    >READY?!
                  </button>
                {/if}

                {#if !group.isActive}
                  <button
                    class="absolute bottom-4 w-full max-w-xs btn border-[none] font-medium h-[60px] px-12 text-m text-secondary bg-primary border-none disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isDisabled}
                    >READY?!
                  </button>
                {/if}
              {/if}
              {#if user.user.username === loggedInUserName && user.alreadyDrawn}
                <button
                  on:click={() => {
                    seeWhoIGot(loggedInUserName, group.groupname);
                  }}
                  class="absolute bottom-4 w-full max-w-xs btn border-[none] font-medium h-[60px] px-12 text-m text-secondary bg-primary border-none"
                  >Let's see who I got
                </button>
              {/if}
            {/each}

            {#if isEditOpen}
              <section
                class="absolute top-0 left-0 h-full w-full bg-white bg-opacity-85 flex flex-col justify-center items-center"
              >
                <div
                  class="alert bg-primary max-w-[320px] flex flex-col justify-center border-none text-white"
                >
                  <div class="w-full flex justify-between items-center">
                    <h1>Edit your name</h1>

                    <button on:click={() => toggleEdit()} class="btn btn-ghost"
                      >x</button
                    >
                  </div>
                  <input
                    bind:value={editedUsername}
                    class="text-center mt-2 placeholder-input text-input text-m input input-bordered border-primary w-full max-w-xs"
                    type="text"
                    placeholder="New name"
                  />
                  <button
                    on:click={() =>
                      handleEditSelf(
                        group.groupname,
                        loggedInUserName,
                        editedUsername
                      )}
                    class="bottom-4 w-full max-w-xs btn border-[none] font-medium h-[60px] px-12 text-m text-primary bg-secondary border-none"
                    >Change name!</button
                  >
                </div>
              </section>
            {/if}
          {/each}
        {/if}
      </section>
    {/if}
    {#if currentPage === "chosen"}
      <section
        class="relative h-screen text-primary flex flex-col items-center justify-center bg-no-repeat bg-center bg-primary bg-opacity-35 text-center"
        style="background-image: url({backgroundTwo})"
      >
        <div class="card bg-secondary border border-primary w-[326px] p-12">
          <h1 class="text-lg">Hey {firstLetterUpperCase(loggedInUserName)},</h1>
          <h2 class="text-sm mt-2 text-gray-400">
            Your secret santa from {firstLetterUpperCase(currentGroupName)} group
            is...
          </h2>

          {#if chosenUser}
            <div
              class="bg-primary min-h-12 flex justify-center items-center rounded-lg mt-6"
            >
              <h1 class="text-white">
                {firstLetterUpperCase(chosenUser.username)}
              </h1>
            </div>
          {/if}
        </div>
        {#if currentGroup}
          <div
            class="card mt-4 bg-primary text-secondary w-[326px] py-4 px-8 flex flex-row justify-between items-center"
          >
            
              <Countdown {finishDate} />
            
          </div>
        {/if}
      </section>
    {/if}
  {/if}
</main>
