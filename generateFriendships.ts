import fs, {
  createWriteStream,
} from "https://deno.land/std@0.153.0/node/fs.ts";

function getIDArray(from: number, to: number, excluded: number) {
  const array = [];
  for (let i = from; i <= to; i++) {
    if (i === excluded) continue;
    array.push(i);
  }
  return array;
}

// File data writing

const writeUsers = createWriteStream("relations.csv", {});
writeUsers.write("requester_id,addressee_id\n", "utf8");

async function writeRelations(writer: any, encoding: any, callback: any) {
  const numUsers = 10000;
  const numRelations = 300;

  for (let window = 0; window < numUsers / (numRelations + 1); window++) {
    // Calculate the range of userIDs
    const minUserID = window * (numRelations + 1) + 1;
    const maxUserID = (window + 1) * (numRelations + 1);

    for (let userID = minUserID; userID <= maxUserID; userID++) {
      const idArray = getIDArray(minUserID, maxUserID, userID);

      for (let friendID of idArray) {
        let data = `${userID},${friendID}\n`;
        if (userID > friendID) data = `${friendID},${userID}\n`;
        let ok = writer.write(data, encoding);
        if (!ok) await new Promise((resolve) => writer.once("drain", resolve));
      }
    }
  }
}

await writeRelations(writeUsers, "utf-8", () => {
  writeUsers.end();
});
