import { describe, expect, it } from 'vitest';
import { parseYouTubeVideoId } from './youtube.js';

describe('parseYouTubeVideoId', () => {
  it.each([
    ['ku1romHwGCM', 'ku1romHwGCM'],
    ['  ku1romHwGCM  ', 'ku1romHwGCM'],
    ['https://youtu.be/ku1romHwGCM', 'ku1romHwGCM'],
    ['https://youtu.be/ku1romHwGCM?si=abc123', 'ku1romHwGCM'],
    ['https://www.youtube.com/watch?v=ku1romHwGCM', 'ku1romHwGCM'],
    ['https://www.youtube.com/watch?v=ku1romHwGCM&t=42s', 'ku1romHwGCM'],
    ['youtube.com/watch?v=ku1romHwGCM', 'ku1romHwGCM'],
    ['https://m.youtube.com/watch?v=ku1romHwGCM', 'ku1romHwGCM'],
    ['https://www.youtube.com/embed/ku1romHwGCM', 'ku1romHwGCM'],
    ['https://www.youtube-nocookie.com/embed/ku1romHwGCM?autoplay=1', 'ku1romHwGCM'],
    ['https://www.youtube.com/shorts/ku1romHwGCM', 'ku1romHwGCM'],
    ['https://www.youtube.com/live/ku1romHwGCM', 'ku1romHwGCM'],
  ])('reconnaît %s', (input, expected) => {
    expect(parseYouTubeVideoId(input)).toBe(expected);
  });

  it.each([
    '',
    'pas une url',
    'https://vimeo.com/123456789',
    'https://example.com/watch?v=ku1romHwGCM',
    'https://www.youtube.com/watch?v=trop-court',
    'https://www.youtube.com/channel/UC1234567890',
    'https://youtu.be/',
  ])('refuse %s', (input) => {
    expect(parseYouTubeVideoId(input)).toBeNull();
  });
});
