export function generateReceiptId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).padEnd(8, '0').slice(2, 8).toUpperCase();
  return `BMB-${ts}-${rand}`;
}
