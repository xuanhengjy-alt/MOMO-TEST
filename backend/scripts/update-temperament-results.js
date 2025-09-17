process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 temperament_type_test 的 result_types 英文字段...');

    const PROJECT = 'temperament_type_test';

    const items = [
      {
        code: 'CHOLERIC',
        name: 'Choleric Temperament',
        desc: 'Choleric Temperament',
        analysis: `# Choleric Temperament

## Neural Characteristics:

Low receptivity; high tolerance; strong involuntary responsiveness; plasticity; high emotional excitability; fast and flexible reaction speed.

## Psychological Characteristics:

Energetic and active, proficient in socializing; quick in thinking; easy to accept new things; emotions and feelings tend to emerge easily, as well as change and fade quickly, while also being prone to outward expression; emotional experiences are not profound.

## Typical Manifestations:

Also known as the "lively type," individuals with choleric temperament are agile, active, and skilled at socializing, and they do not feel constrained in new environments. In work and study, they are energetic and efficient, demonstrating sharp work capabilities and a strong ability to adapt to environmental changes. Within a group, they are cheerful and vibrant, willing to engage in practical undertakings, and hold a longing for career aspirations. They can quickly grasp new things, and when equipped with sufficient self-control and a sense of discipline, they will exhibit great enthusiasm. Their interests are broad, yet their emotions are changeable—if they encounter setbacks in their career, their passion may diminish just as rapidly as they once dedicated themselves to it. They often achieve outstanding results when undertaking diverse types of work.

## Suitable Occupations:

Tour guide, salesperson, program host, speaker, foreign affairs receptionist, actor/actress, market researcher, supervisor, etc.`
      },
      {
        code: 'SANGUINE',
        name: 'Sanguine Temperament',
        desc: 'Sanguine Temperament',
        analysis: `# Sanguine Temperament

## Neural Characteristics:

Low receptivity; high tolerance; strong involuntary responsiveness; obvious extroversion; high emotional excitability; weak control; fast but inflexible reaction speed.

## Psychological Characteristics:

Frank and enthusiastic; energetic and prone to impulsivity; short-tempered; quick in thinking but low in accuracy; emotions are outwardly expressed but short-lived.

## Typical Manifestations:

Also known as the "unrestrainable type" or "combat type," sanguine temperament is characterized by a strong excitement process and a relatively weak depression process. Individuals with this temperament are easily emotionally aroused, respond quickly, act swiftly, and are fiery and forceful. They show intense and rapid emotional expressions in language, facial expressions, and gestures. They have an unstoppable and persistent drive to overcome difficulties but are not good at careful consideration. They are impulsive, and their emotions tend to erupt uncontrollably. Their work style exhibits obvious periodicity: they will immerse themselves in their career and be ready to overcome numerous difficulties and obstacles on the way to their goals. However, when their energy is exhausted, they tend to lose confidence easily.

## Suitable Occupations:

Management work, diplomatic work, driver, garment and textile industry, catering and service industry, doctor, lawyer, athlete, adventurer, journalist, actor/actress, soldier, public security officer, etc.`
      },
      {
        code: 'PHLEGMATIC',
        name: 'Phlegmatic Temperament',
        desc: 'Phlegmatic Temperament',
        analysis: `# Phlegmatic Temperament

## Neural Characteristics:

Low receptivity; high tolerance; low involuntary responsiveness; minimal external expressions; emotional stability; fast but inflexible reaction speed.

## Psychological Characteristics:

Steady and prudent, with a comprehensive approach to problem-solving; quiet and reserved, good at restraining oneself; capable of endurance; emotions not easily expressed outwardly; attention stable and not easily diverted; few and slow external movements.

## Typical Manifestations:

Also known as the "calm type," individuals with this temperament are steadfast, reliable, and hardworking in life. Endowed with a strong inhibitory process that balances their excitatory process, they act slowly and calmly, strictly adhering to established daily routines and work systems, and are not distracted by unnecessary temptations. People with phlegmatic temperament have a composed attitude, maintain moderate social interactions, and avoid empty or frivolous conversations. They are not easily emotionally aroused, rarely lose their temper, and do not readily show their emotions; they are self-disciplined and often do not flaunt their abilities. Such individuals can persist in their work for a long time and carry it out in an orderly manner. Their shortcomings lie in being less flexible and not good at shifting their attention. Inertia makes them conservative and rigid—they excel in consistency but lack adaptability. They possess the virtues of calmness and conscientiousness, and their personalities exhibit consistency and certainty.

## Suitable Occupations:

Surgeon, judge, administrator, cashier, accountant, broadcaster, switchboard operator, mediator, teacher, human resources manager, etc.`
      },
      {
        code: 'MELANCHOLIC',
        name: 'Melancholic Temperament',
        desc: 'Melancholic Temperament',
        analysis: `# Melancholic Temperament

## Neural Characteristics:

High receptivity; low tolerance; low voluntary responsiveness; high emotional excitability; slow reaction speed, and rigid stubbornness.

## Psychological Characteristics:

Calm and composed; perceives and experiences problems deeply and lastingly; emotions are not easily revealed; reactions are slow but profound; high accuracy.

## Typical Manifestations:

Individuals with this temperament have strong receptive abilities and are prone to emotional reactions. They have fewer ways of experiencing emotions, but their emotional experiences are long-lasting and intense. They can observe details that others hardly notice, are sensitive to changes in the external environment, and have profound inner experiences. Their external behaviors are very slow, awkward, timid, suspicious, withdrawn, indecisive, and they are prone to fear.

## Suitable Occupations:

Proofreader, typist, typesetter, inspector, carving worker, embroidery worker, storekeeper, confidential secretary, art worker, philosopher, scientist.`
      }
    ];

    for (const it of items) {
      await query(
        `UPDATE result_types SET type_name_en=$1, description_en=$2, analysis_en=$3
         WHERE project_id=(SELECT id FROM test_projects WHERE project_id=$4) AND type_code=$5`,
        [it.name, it.desc, it.analysis, PROJECT, it.code]
      );
    }

    console.log('✅ 已更新 result_types 英文字段');

    const verify = await query(
      `SELECT type_code, type_name_en, LEFT(description_en,100) AS desc_preview FROM result_types WHERE project_id=(SELECT id FROM test_projects WHERE project_id=$1) ORDER BY type_code`,
      [PROJECT]
    );
    console.log('\n📋 验证预览:');
    for (const row of verify.rows) {
      console.log(`${row.type_code}: ${row.type_name_en} | ${row.desc_preview}...`);
    }

    console.log('\n🎉 更新完成');
    process.exit(0);
  } catch (e) {
    console.error('❌ 更新失败:', e);
    process.exit(1);
  }
})();
