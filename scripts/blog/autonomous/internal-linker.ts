import fs from "fs";
import path from "path";
import { loadPublishedTopics } from "./queue-manager";

const LINK_TARGETS = [
  { url: "/", keywords: ["part payment", "EMI calculator", "prepayment calculator", "amortization", "loan calculator"] },
  { url: "/calculators/sip-vs-prepayment", keywords: ["SIP", "systematic investment", "SIP vs prepayment", "invest vs prepay"] },
  { url: "/calculators/home-loan-eligibility", keywords: ["loan eligibility", "how much loan", "FOIR", "eligible for"] },
  { url: "/calculators/tax-benefit", keywords: ["80C", "24b", "tax benefit", "tax deduction", "80E", "section 80"] },
  { url: "/rbi-rates", keywords: ["repo rate", "RBI rate", "current interest rate", "RLLR"] },
  { url: "/login", keywords: ["track", "dashboard", "debt-free date", "monitor", "log your"] },
];

export async function addInternalLinks(slug: string): Promise<void> {
  const filePath = path.join(process.cwd(), "content/blog", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    console.error(`   Post not found: ${slug}`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const parts = content.split("---");
  if (parts.length < 3) return;

  const frontmatter = parts[1];
  let body = parts.slice(2).join("---");
  let linksAdded = 0;

  for (const target of LINK_TARGETS) {
    if (linksAdded >= 5) break;
    for (const keyword of target.keywords) {
      const regex = new RegExp(`(?<!\\[)\\b(${keyword})\\b(?![^\\[]*\\])`, "i");
      if (regex.test(body)) {
        body = body.replace(regex, `[$1](${target.url})`);
        linksAdded++;
        break;
      }
    }
  }

  // Link to related published posts
  const published = loadPublishedTopics();
  const related = published
    .filter((p) => p.slug !== slug)
    .slice(0, 2);

  for (const relatedPost of related) {
    const contentLower = body.toLowerCase();
    const words = relatedPost.seoKeyword.toLowerCase().split(" ");
    const overlap = words.filter((w) => contentLower.includes(w)).length;
    if (overlap >= 2 && body.includes("## What To Do Right Now")) {
      body = body.replace(
        "## What To Do Right Now",
        `\n> 📖 **Related:** [${relatedPost.seoKeyword}](/blog/${relatedPost.slug})\n\n## What To Do Right Now`,
      );
      linksAdded++;
      break;
    }
  }

  const newContent = `---${frontmatter}---\n${body}`;
  fs.writeFileSync(filePath, newContent);
  console.log(`   🔗 Added ${linksAdded} internal links to ${slug}`);
}
