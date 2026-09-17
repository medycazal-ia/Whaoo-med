import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Évite que Next.js régénère AGENTS.md/CLAUDE.md à chaque `next dev`.
  agentRules: false,
};

export default nextConfig;
