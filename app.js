require("dotenv").config();

const fetch = require("node-fetch");

const Discord = require("discord.js");
const client = new Discord.Client();

// list of languages used by the LibreTranslate API
// the language used by default will be the first on in the list (English)
const lang_list = ["en", "ar", "zh", "fr", "de", "it", "ja", "pt", "ru", "es"];
const num_langs = lang_list.length;

function rand_sequence(len = num_langs) {
  // create a list containing all numbers up to the number of languages supported (minus one for english)
  let seq = [];
  for (let i = 1; i < len; i++) {
    seq.push(i);
  }
  // shuffle the sequence
  seq = seq.sort(() => Math.random() - 0.5);
  // the sequence will always start with the first language in the sequence
  seq.unshift(0);
  // now the sequence represents a random traversal through all languages in the lang_list
  return seq;
}

// bot goes here
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

async function card_req(cardname) {
  let url = `https://api.scryfall.com/cards/named?exact=${cardname}`;
  let scryfall_resp = await fetch(url);
  let body = await scryfall_resp.json();

  if (body.object === "error") {
    return `${cardname} is not a Magic card.`;
  }

  let name = body.name;
  let type_line = body.type_line;
  let oracle_text = body.oracle_text;
  let flavor_text = body.flavor_text;

  let reply_string =
    "\n" +
    name +
    "\t\t" +
    body.mana_cost +
    "\n" +
    type_line +
    "\n" +
    oracle_text +
    "\n\n" +
    "*" +
    flavor_text +
    "*";
  if (body.power !== undefined) {
    reply_string += "\n" + body.power + "/" + body.toughness;
  }

  return reply_string;
}

client.on("message", (msg) => {
  if (msg.content.startsWith("!trans")) {
    // Get the card name and fetch the json from the scryfall API
    let cardname = msg.content.split(" ").slice(1).join("_");

    // Make the entirety of the card request and print the final translation
    card_req(cardname)
      .then((reply_string) => {
        msg.reply(reply_string);
      })
      .catch(console.log);
  }
});

client.login(process.env.CLIENT_TOKEN);
