export type aggregationMethod =
  | 'weightedHarmonicMean'
  | 'harmonicMean'
  | 'weightedArithmeticMean'
  | 'arithmeticMean'
  | 'weightedGeometricMean'
  | 'geometricMean';

export const aggregate = (
  method: aggregationMethod,
  values: number[],
  weights?: number[],
) => {
  if (weights === undefined) {
    weights = [];
  }

  switch (method) {
    case 'weightedHarmonicMean':
      return weightedHarmonicMean(values, weights);
    case 'harmonicMean':
      return harmonicMean(values);
    case 'weightedArithmeticMean':
      return weightedArithmeticMean(values, weights);
    case 'arithmeticMean':
      return arithmeticMean(values);
    case 'weightedGeometricMean':
      return weightedGeometricMean(values, weights);
    case 'geometricMean':
      return geometricMean(values);
    default:
      return 0;
  }
};

const weightedHarmonicMean = (values: number[], weights: number[]) => {
  if (values.length !== weights.length) {
    return 0;
  }

  let sum = 0;
  let sumWeights = 0;

  for (let i = 0; i < values.length; i++) {
    if (values[i] === 0) {
      continue;
    }
    sum += weights[i] / values[i];
    sumWeights += weights[i];
  }

  if (sum === 0) {
    return 0;
  }

  return sumWeights / sum;
};

const harmonicMean = (values: number[]) => {
  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    if (values[i] === 0) {
      continue;
    }
    sum += 1 / values[i];
  }

  if (sum === 0) {
    return 0;
  }

  return values.length / sum;
};

const weightedArithmeticMean = (values: number[], weights: number[]) => {
  if (values.length !== weights.length) {
    return 0;
  }

  let sum = 0;
  let sumWeights = 0;

  for (let i = 0; i < values.length; i++) {
    sum += weights[i] * values[i];
    sumWeights += weights[i];
  }

  if (sumWeights === 0) {
    return 0;
  }

  return sum / sumWeights;
};

const arithmeticMean = (values: number[]) => {
  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }

  if (values.length === 0) {
    return 0;
  }

  return sum / values.length;
};

const weightedGeometricMean = (values: number[], weights: number[]) => {
  if (values.length !== weights.length) {
    return 0;
  }

  let sum = 0;
  let sumWeights = 0;

  for (let i = 0; i < values.length; i++) {
    if (values[i] === 0) {
      continue;
    }
    sum += weights[i] * Math.log(values[i]);
    sumWeights += weights[i];
  }

  if (sumWeights === 0) {
    return 0;
  }

  return Math.exp(sum / sumWeights);
};

const geometricMean = (values: number[]) => {
  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    if (values[i] === 0) {
      continue;
    }
    sum += Math.log(values[i]);
  }

  if (values.length === 0) {
    return 0;
  }

  return Math.exp(sum / values.length);
};

export {
  weightedHarmonicMean,
  harmonicMean,
  weightedArithmeticMean,
  arithmeticMean,
  weightedGeometricMean,
  geometricMean,
};
