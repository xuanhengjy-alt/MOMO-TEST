console.log('📝 Updating project introductions (intro/intro_en) to full content...');

const { Pool } = require('pg');

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Full introductions (English) compiled from documents
const intros = {
  personality_charm_1min: `Do you want to know how attractive you are in others' eyes? Unlock the unique charm code hidden in your personality in just 1 minute. No complicated calculations, no long answers—just a few simple branching questions to accurately capture the shining points in your personality. Is it your approachability from being sincere to others, or your charisma from being calm and confident? Is it your tenderness from being delicate and empathetic, or your courage to think and act boldly? Whether you think you're ordinary or are curious how others see you, this test helps you see the strengths and potential of your personality charm clearly. Try it and unlock your exclusive charm score—you might even discover charming traits you didn't notice in yourself!`,
  loneliness_1min: `You’re always smiling in a crowd, but suddenly feel an empty void in your heart? You scroll through your contacts late at night, only to find no one you can share your thoughts with anytime? Stop quietly wondering, “Am I too lonely?” — This casual quiz can help you see your inner loneliness index in just 1 minute! No complicated answers needed. A few lighthearted questions can quietly “read” your emotions: Is it just occasional loneliness acting up, or is there unknown sadness hidden deep inside you? Whether you want a fun way to pass the time or are curious about your emotional state, give it a try—you might find that your loneliness isn’t as intense as you thought!`,
  violence_index: `Have you ever quietly clenched your fists when someone cut in line or misunderstood you? Or felt an urge to “straighten things out” when seeing a messy situation? Don’t panic—this isn’t real “violence,” just an emotional reaction hidden in your personality. Take this fun branching quiz: a few daily scenario questions will easily tell you how many stars your “violence index” has. Are you a gentle 1‑star little sheep, or an occasionally grumpy 3‑star little hedgehog? Whatever the result, it helps you understand your emotional triggers. Try it and see what your hidden “emotional quirks” are like!`,
  creativity_test: `People often say “creativity is inborn,” but do you truly understand the creativity hidden in your daily life? Perhaps you’ve had wonderful ideas while doodling casually, or solved small troubles with unique methods—these are sparks of creativity. Try this engaging creativity quiz: 10 easy questions from dealing with small accidents to playful associations will explore your creative potential from multiple angles. Whether you think you’re “not creative” or are curious about your creativity score, you might discover many undiscovered ideas after the test. Click to start and see how many points your creativity can get!`,
  anxiety_depression_test: `Have you been feeling down lately, lacking motivation for what you used to enjoy? Or often tense, restless, even panicky? If these emotions keep recurring and make you wonder whether anxiety or depression is affecting you, use this test to sort out your current state. It focuses on real-life daily feelings across mood, interests, and physical reactions. While not a professional diagnosis, it helps you intuitively see the “severity” of your emotions—temporary fluctuations or signals requiring more attention. If you still feel uneasy after the test, remember to seek help from family, friends, or professional mental health practitioners in a timely manner. Your feelings deserve to be valued.`,
  social_anxiety_test: `Do you quietly get nervous at gatherings, or feel ill‑at‑ease with strangers? Heart racing before speaking to a teacher or boss? Many people have similar social‑emotional concerns. This social anxiety scale helps you organize these feelings. From informal gatherings to communicating with authority figures, it covers common social scenarios. Just answer based on your feelings—no complicated processes; it only takes a few minutes. It doesn’t label you; it provides a direct view of your social‑emotional tendencies—occasional nervousness or anxiety signals that require attention. Want to understand your social emotions better? Try this scale and begin deeper self‑awareness.`
};

(async function main(){
  const client = await pool.connect();
  try {
    console.log('✅ Connected');
    for (const [projectId, text] of Object.entries(intros)) {
      await client.query(
        `UPDATE test_projects SET intro = $2, intro_en = $2, updated_at = NOW() WHERE project_id = $1`,
        [projectId, text]
      );
      console.log(`✅ Updated intro for ${projectId}`);
    }
    console.log('🎉 All introductions updated.');
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
})();


