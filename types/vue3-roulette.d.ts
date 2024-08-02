declare module 'vue3-roulette' {
  import type { ComponentOptions } from 'vue';

  interface RouletteProps {
    // Define props here
    displayShadow?: boolean;
    displayIndicator?: boolean;
    counterClockwise?: boolean;
    duration?: number;
    easing?: string;
    items: unknown[];
    size: number;
    resultVariation: number;
  }

  interface RouletteMethods {
    launchWheel(): void;
    reset(): void;
  }

  export const Roulette: ComponentOptions<
    RouletteProps,
    object,
    RouletteMethods
  >;

  export default Roulette;
}
