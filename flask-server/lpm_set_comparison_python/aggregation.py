from lpm_set_comparison_python.lpm import LPMSet, LPM

def get_aggregated_measures(LPMs_a: LPMSet, LPMs_b: LPMSet, measure="fitness"):
    """
    Takes two sets of LPMs as an input and a measure on which to evaluate the LPMs.
    Returns a dictionary containing the results of the weighted harmonic mean, dominance counting and rank aggregation
    """

    #Weighted Harmonic mean
    results_weighted_harmonic_mean_a = compute_weighted_harmonic_mean(LPMs_a, measure)
    results_weighted_harmonic_mean_b = compute_weighted_harmonic_mean(LPMs_b, measure)

    #Dominance counting
    results_dominance_counting = compute_dominance_counting(LPMs_a, LPMs_b, measure)

    #Rank aggregation
    results_rank_aggregation = compute_rank_aggregation(LPMs_a, LPMs_b, measure)

    return {
        "weighted_harmonic_mean": (results_weighted_harmonic_mean_a, results_weighted_harmonic_mean_b),
        "dominance_counting": results_dominance_counting,
        "rank_aggregation": results_rank_aggregation
    }


def compute_weighted_harmonic_mean(LPMs: LPMSet, measure="fitness"):
    """
    Takes one set of LPMs as an input and a measure on which to evaluate the LPMs.
    Returns the weighted harmonic mean of the measure using the event coverage as the weight.
    """

    sum_coverage = 0
    for lpm in LPMs.lpms:
        sum_coverage += lpm.get_coverage()

    sum_coverage_over_measure = 0
    for lpm in LPMs.lpms:
        if measure == "fitness":
            sum_coverage_over_measure += lpm.get_coverage() / lpm.get_fitness()
        elif measure == "precision":
            sum_coverage_over_measure += lpm.get_coverage() / lpm.get_precision()
        else:
            return 0

    return sum_coverage / sum_coverage_over_measure


def compute_dominance_counting(LPMs_a: LPMSet, LPMs_b: LPMSet, measure = "fitness"):
    """
    Takes the two sets of LPMs as an input and a measure on which to compare the LPMs.
    """

    pass

def compute_rank_aggregation(LPMs_a: LPMSet, LPMs_b: LPMSet, measure = "fitness"):
    pass