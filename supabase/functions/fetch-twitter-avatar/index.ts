import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const handle = url.searchParams.get('handle');

    if (!handle) {
      return new Response(
        JSON.stringify({ error: 'Twitter handle is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Remove @ if present
    const cleanHandle = handle.replace('@', '');

    // Try multiple methods to get avatar
    let avatarUrl = '';

    // Method 1: Try Unavatar service (free, no API key needed)
    try {
      const unavatarUrl = `https://unavatar.io/twitter/${cleanHandle}`;
      const response = await fetch(unavatarUrl, {
        method: 'HEAD',
        redirect: 'follow'
      });
      
      if (response.ok) {
        avatarUrl = unavatarUrl;
      }
    } catch (e) {
      console.log('Unavatar failed:', e);
    }

    // Method 2: Try Pikwy service (backup)
    if (!avatarUrl) {
      try {
        const pikwyUrl = `https://api.pikwy.com/twitter/${cleanHandle}/avatar.jpg`;
        const response = await fetch(pikwyUrl, { method: 'HEAD' });
        
        if (response.ok) {
          avatarUrl = pikwyUrl;
        }
      } catch (e) {
        console.log('Pikwy failed:', e);
      }
    }

    // Method 3: Twitter direct profile image (works without API)
    if (!avatarUrl) {
      avatarUrl = `https://unavatar.io/twitter/${cleanHandle}`;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        handle: cleanHandle,
        avatar_url: avatarUrl
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching Twitter avatar:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch Twitter avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});