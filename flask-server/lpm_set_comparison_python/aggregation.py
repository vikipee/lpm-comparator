from lpm_set_comparison_python.lpm import LPMSet, LPM

def get_aggregated_measures(LPMs_a: LPMSet, LPMs_b: LPMSet, matchings, measure="fitness"):
    """
    Takes two sets of LPMs as an input and a measure on which to evaluate the LPMs.
    Returns a dictionary containing the results of the weighted harmonic mean, dominance counting and rank aggregation
    """
    aggregation_results = {}

    #Weighted Harmonic mean
    results_weighted_harmonic_mean_a = compute_weighted_harmonic_mean(LPMs_a, measure)
    results_weighted_harmonic_mean_b = compute_weighted_harmonic_mean(LPMs_b, measure)

    aggregation_results["weighted_harmonic_mean"] = (results_weighted_harmonic_mean_a, results_weighted_harmonic_mean_b)

    #Dominance counting
    aggregation_results["dominance_counting"] = {}
    for name, matching in matchings.items():
        results_dominance_counting = compute_dominance_counting(LPMs_a, LPMs_b, matching, measure)
        aggregation_results["dominance_counting"][name] = results_dominance_counting

    #Rank aggregation
    results_rank_aggregation = compute_rank_aggregation(LPMs_a, LPMs_b, measure)

    aggregation_results["rank_aggregation"] = results_rank_aggregation

    return aggregation_results


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
        if measure == "fitness" and lpm.get_fitness() != 0:
            sum_coverage_over_measure += lpm.get_coverage() / lpm.get_fitness()
        elif measure == "precision" and lpm.get_precision() != 0:
            sum_coverage_over_measure += lpm.get_coverage() / lpm.get_precision()
        else:
            return 0
    if sum_coverage_over_measure == 0:
        return 0
    return sum_coverage / sum_coverage_over_measure


def compute_dominance_counting(LPMs_a: LPMSet, LPMs_b: LPMSet, matching, measure = "fitness"):
    """
    Takes the two sets of LPMs and a matching as an input and a measure on which to compare the LPMs.
    Returns the number of LPMs that dominate the other set of LPMs in terms of the measure and vice versa.
    """
    dom_count_a = 0
    dom_count_b = 0
    for matching_a, matching_b in matching:
        lpm_a = LPMs_a.lpms[matching_a]
        lpm_b = LPMs_b.lpms[matching_b]

        if lpm_a is None or lpm_b is None:
            continue

        if measure == "fitness":
            if lpm_a.get_fitness() > lpm_b.get_fitness():
                dom_count_a += 1
            elif lpm_a.get_fitness() < lpm_b.get_fitness():
                dom_count_b += 1
        elif measure == "precision":
            if lpm_a.get_precision() > lpm_b.get_precision():
                dom_count_a += 1
            elif lpm_a.get_precision() < lpm_b.get_precision():
                dom_count_b += 1

    return (dom_count_a, dom_count_b)

def compute_rank_aggregation(LPMs_a: LPMSet, LPMs_b: LPMSet, measure = "fitness"):
    """
    Takes the two sets of LPMs as an input and a measure on which to compare the LPMs.
    First creates a ranking => Ordering the LPMs based on the measure. Then computes the rank sums for each set
    """
    LPMs_a.mark_belongs_to_set(0)
    LPMs_b.mark_belongs_to_set(1)

    all_lpms = LPMs_a.lpms + LPMs_b.lpms
    if measure == "fitness":
        all_lpms.sort(key=lambda x: x.get_fitness(), reverse=True)
    elif measure == "precision":
        all_lpms.sort(key=lambda x: x.get_precision(), reverse=True)
    else:
        return (0, 0)
    
    rank_sum_a = 0
    rank_sum_b = 0
    for i, lpm in enumerate(all_lpms):
        if lpm.belongs_to_set == 0:
            rank_sum_a += (i +1)
        else:
            rank_sum_b += (i+1)
    
    LPMs_a.unmark_belongs_to_set()
    LPMs_b.unmark_belongs_to_set()

    normalized_rank_sum_a = rank_sum_a / len(LPMs_a.lpms)
    normalized_rank_sum_b = rank_sum_b / len(LPMs_b.lpms)

    return {
        "rank_sum_a": rank_sum_a,
        "rank_sum_b": rank_sum_b,
        "normalized_rank_sum_a": normalized_rank_sum_a,
        "normalized_rank_sum_b": normalized_rank_sum_b
    }