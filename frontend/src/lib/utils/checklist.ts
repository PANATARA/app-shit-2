/**
 * Checklist parsing and serialization utility for Markdown task lists in PlannedChore message.
 *
 * Supports Markdown task format:
 * - [ ] Unchecked item
 * - [x] Checked item
 * - [X] Checked item
 */

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface ParsedMessage {
  description: string; // Plain text description without checklist lines
  subtasks: Subtask[];
  hasSubtasks: boolean;
}

const CHECKLIST_REGEX = /^\s*[-*]\s*\[([ xX])\]\s*(.*)$/;

let idCounter = 0;

/**
 * Generate a unique ID for a subtask
 */
export function generateSubtaskId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `subtask-${Date.now()}-${++idCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Parse a raw message string containing optional markdown checklist items and description text.
 *
 * @param rawMessage - Raw message string from PlannedChore
 * @returns ParsedMessage with description, subtasks array, and hasSubtasks flag
 */
export function parseMessage(rawMessage: string | null | undefined): ParsedMessage {
  if (!rawMessage || typeof rawMessage !== "string") {
    return {
      description: "",
      subtasks: [],
      hasSubtasks: false,
    };
  }

  const lines = rawMessage.split(/\r?\n/);
  const descriptionLines: string[] = [];
  const subtasks: Subtask[] = [];

  for (const line of lines) {
    const match = line.match(CHECKLIST_REGEX);
    if (match) {
      const isDone = match[1].toLowerCase() === "x";
      const text = match[2].trim();
      subtasks.push({
        id: generateSubtaskId(),
        text,
        done: isDone,
      });
    } else {
      descriptionLines.push(line);
    }
  }

  const description = descriptionLines.join("\n").trim();

  return {
    description,
    subtasks,
    hasSubtasks: subtasks.length > 0,
  };
}

/**
 * Serialize description and subtasks array back into a unified Markdown string.
 *
 * @param description - Regular description text
 * @param subtasks - List of subtasks with text and done status
 * @returns Serialized Markdown string for the backend message field
 */
export function serializeMessage(
  description: string = "",
  subtasks: Array<{ text: string; done: boolean }> = []
): string {
  const cleanDescription = (description || "").trim();
  const validSubtasks = (subtasks || []).filter(
    (st) => st && typeof st.text === "string" && st.text.trim().length > 0
  );

  const subtaskLines = validSubtasks.map((st) => {
    const mark = st.done ? "x" : " ";
    return `- [${mark}] ${st.text.trim()}`;
  });

  if (subtaskLines.length === 0) {
    return cleanDescription;
  }

  if (!cleanDescription) {
    return subtaskLines.join("\n");
  }

  return `${cleanDescription}\n${subtaskLines.join("\n")}`;
}
