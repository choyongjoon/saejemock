import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();
// Use separate component instances for each aggregate to prevent key collisions
app.use(aggregate, { name: "aggregateByViewCount" });
app.use(aggregate, { name: "aggregateByTotalVotes" });
app.use(aggregate, { name: "aggregateByCreatedAt" });

export default app;
