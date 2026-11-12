require("dotenv").config({ path: require("node:path").resolve(__dirname, "../../.env") });

const readline = require("node:readline/promises");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDatabase = require("../src/config/database");
const Usuario = require("../src/models/Usuario");

async function readHiddenPassword(prompt) {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    throw new Error("Ejecuta este comando desde una terminal interactiva.");
  }

  return new Promise(resolve => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    let password = "";

    function onInput(character) {
      if (character === "\u0003") {
        process.stdout.write("\n");
        process.exit(1);
      }
      if (character === "\r" || character === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onInput);
        process.stdout.write("\n");
        resolve(password);
        return;
      }
      if (character === "\u007f" || character === "\b") {
        password = password.slice(0, -1);
      } else if (character >= " ") {
        password += character;
      }
    }

    process.stdin.on("data", onInput);
  });
}

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Ejecuta npm run admin:create desde una terminal interactiva para ingresar el usuario y la contraseña.");
  }

  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const username = (await prompt.question("Usuario administrador (3-40 caracteres): "))
      .trim()
      .toLowerCase();
    if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
      throw new Error("Usa de 3 a 40 caracteres: letras, números, punto, guion o guion bajo.");
    }
    prompt.close();

    const password = await readHiddenPassword("Contraseña (mínimo 12 caracteres): ");
    if (password.length < 12) {
      throw new Error("La contraseña debe tener al menos 12 caracteres.");
    }

    await connectDatabase();
    if (await Usuario.exists({ username })) {
      throw new Error("Ese usuario ya existe; no se modificó la cuenta.");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await Usuario.create({ username, passwordHash });
    console.info(`Administrador "${username}" creado correctamente.`);
  } finally {
    prompt.close();
    await mongoose.disconnect();
  }
}

main().catch(error => {
  console.error(`No se pudo crear el administrador: ${error.message}`);
  process.exitCode = 1;
});
