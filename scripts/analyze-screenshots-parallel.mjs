#!/usr/bin/env node
// Analyze all screenshots in parallel using VLM to find button coordinates
// Run: node scripts/analyze-screenshots-parallel.mjs

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawn } from 'node:child_process';

const ROOT = process.cwd();
const SCREENSHOTS_DIR = path.join(ROOT, 'public', 'screenshots');
const OUTPUT_FILE = path.join(ROOT, 'button-coordinates.json');
const PARALLEL_JOBS = Number(process.env.PARALLEL || '20');

// Get all screenshot files
const screenshots = fs.readdirSync(SCREENSHOTS_DIR)
  .filter(f => f.endsWith('.png'))
  .sort();

console.log(`Found ${screenshots.length} screenshots to analyze`);
console.log(`Running ${PARALLEL_JOBS} parallel jobs...\n`);

// Prompt for VLM to extract button coordinates
const analysisPrompt = `Analyze this UI screenshot and identify ALL clickable buttons, links, and interactive elements.

For each element found, provide:
1. The button/link text (what's written on it)
2. The approximate center coordinates (x, y) relative to the image dimensions
3. The element type (button, link, icon, input, etc.)

IMPORTANT: 
- Return ONLY a valid JSON array, no other text
- Coordinates should be percentages (0-100) of image width/height
- Include sidebar menu items, top bar buttons, action buttons, filter buttons, etc.

Example format:
[
  {"text": "Добавить", "x": 85, "y": 12, "type": "button"},
  {"text": "Склад", "x": 15, "y": 25, "type": "sidebar"},
  {"text": "Поиск", "x": 45, "y": 15, "type": "input"}
]

If no buttons found, return: []`;

async function analyzeImage(imagePath) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const outputFile = imagePath.replace('.png', '.analysis.json');
    
    try {
      // Use z-ai vision CLI
      const result = execSync(
        `z-ai vision -p "${analysisPrompt.replace(/"/g, '\\"')}" -i "${imagePath}" -o "${outputFile}" --thinking`,
        { encoding: 'utf8', timeout: 120000, maxBuffer: 50 * 1024 * 1024 }
      );
      
      // Parse the result
      let analysis = [];
      try {
        const content = fs.readFileSync(outputFile, 'utf8');
        const parsed = JSON.parse(content);
        if (parsed.choices && parsed.choices[0]?.message?.content) {
          // Extract JSON array from the content
          const content_text = parsed.choices[0].message.content;
          const jsonMatch = content_text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (parseErr) {
        console.warn(`Parse error for ${path.basename(imagePath)}: ${parseErr.message}`);
      }
      
      // Clean up temp file
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
      
      resolve({
        screenshot: path.basename(imagePath),
        buttons: analysis,
        duration: Date.now() - startTime
      });
    } catch (err) {
      reject({ screenshot: path.basename(imagePath), error: err.message });
    }
  });
}

// Process in batches
async function processBatch(batch) {
  return Promise.all(batch.map(analyzeImage));
}

async function main() {
  const results = {};
  const errors = [];
  let processed = 0;
  
  // Process in batches of PARALLEL_JOBS
  for (let i = 0; i < screenshots.length; i += PARALLEL_JOBS) {
    const batch = screenshots.slice(i, i + PARALLEL_JOBS);
    const batchPaths = batch.map(f => path.join(SCREENSHOTS_DIR, f));
    
    console.log(`Processing batch ${Math.floor(i / PARALLEL_JOBS) + 1}/${Math.ceil(screenshots.length / PARALLEL_JOBS)} (${batch.length} images)...`);
    
    const batchPromises = batchPaths.map(p => 
      analyzeImage(p).catch(err => {
        errors.push(err);
        return null;
      })
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    for (const result of batchResults) {
      if (result && !result.error) {
        results[result.screenshot] = result.buttons;
        processed++;
        console.log(`  ✓ ${result.screenshot}: ${result.buttons.length} buttons found (${result.duration}ms)`);
      }
    }
  }
  
  // Save results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Analyzed ${processed}/${screenshots.length} screenshots`);
  console.log(`📁 Results saved to: ${OUTPUT_FILE}`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️ Errors (${errors.length}):`);
    errors.forEach(e => console.log(`  - ${e.screenshot}: ${e.error}`));
  }
  
  // Print summary
  console.log('\n📊 Button count per screenshot:');
  for (const [shot, buttons] of Object.entries(results)) {
    console.log(`  ${shot}: ${buttons.length} buttons`);
    if (buttons.length > 0 && buttons.length <= 10) {
      buttons.forEach(b => console.log(`    - "${b.text}" at (${b.x}%, ${b.y}%)`));
    }
  }
}

main().catch(console.error);
