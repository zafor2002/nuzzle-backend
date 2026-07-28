import { config } from "dotenv";

// Same env the app reads, so URL-prefix checks are tested against real values.
config({ path: ".env.local" });
config({ path: ".env" });
