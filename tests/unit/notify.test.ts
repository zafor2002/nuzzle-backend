import { describe, expect, it, vi, beforeEach } from "vitest";

const findUnique = vi.fn();
const create = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    owner: { findUnique: (...a: unknown[]) => findUnique(...a) },
    notification: { create: (...a: unknown[]) => create(...a) },
  },
}));

const { notify } = await import("@/lib/notify");

const prefs = { notifyLikes: true, notifyComments: true, notifyFollows: true };

beforeEach(() => {
  findUnique.mockReset();
  create.mockReset();
});

describe("notify — preferences are enforced at the write, not the read", () => {
  it("writes when the type is switched on", async () => {
    findUnique.mockResolvedValue(prefs);
    await notify("owner-1", "like", "Someone liked your post.");
    expect(create).toHaveBeenCalledOnce();
  });

  it.each([
    ["like", "notifyLikes"],
    ["comment", "notifyComments"],
    ["follow", "notifyFollows"],
  ])("drops a %s when %s is off", async (type, column) => {
    findUnique.mockResolvedValue({ ...prefs, [column]: false });
    await notify("owner-1", type, "message");
    expect(create).not.toHaveBeenCalled();
  });

  it("does not suppress one type when a different one is off", async () => {
    findUnique.mockResolvedValue({ ...prefs, notifyLikes: false });
    await notify("owner-1", "comment", "message");
    expect(create).toHaveBeenCalledOnce();
  });

  it("delivers a type that has no preference column at all", async () => {
    // Guards against a new notification kind being silently swallowed because
    // nobody remembered to add a matching preference.
    await notify("owner-1", "message", "You have a new message.");
    expect(create).toHaveBeenCalledOnce();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("delivers if the owner row cannot be read", async () => {
    findUnique.mockResolvedValue(null);
    await notify("owner-1", "like", "message");
    expect(create).toHaveBeenCalledOnce();
  });
});
