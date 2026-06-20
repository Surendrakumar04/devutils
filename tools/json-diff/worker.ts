import { diffJson } from "@/lib/json/diff";

self.onmessage = (e) => {
  const { type, left, right, id } = e.data;

  if (type === "diff") {
    try {
      JSON.parse(left);
    } catch {
      self.postMessage({ id, type: "error", side: "left", message: "Invalid JSON in left pane" });
      return;
    }
    try {
      JSON.parse(right);
    } catch {
      self.postMessage({ id, type: "error", side: "right", message: "Invalid JSON in right pane" });
      return;
    }

    try {
      const result = diffJson(left, right);
      self.postMessage({ id, type: "result", ...result });
    } catch (err) {
      self.postMessage({ id, type: "error", side: "both", message: String(err) });
    }
  }
};
