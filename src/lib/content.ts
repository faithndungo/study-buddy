// Modular AZ-900 study content. Structured after the public Microsoft Learn
// AZ-900 skills outline (Cloud concepts / Architecture & services / Management & governance).
// Original educational material — not official Microsoft exam content.

export type AreaId = "cloud-concepts" | "architecture" | "governance";

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  example: string;
  keyTerms: { term: string; meaning: string }[];
}

export interface Area {
  id: AreaId;
  title: string;
  weight: string;
  blurb: string;
  lessons: Lesson[];
}

export const AREAS: Area[] = [
  {
    id: "cloud-concepts",
    title: "Cloud concepts",
    weight: "25–30%",
    blurb: "What the cloud is, why people use it, and the main service and deployment models.",
    lessons: [
      {
        id: "cc-what-is-cloud",
        title: "What is cloud computing?",
        summary: "Renting computing power over the internet instead of owning it.",
        explanation:
          "Cloud computing means using servers, storage, databases and software that live in someone else's data centre, delivered over the internet. You pay for what you use, like electricity, instead of buying and maintaining your own hardware.",
        example:
          "A small online shop runs its website on Azure. During a holiday sale it automatically gets more servers, then scales back down afterwards — paying only for the extra hours used.",
        keyTerms: [
          { term: "Consumption-based model", meaning: "You pay only for the resources you actually use." },
          { term: "CapEx vs OpEx", meaning: "Buying hardware up front (CapEx) vs paying as you go (OpEx)." },
        ],
      },
      {
        id: "cc-deployment-models",
        title: "Public, private and hybrid clouds",
        summary: "Where your cloud runs and who shares it.",
        explanation:
          "A public cloud is run by a provider like Microsoft and shared by many customers. A private cloud is used by one organisation only. A hybrid cloud combines both, letting data and apps move between them.",
        example:
          "A hospital keeps sensitive patient records in its private data centre but runs its public appointment website in Azure — that's hybrid.",
        keyTerms: [
          { term: "Public cloud", meaning: "Shared infrastructure owned by a provider." },
          { term: "Hybrid cloud", meaning: "Public and private clouds working together." },
        ],
      },
      {
        id: "cc-service-models",
        title: "IaaS, PaaS and SaaS",
        summary: "How much of the stack you manage versus the provider.",
        explanation:
          "IaaS gives you raw infrastructure (virtual machines, networks) and you manage the rest. PaaS gives you a ready platform to deploy code without managing servers. SaaS is finished software you simply use.",
        example:
          "Pizza analogy: IaaS is buying ingredients and cooking at home with a rented kitchen, PaaS is take-and-bake, SaaS is pizza delivered to your table.",
        keyTerms: [
          { term: "IaaS", meaning: "Infrastructure as a Service — e.g. Azure Virtual Machines." },
          { term: "PaaS", meaning: "Platform as a Service — e.g. Azure App Service." },
          { term: "SaaS", meaning: "Software as a Service — e.g. Microsoft 365." },
        ],
      },
      {
        id: "cc-benefits",
        title: "High availability and scalability",
        summary: "Staying online and growing on demand.",
        explanation:
          "High availability means your app keeps running even when something fails. Scalability means adding or removing resources to match demand — scaling up (bigger machine) or out (more machines).",
        example:
          "A ticketing site scales out to 20 servers when concert tickets go on sale, then back to 2 at night.",
        keyTerms: [
          { term: "SLA", meaning: "Service Level Agreement — the uptime a provider commits to." },
          { term: "Elasticity", meaning: "Automatically adjusting resources as demand changes." },
        ],
      },
    ],
  },
  {
    id: "architecture",
    title: "Azure architecture and services",
    weight: "35–40%",
    blurb: "Regions, compute, networking, storage and identity in Azure.",
    lessons: [
      {
        id: "ar-regions",
        title: "Regions and availability zones",
        summary: "Where Azure data centres are and how they protect you.",
        explanation:
          "A region is a geographic area containing one or more data centres. Availability zones are physically separate locations inside a region with their own power, cooling and networking, so one failing doesn't take everything down.",
        example:
          "Running your app across three availability zones in one region means a fire in one building won't stop your service.",
        keyTerms: [
          { term: "Region pair", meaning: "Two regions in the same geography paired for disaster recovery." },
          { term: "Availability zone", meaning: "Separate data centre(s) within a region." },
        ],
      },
      {
        id: "ar-compute",
        title: "Virtual machines and App Service",
        summary: "Running your code in Azure.",
        explanation:
          "Azure Virtual Machines are computers you rent and fully control (IaaS). Azure App Service hosts web apps without you managing the operating system (PaaS).",
        example:
          "A school moves its old student-records server to an Azure VM, but builds its new parent portal on App Service.",
        keyTerms: [
          { term: "Virtual machine", meaning: "A software computer running on Azure hardware." },
          { term: "App Service", meaning: "Managed hosting for web apps and APIs." },
        ],
      },
      {
        id: "ar-networking",
        title: "Virtual networks",
        summary: "Private networks for your Azure resources.",
        explanation:
          "An Azure Virtual Network (VNet) lets your Azure resources talk to each other, the internet and your on-premises network securely, like a private office network in the cloud.",
        example:
          "Your web server and database sit in the same VNet so the database never needs to be exposed to the internet.",
        keyTerms: [
          { term: "VNet peering", meaning: "Connecting two virtual networks together." },
          { term: "VPN Gateway", meaning: "Encrypted connection between on-premises and Azure." },
        ],
      },
      {
        id: "ar-storage",
        title: "Azure Storage and Blob Storage",
        summary: "Storing files and data in the cloud.",
        explanation:
          "Azure Storage offers services for different kinds of data. Blob Storage holds unstructured data like images, videos and backups, with access tiers (hot, cool, cold, archive) to balance cost and speed.",
        example:
          "A photo app stores user uploads in Blob Storage and moves photos older than a year to a cheaper tier.",
        keyTerms: [
          { term: "Blob", meaning: "Binary large object — any file." },
          { term: "Access tier", meaning: "Pricing level based on how often data is accessed." },
        ],
      },
      {
        id: "ar-identity",
        title: "Microsoft Entra ID and security",
        summary: "Who you are and what you can access.",
        explanation:
          "Microsoft Entra ID (formerly Azure Active Directory) is Azure's identity service: it signs people in and controls access. Features include multifactor authentication and Conditional Access. Zero Trust means never trust, always verify.",
        example:
          "Staff sign in once with Entra ID and must approve a phone prompt (MFA) when logging in from a new country.",
        keyTerms: [
          { term: "MFA", meaning: "Proving identity with two or more methods." },
          { term: "Zero Trust", meaning: "Verify every request explicitly, assume breach." },
        ],
      },
    ],
  },
  {
    id: "governance",
    title: "Azure management and governance",
    weight: "30–35%",
    blurb: "Costs, responsibility, compliance and tools for managing Azure.",
    lessons: [
      {
        id: "gv-shared-responsibility",
        title: "The shared responsibility model",
        summary: "What Microsoft secures and what you secure.",
        explanation:
          "Security duties are split. Microsoft always secures the physical data centres. You are always responsible for your data, accounts and devices. The rest shifts depending on IaaS, PaaS or SaaS.",
        example:
          "On a VM you patch the operating system yourself; on App Service Microsoft does it for you.",
        keyTerms: [{ term: "Shared responsibility", meaning: "Security split between provider and customer." }],
      },
      {
        id: "gv-cost",
        title: "Pricing and cost management",
        summary: "Estimating and controlling what you spend.",
        explanation:
          "Costs depend on resource type, usage, region and more. The Pricing Calculator estimates costs for new workloads; the TCO Calculator compares on-premises vs Azure; Cost Management helps track and set budgets.",
        example:
          "A startup sets a monthly budget alert in Cost Management so they're emailed at 80% of spend.",
        keyTerms: [
          { term: "Pricing calculator", meaning: "Estimate the cost of Azure services." },
          { term: "Tags", meaning: "Labels on resources, useful for tracking costs." },
        ],
      },
      {
        id: "gv-governance",
        title: "Governance and compliance",
        summary: "Rules that keep your Azure tidy and safe.",
        explanation:
          "Azure Policy enforces rules (e.g. only allowed regions). Resource locks prevent accidental deletion. Microsoft Purview helps govern data. The Service Trust Portal shares Microsoft's compliance reports.",
        example:
          "A company uses Azure Policy so nobody can create resources outside Europe, meeting data-residency rules.",
        keyTerms: [
          { term: "Azure Policy", meaning: "Create and enforce rules on resources." },
          { term: "Resource lock", meaning: "Prevents deletion or changes to a resource." },
        ],
      },
    ],
  },
];

