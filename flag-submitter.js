let flagsPromise;

const loadFlags = () => {
  if (!flagsPromise) {
    flagsPromise = fetch(new URL("./flags.json", import.meta.url)).then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load archived flags (${response.status})`);
      }
      return response.json();
    });
  }
  return flagsPromise;
};

const sha256sum = async (value) => {
  const utf8 = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  return Array.from(new Uint8Array(hashBuffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

export const submitArchivedFlag = async (challengeId, flag) => {
  const flags = await loadFlags();
  const expectedHashes = flags[challengeId];

  if (!Array.isArray(expectedHashes) || expectedHashes.length === 0) {
    return { status: "paused", message: "Flag not archived" };
  }

  const submittedHash = await sha256sum(flag);
  return expectedHashes.includes(submittedHash)
    ? { status: "correct", message: "Correct" }
    : { status: "incorrect", message: "Incorrect" };
};
