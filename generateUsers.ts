import { faker } from "npm:@faker-js/faker";
import ProgressBar from "https://deno.land/x/progress@v1.3.6/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { FastWriter } from "https://deno.land/x/fastwriter/mod.ts";

// === Faker data generation ============================================================================

const uniqueConfig = { maxRetries: 150, maxTime: 100 };

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function getRandomBool(fraction: number) {
  return Math.random() > fraction;
}

const getUsername = (firstName?: string, lastName?: string): string =>
  faker.helpers.unique(
    faker.internet.userName,
    [firstName, lastName],
    uniqueConfig,
  );

const getEmail = (firstName?: string, lastName?: string): string =>
  faker.helpers.unique(
    faker.internet.email,
    [firstName, lastName],
    uniqueConfig,
  );

const getPassword = (): string =>
  faker.internet.password(getRandomInt(10, 30), getRandomBool(0.5));

const getFullName = (
  firstName?: string,
  lastName?: string,
  sex?: "male" | "female",
): string =>
  faker.name.fullName({
    ...(sex ? { sex } : {}),
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
  });

const getProfilePic = (): string => faker.internet.avatar();
const getSex = (): string => faker.name.sex();
const getGender = (): string => faker.name.gender();
const getDescription = () => faker.lorem.words(getRandomInt(1, 10));
const getBirthday = () =>
  faker.date.birthdate({ min: 18, max: 65, mode: "age" });
const getCreatedAt = () =>
  faker.date.between(new Date(2022, 11, 17), new Date());

const getProfile = () => {
  const sex = getSex() as "male" | "female";
  const firstName = faker.name.firstName(sex);
  const lastName = faker.name.lastName(sex);
  const fullName = getFullName(firstName, lastName, sex);
  const username = getUsername(firstName, lastName);
  const email = getEmail(firstName, lastName);
  const birthday = getBirthday();

  return {
    username: username,
    email: email,
    password: getPassword(),
    fullName: fullName,
    profilePic: getProfilePic(),
    location: getRandomInt(1, 42000),
    gender: getRandomBool(0.05) ? sex : getGender().toLowerCase(),
    about: getDescription(),
    birthday: birthday.toISOString(),
    createdAt: getCreatedAt().toISOString(),
  };
};

// === File data writing ================================================================================

const header = [
  "id",
  "username",
  "email",
  "password",
  "full_name",
  "profile_pic",
  "location",
  "gender",
  "about",
  "birthday",
  "created_at",
];

function writeToFiles(
  writer1: FastWriter,
  writer2: FastWriter,
  numUsers: number,
) {
  let num = 0;
  let text = header.join(",") + "\n";
  let textEnc = header.join(",") + "\n";

  while (num < numUsers) {
    const newUser = { id: "", ...getProfile() };
    text += Object.values(newUser).join(",") + "\n";
    textEnc += Object.values({
      ...newUser,
      password: bcrypt.hashSync(newUser.password),
    })
      .join(",") + "\n";
    num++;
    progress.render(completed++);
  }
  writer1.write(text);
  writer2.write(textEnc);
}

// === Run the program ===================================================================================

const numUsers = parseInt(Deno.args[0]) || 1000;
const filename = "users.csv";

const progress = new ProgressBar({
  title: `Generating ${numUsers} users:`,
  total: numUsers,
});

let completed = 1;

const writer1 = new FastWriter(filename);
const writer2 = new FastWriter("enc_" + filename);

writeToFiles(writer1, writer2, numUsers);
