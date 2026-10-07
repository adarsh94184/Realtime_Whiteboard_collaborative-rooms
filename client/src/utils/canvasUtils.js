// Canvas geometry & shape rendering engine

export const applyStrokePattern = (ctx, pattern) => {
  if (pattern === 'dashed') {
    ctx.setLineDash([12, 6]);
  } else if (pattern === 'dotted') {
    ctx.setLineDash([4, 4]);
  } else {
    ctx.setLineDash([]);
  }
};

export const drawElement = (ctx, element) => {
  if (!element) return;

  ctx.save();
  ctx.globalAlpha = element.opacity !== undefined ? element.opacity : 1;
  ctx.strokeStyle = element.strokeColor || '#ffffff';
  ctx.fillStyle = element.fillColor || 'transparent';
  ctx.lineWidth = element.strokeWidth || 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  applyStrokePattern(ctx, element.strokePattern);

  switch (element.type) {
    case 'pencil':
    case 'eraser': {
      if (element.type === 'eraser') {
        ctx.strokeStyle = '#0b0f19'; // Canvas background color
        ctx.lineWidth = (element.strokeWidth || 3) * 4;
      }
      if (element.points && element.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(element.points[0].x, element.points[0].y);

        if (element.points.length === 1) {
          ctx.lineTo(element.points[0].x, element.points[0].y);
        } else if (element.points.length === 2) {
          ctx.lineTo(element.points[1].x, element.points[1].y);
        } else {
          // Quadratic curve smoothing
          for (let i = 1; i < element.points.length - 1; i++) {
            const xc = (element.points[i].x + element.points[i + 1].x) / 2;
            const yc = (element.points[i].y + element.points[i + 1].y) / 2;
            ctx.quadraticCurveTo(element.points[i].x, element.points[i].y, xc, yc);
          }
          ctx.lineTo(
            element.points[element.points.length - 1].x,
            element.points[element.points.length - 1].y
          );
        }
        ctx.stroke();
      }
      break;
    }

    case 'line': {
      ctx.beginPath();
      ctx.moveTo(element.x, element.y);
      ctx.lineTo(element.x + element.width, element.y + element.height);
      ctx.stroke();
      break;
    }

    case 'arrow': {
      const startX = element.x;
      const startY = element.y;
      const endX = element.x + element.width;
      const endY = element.y + element.height;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(endY - startY, endX - startX);
      const headLength = Math.max(12, element.strokeWidth * 3);

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = element.strokeColor;
      ctx.fill();
      break;
    }

    case 'rectangle': {
      ctx.beginPath();
      ctx.rect(element.x, element.y, element.width, element.height);
      if (element.fillColor && element.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'circle': {
      ctx.beginPath();
      const radiusX = Math.abs(element.width) / 2;
      const radiusY = Math.abs(element.height) / 2;
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;

      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      if (element.fillColor && element.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'text': {
      ctx.font = `${element.fontSize || 20}px 'Outfit', sans-serif`;
      ctx.fillStyle = element.strokeColor || '#ffffff';
      ctx.textBaseline = 'top';

      const lines = (element.text || 'Text').split('\n');
      const lineHeight = (element.fontSize || 20) * 1.3;
      lines.forEach((line, index) => {
        ctx.fillText(line, element.x, element.y + index * lineHeight);
      });
      break;
    }

    case 'sticky': {
      // Draw Sticky Note background
      const width = Math.max(140, element.width || 160);
      const height = Math.max(120, element.height || 140);
      const bgColor = element.fillColor && element.fillColor !== 'transparent' ? element.fillColor : '#fef08a'; // Pastel Yellow default

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(element.x, element.y, width, height, 12);
      ctx.fill();
      ctx.restore();

      // Header border accent line
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(element.x, element.y, width, 24);

      // Render Text inside sticky note
      ctx.font = "500 16px 'Outfit', sans-serif";
      ctx.fillStyle = '#1e293b';
      ctx.textBaseline = 'top';

      const lines = (element.text || 'Sticky Note').split('\n');
      lines.forEach((line, index) => {
        ctx.fillText(line, element.x + 12, element.y + 32 + index * 22);
      });
      break;
    }

    case 'image': {
      if (element.imageObj) {
        ctx.drawImage(element.imageObj, element.x, element.y, element.width, element.height);
      }
      break;
    }

    default:
      break;
  }

  ctx.restore();
};

export const getElementBounds = (el) => {
  if (el.type === 'pencil' || el.type === 'eraser') {
    if (!el.points || el.points.length === 0) return { x: el.x || 0, y: el.y || 0, width: 0, height: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    el.points.forEach(p => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  return {
    x: Math.min(el.x, el.x + el.width),
    y: Math.min(el.y, el.y + el.height),
    width: Math.abs(el.width),
    height: Math.abs(el.height)
  };
};

export const isPointInElement = (px, py, element) => {
  const bounds = getElementBounds(element);
  const padding = 10;
  return (
    px >= bounds.x - padding &&
    px <= bounds.x + bounds.width + padding &&
    py >= bounds.y - padding &&
    py <= bounds.y + bounds.height + padding
  );
};

export const drawSelectionBox = (ctx, element) => {
  const bounds = getElementBounds(element);
  const pad = 6;

  ctx.save();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);

  ctx.strokeRect(
    bounds.x - pad,
    bounds.y - pad,
    bounds.width + pad * 2,
    bounds.height + pad * 2
  );

  // Draw 4 corner handles
  const handles = [
    { x: bounds.x - pad, y: bounds.y - pad },
    { x: bounds.x + bounds.width + pad, y: bounds.y - pad },
    { x: bounds.x - pad, y: bounds.y + bounds.height + pad },
    { x: bounds.x + bounds.width + pad, y: bounds.y + bounds.height + pad }
  ];

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#6366f1';
  ctx.setLineDash([]);
  handles.forEach(h => {
    ctx.beginPath();
    ctx.arc(h.x, h.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
};
