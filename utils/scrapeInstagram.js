// scrapeInstagram.js

const fetch = require('node-fetch');
const { evaluateQualitativeCriteria } = require('./qualitativeScoring');
const { calculateQuantitativeScore } = require('./quantitativeScoring');

const getUsername = (input) => {
  if (/^@?[a-zA-Z0-9_.]+$/.test(input)) return input.replace('@', '');
  const match = input.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p\/|reel\/|tv\/|@)?([a-zA-Z0-9_.]+)/);
  return match ? match[1] : null;
};

const getInstagramProfileData = async (input) => {
  try {
    const username = getUsername(input);
    if (!username) throw new Error(`Invalid username/URL: ${input}`);

    const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': process.env.USER_AGENT,
        'X-IG-App-ID': process.env.X_IG_APP_ID,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Fetch failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    if (!data.data?.user) throw new Error('User not found or account is private');

    const user = data.data.user;
    const recentPosts = user.edge_owner_to_timeline_media?.edges?.map(post => ({
      id: post.node.id,
      shortcode: post.node.shortcode,
      is_video: post.node.is_video,
      likes: post.node.edge_liked_by?.count || 0,
      comments: post.node.edge_media_to_comment?.count || 0,
      timestamp: post.node.taken_at_timestamp || 0,
      caption: post.node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
      thumbnail: post.node.display_url,
    })) || [];

    return {
      username: user.username,
      full_name: user.full_name,
      bio: user.biography,
      followers: user.edge_followed_by?.count || 0,
      following: user.edge_follow?.count || 0,
      is_private: user.is_private,
      is_verified: user.is_verified,
      profile_pic: user.profile_pic_url_hd,
      posts_count: user.edge_owner_to_timeline_media?.count || 0,
      recent_posts: recentPosts,
    };
  } catch (error) {
    console.error('Error fetching Instagram data:', error.message);
    return null;
  }
};

// Export the function to be used elsewhere
module.exports = { getInstagramProfileData };
