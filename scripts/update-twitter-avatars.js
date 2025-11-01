import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchTwitterAvatar(handle) {
  try {
    const cleanHandle = handle.replace('@', '');
    const url = `${supabaseUrl}/functions/v1/fetch-twitter-avatar?handle=${cleanHandle}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });

    const data = await response.json();

    if (data.success && data.avatar_url) {
      return data.avatar_url;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching avatar for ${handle}:`, error.message);
    return null;
  }
}

async function updateAvatars() {
  console.log('🔄 Starting to update Twitter avatars...\n');

  // Get all KOL profiles with Twitter handles
  const { data: profiles, error } = await supabase
    .from('kol_profiles')
    .select('id, wallet_address, name, twitter_handle, avatar_url')
    .not('twitter_handle', 'is', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log(`📊 Found ${profiles.length} profiles to update\n`);

  let updated = 0;
  let failed = 0;

  for (const profile of profiles) {
    console.log(`Processing: ${profile.name} (@${profile.twitter_handle})`);

    const avatarUrl = await fetchTwitterAvatar(profile.twitter_handle);

    if (avatarUrl) {
      const { error: updateError } = await supabase
        .from('kol_profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`  ❌ Failed to update: ${updateError.message}`);
        failed++;
      } else {
        console.log(`  ✅ Updated avatar: ${avatarUrl}`);
        updated++;
      }
    } else {
      console.log(`  ⚠️  Could not fetch avatar`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successfully updated: ${updated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total processed: ${profiles.length}`);
  console.log('='.repeat(50));
}

updateAvatars();
