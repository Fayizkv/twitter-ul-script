const fs = require("fs");

// read full txt file
const text = fs.readFileSync("text.txt", "utf8");

// split by numbered posts
const posts = text
  .split(/\n\s*\d+\.\s/)
  .map(p => p.trim())
  .filter(Boolean);

let output = "";

posts.forEach((post, index) => {
  // remove weird invisible characters
  const cleanPost = post.replace(/\u200B/g, "").trim();

  const encoded = encodeURIComponent(cleanPost);

  const url = `https://twitter.com/intent/tweet?text=${encoded}`;

  output += `${index + 1}. ${url}\n\n`;
});

// save to file
fs.writeFileSync("tweet_links.txt", output);

console.log("Generated tweet_links.txt");