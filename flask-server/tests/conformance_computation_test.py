import unittest
import pm4py
from lpm_set_comparison_python.lpm import LPMSet, LPM
from lpm_set_comparison_python import conformance_computation as cc
from pm4py.objects.petri_net.obj import PetriNet, Marking

class TestCoverage(unittest.TestCase):

    def __init__(self, *args, **kwargs):
        super(TestCoverage, self).__init__(*args, **kwargs)
        self.sample_lpm = None
        self.sample_traces = None

    def setUp(self):
        net, im, fm = pm4py.read_pnml('tests/sample_petri_nets/petrinet7.apnml')
        self.sample_lpm = LPM(net, im, fm)
        self.sample_traces = [('A_ACCEPTED','x', 'extra', 'W_Nabellen offertes', 'A_CANCELLED'), ('A_ACCEPTED', 'A_CANCELLED', 'somthing', 'W_Nabellen offertes')]
        print(f"Traces: {self.sample_lpm.get_traces()}, the end")

    def test_get_projected_trace_on_model(self):
        trace = ['A_ACCEPTED', 'x', 'extra', 'W_Nabellen offertes', 'A_CANCELLED']
        lpm = self.sample_lpm

        projected_trace = cc.get_projected_trace_on_model(trace, lpm)

        self.assertListEqual(list(projected_trace), ['A_ACCEPTED', None, None,'W_Nabellen offertes', 'A_CANCELLED'])

    def test_can_event_be_replayed_on_model(self):
        trace = ('a', 'x' ,'b', 'e', 'd','f','b', 'e','b', 'f', 'c')
        transitions : PetriNet.Transition = [PetriNet.Transition('a',label='a'), PetriNet.Transition('b',label='b'), PetriNet.Transition('x',label='x'), PetriNet.Transition('d',label='d'), PetriNet.Transition('e',label='e'), PetriNet.Transition('f',label='f')]
        net: PetriNet = PetriNet(transitions=transitions)
        lpm = LPM(net, None, None)
        lpm.traces = [('a', 'b', 'd','b', 'e', 'f'), ('a', 'x','b'),('a', 'b','f'),('a', 'e','f') ]
        replayable_indices = cc.can_event_be_replayed_on_model(8, trace, lpm)
        self.assertSetEqual(set(replayable_indices), set([0,1,2,4,6,7,8,9]))

        covered_events = cc.compute_replayable_events_on_trace_model(trace, lpm)
        print(f"Covered events: {covered_events}")

if __name__ == '__main__':
    unittest.main()