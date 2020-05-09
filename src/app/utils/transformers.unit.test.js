import Transformers from './transformers';

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
      input: 'you Can Leave Your Hat on',
      expected: 'You Can Leave Your Hat On',
    },
    {
      input: 'When You Walked into My Life',
      expected: 'When You Walked Into My Life',
    },
    {
      input: 'That was Then, This is Now',
      expected: 'That Was Then, This Is Now',
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
      input: 'Test? the? the?',
      expected: 'Test? The? The?',
    },
    {
      input: 'Test? the? the??',
      expected: 'Test? The? The??',
    },
    {
      input: 'The Boy With the X-ray Eyes',
      expected: 'The Boy With the X-Ray Eyes',
    },
    {
      input: 'THIS IS A TEST',
      expected: 'This Is a Test',
    },
    {
      input: 'this is a test',
      expected: 'This Is a Test',
    },
    {
      input: 'The Go-gos',
      expected: 'The Go-Gos',
    },
    {
      input: 'The Go-gos-and-the-band',
      expected: 'The Go-Gos-and-the-Band',
    },
    {
      input: 'r.e.m.',
      expected: 'R.E.M.',
    },
    {
      input: 'meet the r.e.m.',
      expected: 'Meet the R.E.M.',
    },
  ];

  pairs.forEach((pair) => {
    expect(Transformers.textCapitalizationTransformer(pair.input)).toBe(pair.expected);
  });
});

test('non english text transform', () => {
  const pairs = [
    {
      input: 'Kuulen ääniä maan alta',
      expected: 'Kuulen ääniä maan alta',
    },
    {
      input: 'Le kleenex, le drap de lit et l\'étendard',
      expected: 'Le kleenex, le drap de lit et l\'étendard',
    },
    {
      input: 'Дума про руйнування Сiчi',
      expected: 'Дума про руйнування Сiчi',
    },
    {
      input: 'متحف فنون الغش متحف فنون',
      expected: 'متحف فنون الغش متحف فنون',
    },
  ];

  pairs.forEach((pair) => {
    expect(Transformers.textCapitalizationTransformer(pair.input)).toBe(pair.expected);
  });
});
