function calculateQuantitativeScore(profileData) {
    const score = {
      audience: 0,      // Max 15%
      engagement: 0,    // Max 15%
      regularity: 0,    // Max 10%
      total: 0          // Max 40%
    };
  
    const maxFollowersBenchmark = 1000000;
    const followerScore = Math.min(profileData.followers / maxFollowersBenchmark, 1) * 15;
    score.audience = followerScore;
  
    const posts = profileData.recent_posts || [];
    if (posts.length > 0 && profileData.followers > 0) {
      const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
      const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
      const avgEngagementPerPost = (totalLikes + totalComments) / posts.length;
      const engagementRate = (avgEngagementPerPost / profileData.followers) * 100;
      const normalizedEngagement = Math.min(engagementRate / 5, 1) * 15;
      score.engagement = normalizedEngagement;
    }
  
    if (posts.length >= 2) {
      const timestamps = posts.map(post => post.timestamp).sort();
      const timeDiffs = [];
      for (let i = 1; i < timestamps.length; i++) {
        timeDiffs.push((timestamps[i] - timestamps[i - 1]) / 86400);
      }
      const avgPostInterval = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      const idealInterval = 2.33;
      const regularityScore = Math.min(idealInterval / avgPostInterval, 1) * 10;
      score.regularity = regularityScore;
    }
  
    score.total = score.audience + score.engagement + score.regularity;
    return score;
  }
  
  module.exports = { calculateQuantitativeScore };
  