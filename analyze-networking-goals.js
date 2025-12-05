/**
 * Analyze Networking Goals Keywords
 * Run with: node analyze-networking-goals.js
 */

// Beta user networking goals from realBetaUsers.test.js
const networkingGoals = [
  "awkward, don't like going alone",
  "Goals - Expand my network for mutual benefit! Frustrations - Having to pay to play, not actually meeting new people",
  "Continue to meet more people and make meaningful connections that help build resources and relationships for my business, and others.",
  "Ideal Clients, Strategic Alliance Partners, Referral Sources",
  "Meeting new people, creating genuine connections and friends",
  "Looking for new friends. Who knows, maybe this works.",
  "Building my network.",
  "grow my network, help others network better, grow my business",
  "Community connections, Building positive relationships, Helping businesses make connections",
  "introductions to companies building sales teams",
  "Connecting and growing from leaders around me.",
  "Expand my network of local business owners",
  "Connecting with smart people doing interesting things!",
  "Expand network more efficiently",
  "Networking and meeting new people and discovering new potential clients for my consulting business.",
  "I am looking for influential leaders who want to learn about our housing crisis and local homelessness. We have a giant need and very few people making efforts to allocate necessary resources to adequately deal with our growing issue in Grand Rapids",
  "Looking to expand my professional network, both for connection and business growth.",
  "Making more meaningful connections.",
  "Connecting with other area professionals",
  "New friends and contacts",
  "My goal in networking is to build lasting relationships with professionals who help clients protect their financial well-being. At the same time, I enjoy connecting with professionals across all industries who value collaboration and client care. My goal is to be the go-to person for any insurance questions or needs—someone you can trust to provide guidance, education, and personalized solutions that truly protect what matters most.",
  "Connections for clients, Future client connection",
  "I love connecting with people and learning new things, though I can be shy in new spaces. Having a wider professional circle would make networking easier. I care deeply about supporting local businesses and entrepreneurs to strengthen our community."
];

// Stop words to filter out
const stopWords = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'also', 'would', 'could',
  'want', 'like', 'looking', 'make', 'making', 'know', 'knows', 'maybe', 'works',
  'enjoy', 'time', 'things', 'thing', 'way', 'well', 'truly', 'someone'
]);

// Count single words
const wordCounts = {};
// Count meaningful phrases (bigrams)
const phraseCounts = {};

