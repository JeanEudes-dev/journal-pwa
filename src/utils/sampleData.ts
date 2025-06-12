// Sample data seeder for testing
import { db } from '../services/database';
import type { JournalEntry } from '../types';

export async function seedSampleData(): Promise<void> {
  const sampleEntries: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>[] = [
    {
      title: 'First Day of the Journey',
      content: `# Welcome to My Journal

This is my first entry in this digital journal. I'm excited to start this journey of **self-reflection** and **personal growth**.

## Goals for this year:
- Write consistently
- Practice mindfulness
- Learn new technologies
- Travel to at least 3 new countries

> "The journey of a thousand miles begins with one step." - Lao Tzu

I feel optimistic about what lies ahead. Let's see where this takes me!`,
      tags: ['personal', 'goals', 'motivation', 'beginning'],
      category: 'Life',
      isDraft: false,
      isFavorite: true,
      mood: 'excited',
      weather: 'Sunny',
      location: 'Home',
    },
    {
      title: 'Learning React and TypeScript',
      content: `Today I spent the entire day diving deep into React and TypeScript. It's fascinating how these technologies work together to create robust applications.

## Key concepts I learned:
1. **Type safety** - TypeScript helps catch errors at compile time
2. **Component composition** - Building UIs with reusable components
3. **Hooks** - Managing state and side effects in functional components
4. **Context API** - Global state management

The PWA I'm building is coming along nicely. I love how IndexedDB allows for offline functionality.

\`\`\`typescript
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
}
\`\`\`

Tomorrow I'll work on implementing the search functionality.`,
      tags: ['programming', 'react', 'typescript', 'learning', 'pwa'],
      category: 'Technology',
      isDraft: false,
      isFavorite: false,
      mood: 'neutral',
      weather: 'Cloudy',
      location: 'Coffee Shop',
    },
    {
      title: 'Weekend Hiking Adventure',
      content: `What an amazing weekend! Went hiking with friends to the nearby mountains. The weather was perfect - clear skies and a gentle breeze.

## Trail Details:
- **Distance**: 8.5 miles
- **Elevation gain**: 2,100 feet
- **Duration**: 4 hours
- **Difficulty**: Moderate

The view from the summit was breathtaking. We could see the entire valley spread out below us. There's something magical about being in nature that just puts everything into perspective.

Met some fellow hikers on the trail who shared stories about their adventures. One couple had been hiking across the country for the past 6 months! Their enthusiasm was infectious.

### Photo memories:
- Sunrise from the summit
- Wildflowers along the trail
- Group photo at the peak
- Wildlife spotted: hawks, squirrels, deer

Already planning our next hiking trip. Thinking about tackling that 14er we've been talking about for months.`,
      tags: ['hiking', 'nature', 'friends', 'adventure', 'exercise'],
      category: 'Adventure',
      isDraft: false,
      isFavorite: true,
      mood: 'happy',
      weather: 'Clear',
      location: 'Mountain Trail',
    },
    {
      title: 'Reflection on Work-Life Balance',
      content: `Been thinking a lot lately about work-life balance. With remote work becoming the norm, the lines between personal and professional life have become increasingly blurred.

## Current challenges:
- Working longer hours than intended
- Difficulty disconnecting after work
- Less physical separation between work and home
- Constant availability expectations

## Strategies to improve:
1. **Set clear boundaries** - Define work hours and stick to them
2. **Create a dedicated workspace** - Physical separation helps mental separation
3. **Establish transition rituals** - Something to mark the end of the workday
4. **Practice saying no** - Not every request requires immediate attention
5. **Schedule personal time** - Treat it as important as work meetings

I've started turning off work notifications after 6 PM and it's already making a difference. Small changes can have big impacts.

Need to remember that productivity isn't about working more hours - it's about working smarter and being intentional with time.`,
      tags: ['work', 'balance', 'productivity', 'remote-work', 'boundaries'],
      category: 'Work',
      isDraft: false,
      isFavorite: false,
      mood: 'neutral',
      weather: 'Rainy',
      location: 'Home Office',
    },
    {
      title: 'Book Review: Atomic Habits',
      content: `Just finished reading "Atomic Habits" by James Clear. This book has completely changed how I think about building good habits and breaking bad ones.

## Key takeaways:

### The Power of Small Changes
The most powerful concept is that tiny changes, when compounded over time, lead to remarkable results. It's not about making huge changes, but about being 1% better every day.

### The Four Laws of Behavior Change:
1. **Make it obvious** - Design your environment to make good habits visible
2. **Make it attractive** - Use temptation bundling and join cultures where your desired behavior is normal
3. **Make it easy** - Reduce friction for good habits, increase friction for bad habits
4. **Make it satisfying** - Use immediate rewards and track your progress

### Habit Stacking
This technique involves linking a new habit to an existing one. For example: "After I pour my morning coffee, I will write in my journal for 5 minutes."

## My implementation plan:
- **Morning routine**: Wake up → Make bed → Journal for 10 minutes
- **Exercise**: After lunch → 20-minute walk
- **Learning**: After dinner → 30 minutes of reading
- **Wind down**: Before bed → 10 minutes of meditation

The book emphasizes that you don't rise to the level of your goals, you fall to the level of your systems. Time to build better systems!

**Rating: 5/5 stars** ⭐⭐⭐⭐⭐`,
      tags: ['books', 'habits', 'self-improvement', 'productivity', 'review'],
      category: 'Learning',
      isDraft: false,
      isFavorite: true,
      mood: 'grateful',
      weather: 'Partly Cloudy',
      location: 'Reading Nook',
    },
    {
      title: 'Draft: Ideas for the Future',
      content: `This is a draft entry with some rough ideas I want to develop later.

Some random thoughts:
- Maybe start a blog about my coding journey
- Learn a new language (thinking Spanish or Japanese)
- Plan a solo travel adventure
- Get into photography more seriously

This needs more development...`,
      tags: ['ideas', 'future', 'planning'],
      category: 'Planning',
      isDraft: true,
      isFavorite: false,
      mood: 'neutral',
      weather: 'Unknown',
      location: 'Unknown',
    },
  ];

  try {
    for (const entryData of sampleEntries) {
      const entry: Omit<JournalEntry, 'id'> = {
        ...entryData,
        wordCount: entryData.content.split(/\s+/).length,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        updatedAt: new Date(),
      };

      await db.createEntry(entry);
    }

    console.log('Sample data seeded successfully!');
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}

// Helper function to check if sample data already exists
export async function hasSampleData(): Promise<boolean> {
  try {
    const entries = await db.getAllEntries();
    return entries.length > 0;
  } catch (error) {
    console.error('Error checking for sample data:', error);
    return false;
  }
}

// Function to seed data only if none exists
export async function seedSampleDataIfEmpty(): Promise<void> {
  const hasData = await hasSampleData();
  if (!hasData) {
    await seedSampleData();
  }
}
