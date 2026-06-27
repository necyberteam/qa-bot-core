import { getProcessedText } from './getProcessedText';

describe('getProcessedText', () => {
  // The first pass exists to rescue UKY RAG output that wrapped bare URLs in
  // square brackets without parens (`[https://x]`), which markdown won't link.
  it('rescues a bracket-wrapped bare URL into a markdown link', () => {
    expect(getProcessedText('Visit [https://arc.ucar.edu/] for details.')).toBe(
      'Visit [https://arc.ucar.edu/](https://arc.ucar.edu/) for details.'
    );
  });

  // Regression: the agent emits proper markdown links, sometimes with the URL
  // as its own label (`[url](url)`). The first-pass regex used to also match
  // the `[url]` portion of that complete link and duplicate it.
  it('does not mangle an already-complete [url](url) link', () => {
    const input = 'See [https://arc.ucar.edu/](https://arc.ucar.edu/).';
    expect(getProcessedText(input)).toBe(input);
  });

  it('leaves human-labeled markdown links untouched', () => {
    const input = 'See [NCSA Delta Docs](https://docs.ncsa.illinois.edu/delta).';
    expect(getProcessedText(input)).toBe(input);
  });

  it('linkifies a bare URL in prose', () => {
    expect(getProcessedText('Visit https://arc.ucar.edu/ for details.')).toBe(
      'Visit [https://arc.ucar.edu/](https://arc.ucar.edu/) for details.'
    );
  });

  it('strips trailing sentence punctuation from a linkified bare URL', () => {
    expect(getProcessedText('See https://arc.ucar.edu/.')).toBe(
      'See [https://arc.ucar.edu/](https://arc.ucar.edu/).'
    );
  });

  it('returns non-string input unchanged', () => {
    expect(getProcessedText('')).toBe('');
  });
});
