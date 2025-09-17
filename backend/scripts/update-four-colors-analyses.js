// Update analysis_en for Four-colors Personality Analysis result_types
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('[Error] DATABASE_URL not set');
    process.exit(1);
  }
  const client = new Client({ connectionString: DATABASE_URL, ssl: DATABASE_URL.includes('amazonaws.com') ? { rejectUnauthorized: false } : undefined });
  await client.connect();
  try {
    const pidRes = await client.query(`SELECT id FROM test_projects WHERE project_id = 'four_colors_en' LIMIT 1`);
    if (!pidRes.rows.length) throw new Error('Project four_colors_en not found');
    const pid = pidRes.rows[0].id;

    const updates = [
      {
        code: 'RED_PERSONALITY',
        analysis: `# Red personality

## [Personality Strengths]:

**As an individual:**

A highly optimistic and positive mindset. Like oneself and also easily accept others. Regard life as an experience worth enjoying. Like novelty, change and excitement. Often happy and pursue happiness. Rich and expressive emotions. Free and unrestrained. Like to joke and tease. Original and distinctive. Strong expressiveness. Easily liked and welcomed by people. Lively and curious.

**Communication Characteristics:**

Quick-witted and articulate. Prefers physical contact to convey affection. Eager to strike up conversations. Direct in expressing feelings during conflicts. Becomes more energetic in larger groups. Skilled in public speaking and stage performances. Enjoys voicing opinions.

**As a friend:**

sincere and proactive, full of enthusiasm. Enjoys making friends and is good at interacting with strangers. Skilled at making people laugh, a source of joy. Forgiving of oneself and others, not holding grudges. Has personal charm. Always ready to help. Admits mistakes promptly and apologizes quickly. Loves receiving affirmation and praise from others.

**Attitude towards work and career:**

Proactive in work, always seeking new tasks. Infectious and able to draw others into participation. Inspires the team's enthusiasm for cooperation and progress, valuing the sense of teamwork. A pleasant workmate. Highly explosive in achieving short-term goals. Trusts others. Skilled at praising and encouraging, a natural motivator. Dislikes excessive regulations and restrictions, creative. Approaches work in a lively and enriching way. Quick to react, starts like lightning.

## Excessive Personality Traits】:

**As an individual:**

Emotions fluctuate greatly. Unpredictable and impulsive, they tend to trust others easily and are prone to being deceived. They have a strong sense of vanity, are unwilling to endure hardships, and seek pleasure. They prefer shortcuts, start strong but finish weak, and lack persistence. They are careless and disorganized. They avoid taking responsibility and expect others to be responsible for their lives. They lack self-control and discipline. They easily forgive themselves and do not learn from their mistakes. They are unstable and undisciplined. They refuse to grow up. They use indulgence to numb their pain and troubles instead of seriously contemplating the essence of life.

**Communication style:**

They speak without much thought, blurting out whatever comes to mind. They make jokes about serious and sensitive matters. They like to show off and take over conversations. They have a short attention span, cannot listen attentively, and interrupt others. They boast without preparation and fail to keep their promises. They forget what others have said and often repeat their own words. They are indiscreet and do not keep secrets. They are unreliable and all talk, no action. They exaggerate their successes.

**As a friend:**

They lack tact, making excessive jokes and showing excessive enthusiasm. They only want to be the center of attention. They talk about topics they are interested in and are absent-minded about those that do not concern them. They interrupt others when they are speaking. They are forgetful and fickle. They often forget old friends. They have a strong sense of dependence, are fragile and unable to be independent. They mean well but often do more harm than good.

**In terms of work and career:**

They frequently change jobs, always looking for greener pastures. They have no plans and are impulsive. They lack focus and spread their energy in too many different directions. They overestimate their abilities. They feel no need to prepare for the future. They are unwilling to put in the extra effort and hard work behind the scenes to achieve greater honors. They have unrealistic expectations that all work should be fun. They have difficulty concentrating and often daydream. They are unpredictable and hard to anticipate.`
      },
      {
        code: 'BLUE_PERSONALITY',
        analysis: `# Blue personality

## [Personality Strengths]:

**As an individual:**

A serious philosophy of life. Deep thinking, independent thinking without blindly following the crowd. Silent and reserved, mature and prudent. Emphasizes commitment, reliable and safe. Cautious and reserved. Adheres to principles, highly responsible. Follows rules, well-organized. Deep and goal-oriented idealism. Sensitive and delicate. High standards, pursues perfection. Modest and stable. Good at analysis, organized. Loyal to friends, self-sacrificing. Thoughtful and deliberate. Tenacious and persistent.

**Communication characteristics:**

Enjoys sensitive and profound communication. Empathizes with others. Can remember the emotions and thoughts that resonated during conversations. Prefers intellectual exchanges in small groups. Pays attention to the details of conversations.

**As a friend:**

Silently shows concern and love by giving. Loyal to friendship. Cares sincerely about friends' situations and is good at being considerate. Can remember special days. When friends encounter difficulties, tries to offer encouragement and comfort. Rarely expresses inner thoughts to others. Often plays the role of solving and analyzing problems.

**Towards work and career:**

Emphasizes systems, procedures, norms, details, and processes. Plans before doing and strictly follows the plan. Likes to explore and act based on facts. Loyal and dedicated, pursues excellence. Highly self-disciplined. Prefers to verify results through management with tables and numbers. Emphasizes commitment. Executes work meticulously.

## 【Excessive Personality Traits】:

**As an individual:**

Highly negative and emotional. Prone to suspicion and distrust of others. Overly concerned about others' opinions and evaluations, easily hurt by negative comments. Tends to be depressed and pessimistic. Struggles to get out of a low mood. Emotionally fragile and prone to depression, with a tendency to self-pity. Worrying unnecessarily and creating trouble for oneself. Most likely to suffer from depression. When others succeed easily, they feel jealous of their own efforts not being as successful. Their overly gloomy expression makes them seem depressing and hard to approach.

**Communication characteristics:**

Unconsciously preachy and prone to overgeneralization. Strong sense of principle, not easy to compromise. Strongly expects others to be sensitive and insightful enough to understand them. Assumes others can read their minds. Not very proactive in communication. Dislikes causing trouble for others and also hates others causing trouble for them. It's difficult for them to interact sincerely and openly with others. They tend to face others in a defensive state.

**As a friend:**

Excessively sensitive, sometimes difficult to get along with. Strong sense of insecurity. Keeps away from crowds. Likes to criticize and nitpick. Not generous in forgiving. Often doubts others' words and finds it hard to trust them. Sets overly high and unrealistic expectations for themselves and others in work and career. Over-plans and over-prepares. Worrying about gains and losses, slow in action. Picky about others' and their own performance. Focuses on small details and loses sight of the big picture. Stingy with praise, strong formalism. Easily discouraged by unsatisfactory results. Stubborn and inflexible, adhering to rules without flexibility. Lacks the spirit of compromise to uphold principles.`
      },
      {
        code: 'YELLOW_PERSONALITY',
        analysis: `# Yellow personality

## [Personality Strengths]:

**As an individual:**

I will never give up until I reach my goal. I constantly set goals to drive myself forward. I view life as a competition. I act quickly and am full of energy. I have a strong will. I am confident, not emotional, and very energetic. I am straightforward, direct, and to the point. I have a strong drive for progress and always think ahead. I am independent. I have a strong desire to win. I am not afraid of power and am willing to take risks. I am not easily discouraged and do not care about others' evaluations. I stick to the path and direction I have chosen. I step forward in times of crisis. I value speed and efficiency. I am willing to accept challenges and eager for success.

**Communication style:**

I lead conversations in a practical way. I like to control the way things are done. I can directly grasp the essence of the problem. I speak concisely and dislike beating around the bush. I am not influenced or controlled by emotions.

**As a friend:**

I offer solutions to problems rather than dwelling on the past. I quickly provide advice and direction. I give suggestions straightforwardly.

**Work and career:**

I act decisively and efficiently. I can handle long-term high-intensity pressure. I have a strong goal orientation and am good at setting goals. I have a broad perspective and a sense of the big picture. I am good at delegating tasks. I persevere and facilitate activities. I focus on key points and execute them. I have a brisk style of doing things. I am a natural leader and have strong organizational skills. The stronger the competition, the more energetic I become, and the more resilient I am in the face of setbacks. I seek practical solutions. I am result-oriented and highly efficient. I am good at making quick decisions and handling all problems I encounter. I am highly responsible.

## 【Excessive Personality Traits】:

**As an individual:**

Always believes they are right and refuses to admit mistakes. Arrogant and domineering. Only cares about their own feelings and shows no consideration for others' emotions and thoughts. Self-centered with a tendency towards selfishness. Overbearing. Has a bad temper and is prone to anger. Lacks empathy. Arrogant and looks down on others. Often keeps their emotions tightly in check. When in a bad mood or under pressure, they can be unreasonable and dictatorial. Dislikes being constrained by group norms and breaks established rules without following them themselves.

**Communication style:**

Loves to argue and create conflicts. Cold-hearted and indifferent to emotions. Crude and straightforward. Lacks sensitivity and the ability to understand others' inner thoughts. Resistant to criticism, harsh and self-righteous. Lacks the ability to share intimacy. Impatient and a very poor listener. Has a sharp and strict attitude with a strong critical streak. Can make others' work or life tense. Unaccustomed to praising others. Sometimes speaks in an aggressive manner. Has a strong desire to control. Lacks the ability to empathize with others and has little tolerance for those with different ways of doing things.

**As a friend:**

Mostly maintains a rational friendship. Dislikes interacting with indecisive and weak people. Tries to control and influence everyone's activities, expecting others to obey rather than cooperate. Rarely talks about topics other than work. Emotionally keeps a certain distance from others. Rarely shows direct and sincere concern for others. Only contacts you when in need. Makes decisions for others.

**Work and career:**

Lives in an endless sea of work rather than among people. Quantity is more important than quality. Gets angry and takes it out on others when goals are not met. Seeks more power and has a strong desire to control. Refuses to relax for themselves or others. Prioritizes work over people. Uncompromising and refuses to admit mistakes for the sake of their own face. Overly concerned with the outcome of competition while ignoring the joy of the process. Arbitrary, stubborn and single-minded. Finds it hard to slow down and is a workaholic lacking the joy of life. Eager to make changes without thorough understanding and wants quick results.`
      },
      {
        code: 'GREEN_PERSONALITY',
        analysis: `# Green personality

## [Personality Strengths]:

**As an individual:**

Prefers tranquility over activity, exuding a gentle and peaceful charm with a serene and pleasant demeanor. Possesses a kind nature and is generous in character. Strives for harmonious interpersonal relationships. Adheres to the principle of moderation, maintaining a stable and low-key presence. Remains composed and unflappable in the face of change. Content with what one has, maintaining a relaxed mindset. Seeks a simple and peaceful life. Has a laid-back attitude and can adapt to all environments and situations. Never loses temper, embodying gentleness, modesty, and peace. Practices the principle of "letting go when you can." Prefers a simple and casual lifestyle. Communicates with a soft approach, achieving victory without conflict. Avoids confrontation and focuses on win-win situations. Calm, composed, and unhurried. Good at accepting others' opinions. An excellent listener with great patience. Skilled at making others feel at ease. Has a natural and effortless sense of humor. Relaxed and magnanimous, never in a hurry.

**As a friend:**

Never aggressive. Full of compassion and concern. Forgives others for their wrongs. Accepts people of all personalities. Kind by nature and tactful in dealing with others. Not strict in friendship. Considers others' needs and is willing to give. Interacting with them is easy and stress-free. A great confidant, encouraging friends to talk about themselves. Never tries to change others.

**In work and career:**

Has an exceptional ability to coordinate interpersonal relationships. Skilled at handling pressure with composure. Expert at resolving conflicts. Stays out of political struggles and has no enemies. Advances steadily to gain thinking space. Emphasizes human-oriented management. Advocates a work environment where all employees actively participate. Respects employees' independence, earning their loyalty and cohesion. Good at considering others. Team-oriented. Creates stability. Handles affairs with a natural and low-key approach.

## 【Excessive Personality Traits】:

**As an individual:**

Acting according to inertia, refusing to change, and turning a deaf ear to external changes. Adopting a lazy attitude and excusing oneself for not striving forward. Being weak and timid, allowing others to take advantage of oneself. Expecting problems to solve themselves and remaining completely passive. Muddling through. Compromising without principles, thus failing to prompt them to take a responsible approach to solving problems. Avoiding issues and conflicts. Caring too much about others' reactions and being afraid to express one's own stance and principles.

**Communication style:**

Like hitting a fist into cotton, with no response. Lacking assertiveness, shifting all pressure and burdens onto others. Unable to say no to others, causing endless trouble for both oneself and others. Slow in action, dragging one's feet. Avoiding taking responsibility.

**As a friend:**

Irresponsible and compromising. Adopting a permissive attitude. Suppressing one's own feelings to accommodate others. Expecting everyone to be satisfied and being disloyal to one's own heart. Lacking self-awareness and losing one's direction in life. Lacking passion. Indifferent and reluctant to participate in any activities.

**Towards work and career:**

Content with the status quo and lacking ambition. Happy to be mediocre and lacking creativity. Afraid to take risks and lacking confidence. Procrastinating. Lacking goals. Lacking self-discipline. Lazy and unambitious. Preferring to be a spectator rather than a participant.`
      }
    ];

    for (const u of updates) {
      const res = await client.query(
        `UPDATE result_types SET analysis_en = $1 WHERE project_id = $2 AND type_code = $3`,
        [u.analysis, pid, u.code]
      );
      console.log(`[OK] ${u.code} analysis updated (${res.rowCount} row(s))`);
    }
    console.log('[Done] Four-colors analyses updated.');
  } catch (e) {
    console.error('[Error] Failed to update four-colors analyses:', e);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();