networkingGoals.forEach(goal => {
  if (!goal) return;

  // Normalize text
  const normalized = goal.toLowerCase()
    .replace(/[^a-z\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = normalized.split(' ').filter(w => w.length > 2 && !stopWords.has(w));

  // Count single words
  words.forEach(word => {
    // Normalize variations
    let normalizedWord = word;
    if (word === 'connections' || word === 'connecting' || word === 'connected') normalizedWord = 'connect';
    if (word === 'networks' || word === 'networking') normalizedWord = 'network';
    if (word === 'relationships') normalizedWord = 'relationship';
    if (word === 'businesses') normalizedWord = 'business';
    if (word === 'clients') normalizedWord = 'client';
    if (word === 'professionals') normalizedWord = 'professional';
    if (word === 'leaders') normalizedWord = 'leader';
    if (word === 'friends') normalizedWord = 'friend';
    if (word === 'growing') normalizedWord = 'grow';
    if (word === 'builds' || word === 'building') normalizedWord = 'build';
    if (word === 'expands' || word === 'expanding') normalizedWord = 'expand';
    if (word === 'meets' || word === 'meeting') normalizedWord = 'meet';

    wordCounts[normalizedWord] = (wordCounts[normalizedWord] || 0) + 1;
  });
});

// Also look for specific meaningful phrases
const meaningfulPhrases = [
  'meaningful connections',
  'genuine connections',
  'new people',
  'grow my network',
  'expand my network',
  'build relationships',
  'professional network',
  'business growth',
  'new friends',
  'mutual benefit',
  'local business',
  'sales teams',
  'referral sources',
  'strategic alliance',
  'community connections',
  'client connection'
];

networkingGoals.forEach(goal => {
  if (!goal) return;
  const lowerGoal = goal.toLowerCase();

  meaningfulPhrases.forEach(phrase => {
    if (lowerGoal.includes(phrase)) {
      phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
    }
  });
});

// Sort and display results
console.log('========================================');
console.log('TOP 10 KEYWORDS IN NETWORKING GOALS');
console.log(`(from ${networkingGoals.filter(g => g).length} beta users with goals)`);
console.log('========================================\n');

const sortedWords = Object.entries(wordCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

console.log('SINGLE KEYWORDS:\n');
sortedWords.forEach(([word, count], i) => {
  const bar = '█'.repeat(count);
  console.log(`${(i + 1).toString().padStart(2)}. ${word.padEnd(15)} ${count.toString().padStart(2)}x  ${bar}`);
});

console.log('\n========================================');
console.log('MEANINGFUL PHRASES:');
console.log('========================================\n');

const sortedPhrases = Object.entries(phraseCounts)
  .sort((a, b) => b[1] - a[1]);

sortedPhrases.forEach(([phrase, count]) => {
  const bar = '█'.repeat(count);
  console.log(`• ${phrase.padEnd(22)} ${count}x  ${bar}`);
});

console.log('\n========================================');
console.log('THEME ANALYSIS:');
console.log('========================================\n');

// Group into themes
const themes = {
  'Relationship Building': ['connect', 'relationship', 'friend', 'genuine', 'meaningful'],
  'Network Expansion': ['network', 'expand', 'grow', 'build', 'new'],
  'Business/Sales Focus': ['business', 'client', 'sales', 'referral', 'professional'],
  'Community/People': ['people', 'meet', 'community', 'local'],
  'Leadership/Growth': ['leader', 'grow', 'professional', 'learn']
};

Object.entries(themes).forEach(([theme, keywords]) => {
  const themeCount = keywords.reduce((sum, kw) => sum + (wordCounts[kw] || 0), 0);
  console.log(`${theme}: ${themeCount} mentions`);
});

console.log('\n========================================');
console.log('TOP 10 KEYWORDS WITH FULL CONTEXT');
console.log('========================================\n');

// Keywords to find with context
const topKeywords = [
  { keyword: 'connect', variations: ['connect', 'connections', 'connecting', 'connected', 'connection'] },
  { keyword: 'network', variations: ['network', 'networks', 'networking'] },
  { keyword: 'people', variations: ['people'] },
  { keyword: 'business', variations: ['business', 'businesses'] },
  { keyword: 'new', variations: ['new'] },
  { keyword: 'client', variations: ['client', 'clients'] },
  { keyword: 'build', variations: ['build', 'building', 'builds'] },
  { keyword: 'professional', variations: ['professional', 'professionals', 'professionally'] },
  { keyword: 'grow', variations: ['grow', 'growing', 'growth'] },
  { keyword: 'meaningful', variations: ['meaningful', 'genuine'] }
];

topKeywords.forEach(({ keyword, variations }, index) => {
  console.log(`\n${index + 1}. "${keyword.toUpperCase()}" - Sentences containing this keyword:\n`);

  const matchingSentences = [];
  networkingGoals.forEach(goal => {
    if (!goal) return;
    const lowerGoal = goal.toLowerCase();

    if (variations.some(v => lowerGoal.includes(v))) {
      matchingSentences.push(goal);
    }
  });

  if (matchingSentences.length === 0) {
    console.log('   (no matches)');
  } else {
    matchingSentences.forEach((sentence, i) => {
      // Truncate very long ones
      const display = sentence.length > 150 ? sentence.substring(0, 150) + '...' : sentence;
      console.log(`   ${i + 1}. "${display}"`);
    });
  }
  console.log(`   --- ${matchingSentences.length} total mentions ---`);
});

console.log('\n========================================');
console.log('SUMMARY');
console.log('========================================\n');

console.log(`Total users with networking goals: ${networkingGoals.filter(g => g).length}`);
