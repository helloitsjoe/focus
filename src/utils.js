export const formatTime = uIntMs => {
  const ms = Math.max(uIntMs, 0);
  const min = Math.floor((ms / 1000 / 60) % 60).toString();
  const sec = Math.floor((ms / 1000) % 60).toString();
  return `${min}:${sec.padStart(2, '0')}`;
};
