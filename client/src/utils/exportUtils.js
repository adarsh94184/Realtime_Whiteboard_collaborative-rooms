export const exportToImage = (canvas, filename = 'whiteboard', format = 'png') => {
  if (!canvas) return;

  // Create temporary offscreen canvas with background color for export
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const ctx = exportCanvas.getContext('2d');

  // Fill dark background
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // Draw main canvas content
  ctx.drawImage(canvas, 0, 0);

  const imageURI = exportCanvas.toDataURL(`image/${format}`, 1.0);
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = imageURI;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (elements, roomTitle = 'whiteboard') => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(elements, null, 2));
  const link = document.createElement('a');
  link.download = `${roomTitle.replace(/\s+/g, '_')}_data.json`;
  link.href = dataStr;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyRoomLink = (roomId) => {
  const url = `${window.location.origin}/room/${roomId}`;
  navigator.clipboard.writeText(url);
  return url;
};
