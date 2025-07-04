// utilName.js – turn "john.doe" into {surname:"Doe", first:"John", display:"Dr Doe J."}

export function emailToDisplay(email) {
  const local = email.split("@")[0];          // "john.doe"
  const parts = local.split(/[._-]/);         // ["john","doe"]
  const first = parts[0] || "";
  const surname = parts.length > 1 ? parts[parts.length - 1] : first;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const display = `Dr ${cap(surname)} ${cap(first[0] || "")}.`;
  return { first: cap(first), surname: cap(surname), display };
}
