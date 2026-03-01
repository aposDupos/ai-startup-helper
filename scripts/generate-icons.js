// Generate PWA icons as PNG using Canvas API in Node.js
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size, outputPath) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background gradient (indigo)
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#6366F1');
    gradient.addColorStop(1, '#4F46E5');

    // Rounded rect background
    const radius = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Rocket icon (simplified)
    const cx = size / 2;
    const cy = size / 2;
    const scale = size / 192;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Rocket body
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.bezierCurveTo(-15, -40, -18, -10, -18, 20);
    ctx.lineTo(-12, 35);
    ctx.lineTo(12, 35);
    ctx.lineTo(18, 20);
    ctx.bezierCurveTo(18, -10, 15, -40, 0, -50);
    ctx.closePath();
    ctx.fill();

    // Rocket window
    ctx.fillStyle = '#6366F1';
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Rocket window highlight
    ctx.fillStyle = '#818CF8';
    ctx.beginPath();
    ctx.arc(-2, -12, 3, 0, Math.PI * 2);
    ctx.fill();

    // Left fin
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.moveTo(-18, 15);
    ctx.lineTo(-30, 35);
    ctx.lineTo(-12, 35);
    ctx.closePath();
    ctx.fill();

    // Right fin
    ctx.beginPath();
    ctx.moveTo(18, 15);
    ctx.lineTo(30, 35);
    ctx.lineTo(12, 35);
    ctx.closePath();
    ctx.fill();

    // Flame
    ctx.fillStyle = '#FB923C';
    ctx.beginPath();
    ctx.moveTo(-8, 35);
    ctx.quadraticCurveTo(-5, 50, 0, 55);
    ctx.quadraticCurveTo(5, 50, 8, 35);
    ctx.closePath();
    ctx.fill();

    // Inner flame
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    ctx.moveTo(-4, 35);
    ctx.quadraticCurveTo(-2, 45, 0, 48);
    ctx.quadraticCurveTo(2, 45, 4, 35);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Created ${outputPath} (${size}x${size})`);
}

const publicDir = path.join(__dirname, '..', 'public');
generateIcon(192, path.join(publicDir, 'icon-192.png'));
generateIcon(512, path.join(publicDir, 'icon-512.png'));
console.log('Done!');
