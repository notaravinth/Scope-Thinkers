const API_URL = "https://jobicy.com/api/v2/remote-jobs";

function stripHtml(html = "") {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeJob(job) {
  const description = stripHtml(job.jobDescription || job.jobExcerpt || "");

  return {
    sourceId: String(job.id),
    title: job.jobTitle || "Untitled role",
    company: job.companyName || "Company not specified",
    description,
    skills: Array.isArray(job.jobIndustry) ? job.jobIndustry : [],
    location: job.jobGeo || "Location not specified",
    experienceLevel: job.jobLevel || "Not specified",
    employmentType: Array.isArray(job.jobType)
      ? job.jobType.join(", ")
      : "Not specified",
    url: job.url || "",
    pubDate: job.pubDate || "",
    salary:
      job.salaryMin != null || job.salaryMax != null
        ? `${job.salaryMin ?? "?"}–${job.salaryMax ?? "?"} ${job.salaryCurrency || ""} ${job.salaryPeriod || ""}`.trim()
        : "Not disclosed",
  };
}

export async function fetchRemoteJobs() {
  const params = new URLSearchParams({
    count: "50",
    industry: "engineering",
  });

  const response = await fetch(`${API_URL}?${params}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Jobicy API returned HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.success === false || !Array.isArray(data.jobs)) {
    throw new Error("Jobicy returned an invalid jobs response");
  }

  return data.jobs
    .map(normalizeJob)
    .filter((job) => job.sourceId && job.title && job.description.length > 20);
}
