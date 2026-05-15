import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  const pw = await bcrypt.hash("password123", 10);

  // Create users
  const alice = await prisma.user.upsert({
    where: { email: "alice@demo.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@demo.com",
      password: pw,
      avatar: "AJ",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@demo.com" },
    update: {},
    create: {
      name: "Bob Smith",
      email: "bob@demo.com",
      password: pw,
      avatar: "BS",
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@demo.com" },
    update: {},
    create: {
      name: "Carol Williams",
      email: "carol@demo.com",
      password: pw,
      avatar: "CW",
    },
  });

  const dave = await prisma.user.upsert({
    where: { email: "dave@demo.com" },
    update: {},
    create: {
      name: "Dave Chen",
      email: "dave@demo.com",
      password: pw,
      avatar: "DC",
    },
  });

  console.log("✅ Users created");

  // Project 1: FlowBoard v2 Launch
  const project1 = await prisma.project.create({
    data: {
      name: "FlowBoard v2 Launch",
      description: "Complete redesign and relaunch of FlowBoard with spatial UI, real-time collaboration, and next-gen animations.",
      color: "#6366f1",
      icon: "🚀",
      ownerId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: "OWNER" },
          { userId: bob.id, role: "ADMIN" },
          { userId: carol.id, role: "MEMBER" },
          { userId: dave.id, role: "MEMBER" },
        ],
      },
      columns: {
        create: [
          {
            name: "Backlog",
            position: 0,
            color: "#94a3b8",
            tasks: {
              create: [
                {
                  title: "Design system documentation",
                  description: "Create comprehensive docs for the new design system including color tokens, typography scale, spacing, and component library.",
                  priority: "LOW",
                  position: 0,
                  createdById: alice.id,
                  assigneeId: carol.id,
                  dueDate: new Date("2026-06-15"),
                },
                {
                  title: "Accessibility audit",
                  description: "Run full WCAG 2.2 AA compliance check across all pages. Fix any contrast issues and add proper ARIA labels.",
                  priority: "MEDIUM",
                  position: 1,
                  createdById: alice.id,
                  dueDate: new Date("2026-06-20"),
                },
              ],
            },
          },
          {
            name: "In Progress",
            position: 1,
            color: "#f59e0b",
            tasks: {
              create: [
                {
                  title: "Implement drag-and-drop board",
                  description: "Build the spatial kanban board with physics-based drag-and-drop using Framer Motion. Cards should have spring animations and snap to columns.",
                  priority: "HIGH",
                  position: 0,
                  createdById: alice.id,
                  assigneeId: bob.id,
                  dueDate: new Date("2026-05-25"),
                },
                {
                  title: "WebSocket real-time sync",
                  description: "Integrate Socket.io for live task updates. When a user moves a card, all connected clients should see it move instantly.",
                  priority: "HIGH",
                  position: 1,
                  createdById: alice.id,
                  assigneeId: dave.id,
                  dueDate: new Date("2026-05-28"),
                },
                {
                  title: "Aurora background shader",
                  description: "Create the animated aurora borealis gradient background using CSS animations. Should be performant and not cause jank.",
                  priority: "MEDIUM",
                  position: 2,
                  createdById: bob.id,
                  assigneeId: carol.id,
                  dueDate: new Date("2026-05-22"),
                },
              ],
            },
          },
          {
            name: "Review",
            position: 2,
            color: "#8b5cf6",
            tasks: {
              create: [
                {
                  title: "Authentication flow",
                  description: "Login, register, and session management with NextAuth. Includes credential provider and demo user quick-login.",
                  priority: "HIGH",
                  position: 0,
                  createdById: alice.id,
                  assigneeId: alice.id,
                  dueDate: new Date("2026-05-20"),
                },
              ],
            },
          },
          {
            name: "Done",
            position: 3,
            color: "#10b981",
            tasks: {
              create: [
                {
                  title: "Project setup & architecture",
                  description: "Initialize Next.js project, configure TypeScript, Prisma, and establish folder structure. Set up CI/CD pipeline.",
                  priority: "HIGH",
                  position: 0,
                  createdById: alice.id,
                  assigneeId: alice.id,
                },
                {
                  title: "Database schema design",
                  description: "Design and implement the Prisma schema with User, Project, Column, Task, Comment, and Notification models.",
                  priority: "HIGH",
                  position: 1,
                  createdById: alice.id,
                  assigneeId: bob.id,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✅ Project 1 created: FlowBoard v2 Launch");

  // Project 2: Marketing Campaign Q3
  const project2 = await prisma.project.create({
    data: {
      name: "Marketing Campaign Q3",
      description: "Q3 2026 marketing initiatives including product launch campaign, social media strategy, and partner outreach.",
      color: "#ec4899",
      icon: "📣",
      ownerId: bob.id,
      members: {
        create: [
          { userId: bob.id, role: "OWNER" },
          { userId: alice.id, role: "MEMBER" },
          { userId: carol.id, role: "ADMIN" },
        ],
      },
      columns: {
        create: [
          {
            name: "Ideas",
            position: 0,
            color: "#f472b6",
            tasks: {
              create: [
                {
                  title: "Influencer partnership program",
                  description: "Research and reach out to 10 tech influencers for product demos and reviews. Budget: $5,000.",
                  priority: "MEDIUM",
                  position: 0,
                  createdById: bob.id,
                  assigneeId: carol.id,
                  dueDate: new Date("2026-07-01"),
                },
                {
                  title: "Referral rewards system",
                  description: "Design a referral program where existing users get premium features for inviting new users.",
                  priority: "LOW",
                  position: 1,
                  createdById: bob.id,
                },
              ],
            },
          },
          {
            name: "Planning",
            position: 1,
            color: "#a78bfa",
            tasks: {
              create: [
                {
                  title: "Product launch video",
                  description: "Script, storyboard, and produce a 60-second product launch video showcasing the spatial UI features.",
                  priority: "HIGH",
                  position: 0,
                  createdById: bob.id,
                  assigneeId: alice.id,
                  dueDate: new Date("2026-06-10"),
                },
                {
                  title: "Landing page redesign",
                  description: "Redesign the marketing landing page with scroll-triggered animations, 3D product mockups, and social proof.",
                  priority: "HIGH",
                  position: 1,
                  createdById: carol.id,
                  assigneeId: carol.id,
                  dueDate: new Date("2026-06-05"),
                },
              ],
            },
          },
          {
            name: "Execution",
            position: 2,
            color: "#fb923c",
            tasks: {
              create: [
                {
                  title: "Social media content calendar",
                  description: "Create and schedule 30 days of content across Twitter, LinkedIn, and Instagram. Focus on product features and team stories.",
                  priority: "MEDIUM",
                  position: 0,
                  createdById: bob.id,
                  assigneeId: bob.id,
                  dueDate: new Date("2026-06-01"),
                },
              ],
            },
          },
          {
            name: "Completed",
            position: 3,
            color: "#34d399",
            tasks: {
              create: [
                {
                  title: "Brand guidelines update",
                  description: "Updated brand guidelines with new color palette, typography, and logo usage rules for the v2 launch.",
                  priority: "MEDIUM",
                  position: 0,
                  createdById: carol.id,
                  assigneeId: carol.id,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✅ Project 2 created: Marketing Campaign Q3");

  // Add some comments
  const tasks = await prisma.task.findMany({ take: 5 });

  if (tasks.length > 0) {
    await prisma.comment.createMany({
      data: [
        {
          content: "I've started working on the spring physics for the card animations. Looking really smooth so far! 🎯",
          taskId: tasks[0].id,
          userId: bob.id,
        },
        {
          content: "Nice! Can you share a screen recording? I want to make sure the easing feels right.",
          taskId: tasks[0].id,
          userId: alice.id,
        },
        {
          content: "The socket connection is stable now. Tested with 3 concurrent users and task moves sync in under 50ms.",
          taskId: tasks[1].id,
          userId: dave.id,
        },
        {
          content: "This is a great foundation. Let's also add reconnection logic for dropped connections.",
          taskId: tasks[1].id,
          userId: alice.id,
        },
        {
          content: "The aurora gradient looks beautiful! I used a 4-color gradient with hue-rotate keyframes.",
          taskId: tasks[2].id,
          userId: carol.id,
        },
      ],
    });
    console.log("✅ Comments created");
  }

  // Add some notifications
  await prisma.notification.createMany({
    data: [
      {
        type: "TASK_ASSIGNED",
        message: "Alice assigned you to 'Implement drag-and-drop board'",
        userId: bob.id,
        linkedProjectId: project1.id,
      },
      {
        type: "COMMENT",
        message: "Bob commented on 'Implement drag-and-drop board'",
        userId: alice.id,
        linkedProjectId: project1.id,
      },
      {
        type: "TASK_ASSIGNED",
        message: "Bob assigned you to 'Product launch video'",
        userId: alice.id,
        linkedProjectId: project2.id,
      },
      {
        type: "PROJECT_INVITE",
        message: "You were added to 'Marketing Campaign Q3'",
        userId: alice.id,
        linkedProjectId: project2.id,
      },
      {
        type: "COMMENT",
        message: "Carol commented on 'Aurora background shader'",
        userId: bob.id,
        linkedProjectId: project1.id,
      },
    ],
  });
  console.log("✅ Notifications created");

  console.log("\n🎉 Seed complete! Login with alice@demo.com / password123\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
