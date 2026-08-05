export function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${year}. ${month}. ${day}.`;
}
