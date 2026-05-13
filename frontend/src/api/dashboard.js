import client from "./client";

export const getSummary = (year) => client.get("/dashboard/summary", { params: { year } });
