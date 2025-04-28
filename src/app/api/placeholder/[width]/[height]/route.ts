import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { width: string; height: string } | Promise<{ width: string; height: string }> }
) {
  const { width: widthStr, height: heightStr } = await context.params;
  const width = parseInt(widthStr, 10);
  const height = parseInt(heightStr, 10);

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return new NextResponse('Invalid dimensions', { status: 400 });
  }

  // Simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#374151" /> 
      <text 
        x="50%" 
        y="50%" 
        font-family="sans-serif" 
        font-size="20" 
        fill="#9ca3af" 
        dominant-baseline="middle" 
        text-anchor="middle"
      >
        ${width}x${height}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache aggressively
    },
  });
}
