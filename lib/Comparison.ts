import { type, TypeEnum } from '@wonderlandlabs/walrus'

export type ComparisonProps = {
   feature: string;
   description: string;
   value: number;
   b: string;
   a: string;
   winner: string
}

export default class Comparison {
  public feature: string;
  public description: string;
  public value: number;
  public b: string;
  public a: string;
  public winner: string
  public old: boolean = false;

  constructor(data: ComparisonProps, public aName: string, public bName: string) {
    if (type.describe(data, true) !== TypeEnum.object) {
      throw new Error('bad input to Choice');
    }
    const { feature, a, b, winner, description, value } = data;
    this.feature = feature;
    this.a = a;
    this.b = b;
    this.description = description;
    this.value = Number(value);
    this.winner = `${winner}`.toLowerCase().trim();
  }

 get isValid() {
    return this.a && this.b && this.feature && type.describe(this.value, true) === TypeEnum.number
  }

  get draw(){
    return !this.winner || typeof this.winner !== 'string' || /draw/i.test(this.winner)
  }

  get aWon() {
    if (this.draw) return false;
    return /a/i.test(this.winner);
  }

  get bWon() {
    if (this.draw) return false;
    return /b/i.test(this.winner);
  }

  get winnerName() {
    if (this.draw) return 'Draw';
    if (this.aWon) return this.aName;
    return this.bName;
  }

  getComp(side: string) {
    if (side === 'a') {
      return this.a;
    }
    if (side === 'b') {
      return this.b;
    }
    return '';
  }

  getWon(side: string) {
    if (side === 'a') {
      return this.aWon;
    }
    if (side === 'b') {
      return this.bWon;
    }
    return false;
  }
}
