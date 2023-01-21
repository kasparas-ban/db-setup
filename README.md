To generate 1000 users run:

`deno run --allow-net --allow-write --allow-read generateUsers.ts 1000`

To populate the database run:

`deno run --allow-net --allow-read index.ts`

To clean the table run:

`deno run --allow-net --allow-read index.ts clean`
