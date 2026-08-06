export function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${year}. ${month}. ${day}.`;
}

export function formatDateRange(startedAt: string, endedAt: string) {
  if (startedAt === endedAt) return formatDate(startedAt);
  return `${formatDate(startedAt)} – ${formatDate(endedAt)}`;
}