export const ALL_LESSONS = AREAS.flatMap((a) => a.lessons.map((l) => ({ ...l, areaId: a.id })));

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  area: AreaId;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  wrongWhy: string[]; // why each option is wrong (empty string for the correct one)
}

export const QUESTIONS: Question[] = [
  {
    id: "q1", area: "cloud-concepts", difficulty: "easy",
    question: "Which cloud model lets a company keep sensitive data on-premises while running other apps in a public cloud?",
    options: ["Public cloud", "Private cloud", "Hybrid cloud", "Community cloud"],
    answer: 2,
    explanation: "Hybrid cloud combines on-premises (private) and public cloud resources.",
    wrongWhy: ["Public cloud alone doesn't include on-premises resources.", "Private cloud alone doesn't include a public cloud.", "", "Community cloud is shared by organisations with common needs — not the combination described."],
  },
  {
    id: "q2", area: "cloud-concepts", difficulty: "easy",
    question: "Microsoft 365 is an example of which service model?",
    options: ["IaaS", "PaaS", "SaaS", "On-premises"],
    answer: 2,
    explanation: "Microsoft 365 is finished software you just use — Software as a Service.",
    wrongWhy: ["IaaS gives raw infrastructure like VMs.", "PaaS is a platform to build and host your own apps.", "", "Microsoft 365 runs in Microsoft's cloud, not on your own servers."],
  },
  {
    id: "q3", area: "cloud-concepts", difficulty: "medium",
    question: "Paying for cloud resources only when you use them is known as…",
    options: ["Capital expenditure", "Consumption-based model", "Fixed pricing", "Reserved hardware"],
    answer: 1,
    explanation: "The consumption-based model means you pay for what you use, an operational expense.",
    wrongWhy: ["CapEx is buying hardware up front.", "", "Fixed pricing doesn't depend on usage.", "Reserving hardware is a commitment, not pay-per-use."],
  },
  {
    id: "q4", area: "cloud-concepts", difficulty: "medium",
    question: "Adding more virtual machines to handle increased traffic is called…",
    options: ["Scaling up", "Scaling out", "Failover", "Peering"],
    answer: 1,
    explanation: "Scaling out (horizontal scaling) adds more instances.",
    wrongWhy: ["Scaling up means making one machine bigger.", "", "Failover is switching to a backup after failure.", "Peering connects networks."],
  },
  {
    id: "q5", area: "cloud-concepts", difficulty: "hard",
    question: "In which service model does the customer manage the operating system?",
    options: ["SaaS", "PaaS", "IaaS", "All of them"],
    answer: 2,
    explanation: "With IaaS (e.g. VMs) you manage the OS, patches and installed software.",
    wrongWhy: ["In SaaS the provider manages everything except your data and access.", "In PaaS the provider manages the OS.", "", "Only IaaS leaves OS management to the customer."],
  },
  {
    id: "q6", area: "architecture", difficulty: "easy",
    question: "What are physically separate locations within an Azure region called?",
    options: ["Region pairs", "Availability zones", "Resource groups", "Subscriptions"],
    answer: 1,
    explanation: "Availability zones are separate data centres within one region.",
    wrongWhy: ["Region pairs are two different regions.", "", "Resource groups are logical containers, not locations.", "Subscriptions are billing/management boundaries."],
  },
  {
    id: "q7", area: "architecture", difficulty: "easy",
    question: "Which service is best for storing large amounts of images and videos?",
    options: ["Azure Blob Storage", "Azure Virtual Network", "Microsoft Entra ID", "Azure Policy"],
    answer: 0,
    explanation: "Blob Storage is designed for unstructured data like media files.",
    wrongWhy: ["", "VNets handle networking, not storage.", "Entra ID handles identity.", "Azure Policy enforces rules."],
  },
  {
    id: "q8", area: "architecture", difficulty: "medium",
    question: "Which service lets you host a web app without managing the underlying servers?",
    options: ["Azure Virtual Machines", "Azure App Service", "Azure VPN Gateway", "Azure Files"],
    answer: 1,
    explanation: "App Service is PaaS hosting for web apps and APIs.",
    wrongWhy: ["VMs require you to manage the OS.", "", "VPN Gateway connects networks.", "Azure Files provides file shares."],
  },
  {
    id: "q9", area: "architecture", difficulty: "medium",
    question: "What does multifactor authentication (MFA) require?",
    options: ["A longer password", "Two or more forms of verification", "A VPN connection", "An admin approval"],
    answer: 1,
    explanation: "MFA requires two or more of: something you know, have, or are.",
    wrongWhy: ["A longer password is still one factor.", "", "A VPN secures a connection, not identity.", "Admin approval isn't MFA."],
  },
  {
    id: "q10", area: "architecture", difficulty: "hard",
    question: "Which Blob access tier is cheapest to store but has the highest retrieval delay?",
    options: ["Hot", "Cool", "Cold", "Archive"],
    answer: 3,
    explanation: "Archive is the lowest storage cost and can take hours to rehydrate.",
    wrongWhy: ["Hot is for frequently accessed data and costs most to store.", "Cool is cheaper than hot but data is still online.", "Cold is cheaper still but online.", ""],
  },
  {
    id: "q11", area: "architecture", difficulty: "hard",
    question: "What security principle says 'never trust, always verify'?",
    options: ["Defense in depth", "Zero Trust", "Least cost", "Shared responsibility"],
    answer: 1,
    explanation: "Zero Trust assumes breach and verifies every request explicitly.",
    wrongWhy: ["Defense in depth is about layers of protection.", "", "Not a security principle.", "Shared responsibility splits duties between provider and customer."],
  },
  {
    id: "q12", area: "governance", difficulty: "easy",
    question: "Under the shared responsibility model, who is ALWAYS responsible for your data?",
    options: ["Microsoft", "The customer", "Your internet provider", "It depends on the region"],
    answer: 1,
    explanation: "Customers always own and are responsible for their data, accounts and devices.",
    wrongWhy: ["Microsoft secures physical infrastructure, not your data choices.", "", "ISPs have no role here.", "Region doesn't change this responsibility."],
  },
  {
    id: "q13", area: "governance", difficulty: "medium",
    question: "Which tool estimates the cost of Azure services before you deploy them?",
    options: ["Azure Pricing Calculator", "Azure Policy", "Resource locks", "Azure Monitor"],
    answer: 0,
    explanation: "The Pricing Calculator estimates the cost of planned workloads.",
    wrongWhy: ["", "Azure Policy enforces rules.", "Locks prevent deletion.", "Azure Monitor collects telemetry."],
  },
  {
    id: "q14", area: "governance", difficulty: "medium",
    question: "Which feature prevents someone from accidentally deleting an important resource?",
    options: ["Tags", "Resource lock", "Blob tier", "Availability zone"],
    answer: 1,
    explanation: "A Delete or ReadOnly resource lock blocks accidental deletion.",
    wrongWhy: ["Tags are labels for organising resources.", "", "Blob tiers affect storage cost.", "Zones improve availability, not deletion protection."],
  },
  {
    id: "q15", area: "governance", difficulty: "hard",
    question: "A company must ensure resources are only created in approved regions. What should they use?",
    options: ["Azure Policy", "Microsoft Entra ID", "Cost Management", "Service Trust Portal"],
    answer: 0,
    explanation: "Azure Policy can deny resource creation outside allowed locations.",
    wrongWhy: ["", "Entra ID controls identity, not resource locations.", "Cost Management tracks spending.", "The Service Trust Portal provides compliance reports."],
  },
];

