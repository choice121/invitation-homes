import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

async function downloadAllIcons() {
  await fs.mkdir('./public/icons', { recursive: true });

  console.log('1. Downloading Logo.svg...');
  const logoRes = await fetch('https://www.invitationhomes.com/Logo.svg', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const logoSvg = await logoRes.text();
  await fs.writeFile('./public/Logo.svg', logoSvg);
  await fs.writeFile('./public/icons/logo.svg', logoSvg);
  console.log('✓ Saved ./public/Logo.svg and ./public/icons/logo.svg');

  console.log('2. Fetching live HTML to extract all inline SVGs...');
  const res = await fetch('https://www.invitationhomes.com/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Extract Social Icons
  $('.social-icon').each((i, el) => {
    const link = $(el).closest('a').attr('href') || '';
    const svg = $(el).find('svg').prop('outerHTML') || $(el).html();
    let name = 'social-' + i;
    if (link.includes('facebook')) name = 'facebook';
    else if (link.includes('youtube')) name = 'youtube';
    else if (link.includes('instagram')) name = 'instagram';
    else if (link.includes('linkedin')) name = 'linkedin';
    fs.writeFile(`./public/icons/${name}.svg`, svg);
    console.log(`✓ Saved ./public/icons/${name}.svg`);
  });

  // Extract Equal Housing Logo
  const equalHousing = $('.footer__equal-housing').find('svg').prop('outerHTML') || $('.footer__equal-housing').html();
  if (equalHousing) {
    await fs.writeFile('./public/icons/equal-housing.svg', equalHousing);
    console.log('✓ Saved ./public/icons/equal-housing.svg');
  }

  // Extract Search Icon
  const searchIcon = $('.search-button__icon').find('svg').prop('outerHTML') || $('.search-button__icon').html();
  if (searchIcon) {
    await fs.writeFile('./public/icons/search.svg', searchIcon);
    console.log('✓ Saved ./public/icons/search.svg');
  }

  // Extract Hamburger Toggle
  const toggleIcon = $('.header__toggle').find('svg').prop('outerHTML') || $('.header__toggle').html();
  if (toggleIcon) {
    await fs.writeFile('./public/icons/hamburger.svg', toggleIcon);
    console.log('✓ Saved ./public/icons/hamburger.svg');
  }

  // Extract Avatar Icon
  const avatarIcon = $('.avatar-icon').find('svg').prop('outerHTML') || $('.avatar').find('svg').prop('outerHTML');
  if (avatarIcon) {
    await fs.writeFile('./public/icons/user-avatar.svg', avatarIcon);
    console.log('✓ Saved ./public/icons/user-avatar.svg');
  }

  // Extract Checkmark Icon
  const checkIcon = $('span.icon svg').filter((_, el) => {
    const d = $(el).find('path').attr('d') || '';
    return d.includes('M5.292') || d.includes('M9') || $(el).parent().text().includes('✓');
  }).first().prop('outerHTML');
  if (checkIcon) {
    await fs.writeFile('./public/icons/checkmark.svg', checkIcon);
    console.log('✓ Saved ./public/icons/checkmark.svg');
  }

  // Extract Location Pin Icon
  const pinIcon = $('span.icon svg').filter((_, el) => {
    const d = $(el).find('path').attr('d') || '';
    return d.includes('12C') || d.includes('11.22');
  }).first().prop('outerHTML');
  if (pinIcon) {
    await fs.writeFile('./public/icons/location-pin.svg', pinIcon);
    console.log('✓ Saved ./public/icons/location-pin.svg');
  }

  // List all downloaded files
  const files = await fs.readdir('./public/icons');
  console.log(`\n🎉 Total icons successfully downloaded to ./public/icons: ${files.length}`);
  console.log(files.join(', '));
}

downloadAllIcons().catch(console.error);
