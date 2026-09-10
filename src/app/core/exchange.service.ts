import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExchangeService {
  readonly rate = signal<number | null>(null);
  readonly updatedAt = signal<Date | null>(null);

  async load(): Promise<void> {
    for (const url of ['https://open.er-api.com/v6/latest/EUR', 'https://api.exchangerate-api.com/v4/latest/EUR']) {
      try {
        const data = await (await fetch(url)).json();
        if (data?.rates?.JPY) { this.rate.set(data.rates.JPY); this.updatedAt.set(new Date()); return; }
      } catch { /* essaie l'URL suivante */ }
    }
    if (this.rate() == null) this.rate.set(162.5);
  }

  jpyToEur(amount: number): number | null {
    const r = this.rate();
    return r ? amount / r : null;
  }
}
