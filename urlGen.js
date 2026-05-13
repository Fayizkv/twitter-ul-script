const fs = require("fs");
const https = require("https");

const text = fs.readFileSync("text.txt", "utf8");

const posts = text
  .split(/\n\s*\d+\.\s/)
  .map(p => p.trim())
  .filter(Boolean);

function shortenUrl(longUrl) {
  return new Promise((resolve, reject) => {
    const api = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;

    https.get(api, (res) => {
      let data = "";

      res.on("data", chunk => data += chunk);

      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

(async () => {
  let output = "";

  for (let i = 0; i < posts.length; i++) {
    const cleanPost = posts[i].replace(/\u200B/g, "").trim();

    const twitterUrl =
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(cleanPost)}`;

    try {
      const shortUrl = await shortenUrl(twitterUrl);

      output += `${i + 1}. ${shortUrl}\n\n`;

      console.log(`${i + 1} done`);
    } catch (err) {
      console.error(`Error on post ${i + 1}`, err);
    }
  }

  fs.writeFileSync("short_tweet_links.txt", output);

  console.log("Generated short_tweet_links.txt");
})();