export interface Flashcard {
  id: string;
  area: AreaId;
  front: string;
  back: string;
}

export const FLASHCARDS: Flashcard[] = [
  { id: "f1", area: "cloud-concepts", front: "Cloud computing", back: "Renting computing services over the internet and paying only for what you use." },
  { id: "f2", area: "cloud-concepts", front: "IaaS", back: "You rent infrastructure (VMs, networks) and manage the OS and apps yourself." },
  { id: "f3", area: "cloud-concepts", front: "PaaS", back: "A ready platform to run your code — the provider manages servers and OS." },
  { id: "f4", area: "cloud-concepts", front: "SaaS", back: "Finished software you just use, like Microsoft 365." },
  { id: "f5", area: "cloud-concepts", front: "Hybrid cloud", back: "Public cloud and private/on-premises resources working together." },
  { id: "f6", area: "cloud-concepts", front: "Scalability", back: "Adding or removing resources to match demand." },
  { id: "f7", area: "architecture", front: "Azure region", back: "A geographic area with one or more Azure data centres." },
  { id: "f8", area: "architecture", front: "Availability zone", back: "A physically separate location inside a region with independent power and networking." },
  { id: "f9", area: "architecture", front: "Azure Virtual Machine", back: "A computer you rent in Azure and fully control (IaaS)." },
  { id: "f10", area: "architecture", front: "Blob Storage", back: "Storage for unstructured data like images, videos and backups." },
  { id: "f11", area: "architecture", front: "Virtual Network (VNet)", back: "A private network in Azure connecting your resources securely." },
  { id: "f12", area: "architecture", front: "Microsoft Entra ID", back: "Azure's identity service for sign-in and access control." },
  { id: "f13", area: "governance", front: "Shared responsibility", back: "Security duties split between Microsoft and the customer." },
  { id: "f14", area: "governance", front: "Azure Policy", back: "Creates and enforces rules on your Azure resources." },
  { id: "f15", area: "governance", front: "Resource lock", back: "Stops a resource from being deleted or changed by accident." },
  { id: "f16", area: "governance", front: "Pricing Calculator", back: "Estimates the cost of Azure services before you use them." },
];

export const areaTitle = (id: AreaId) => AREAS.find((a) => a.id === id)?.title ?? id;
