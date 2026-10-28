export class ShuffledDeck<T> {
  readonly #items: readonly T[];
  #remaining: T[] = [];
  #lastDrawn: T | undefined;

  constructor(items: readonly T[]) {
    this.#items = items;
  }

  draw(): T | undefined {
    if (this.#remaining.length === 0) {
      this.#remaining = this.#shuffleWithoutLastDrawnFirst();
    }
    this.#lastDrawn = this.#remaining.shift();
    return this.#lastDrawn;
  }

  #shuffleWithoutLastDrawnFirst(): T[] {
    const shuffled = shuffle(this.#items);
    if (shuffled.length > 1 && shuffled[0] === this.#lastDrawn) {
      const swapIndex = 1 + randomIndex(shuffled.length - 1);
      [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]];
    }
    return shuffled;
  }
}

function shuffle<T>(items: readonly T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = randomIndex(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}
