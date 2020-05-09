import Transformers from '../utils/transformers';

test('english text transform', () => {
  const pairs = [
    {
      input: 'Hey, That\'s No Way To Say Goodbye   ',
      expected: 'Hey, That\'s No Way to Say Goodbye',
    },
    {
      input: 'Star Dancer',
      expected: 'Star Dancer',
    },
    {
      input: 'star dancer',
      expected: 'Star Dancer',
    },
    {
      input: 'i am the Walrus',
      expected: 'I Am the Walrus',
    },
    {
      input: 'you can leave your hat on',
      expected: 'You Can Leave Your Hat On',
    },
    {
      input: 'when You Walked into my life',
      expected: 'When You Walked Into My Life',
    },
    {
      input: 'The Man Who Sold The World',
      expected: 'The Man Who Sold the World',
    },
    {
      input: 'Rattle And Hum',
      expected: 'Rattle and Hum',
    },
    {
      input: 'Otis! the definitive Otis Redding',
      expected: 'Otis! The Definitive Otis Redding',
    },
    {
      input: 'The Boy With the X-ray Eyes',
      expected: 'The Boy With the X-Ray Eyes',
    },
    {
      input: 'r.e.m.',
      expected: 'R.E.M.',
    },
  ];

  pairs.forEach((pair) => {
    expect(Transformers.textTransformer(pair.input).toBe(pair.expected));
  });
});
