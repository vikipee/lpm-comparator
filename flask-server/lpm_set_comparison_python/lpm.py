from typing import List
from pm4py.objects.petri_net.obj import PetriNet, Marking
from pm4py.algo.simulation.playout.petri_net.variants.extensive import apply as find_traces
from pm4py.statistics.eventually_follows.log.get import apply as get_eventually_follows_dict
import pickle

# Define a custom class to hold the Petri net and its markings
class LPM:
    def __init__(self, net: PetriNet, im: Marking, fm: Marking):
        self.net = net
        self.im = im
        self.fm = fm
        self.traces = None
        self.log = None
        self.eventually_follows_set = None
        self.fitness = None
        self.precision = None
        self.coverage = None
        #self.get_eventually_follows_set()

    def __repr__(self):
        return f"LPM(net={self.net}, im={self.im}, fm={self.fm})"
    
       
    def get_log(self):
        if self.log is None:
            self.log =  find_traces(self.net, self.im, self.fm, parameters={"MAX_TRACE_LENGTH": 10})
        
        return self.log
    
    def get_traces(self):
        if self.traces is None:  
            simple_traces = []
        
            for trace in self.get_log():
                trace_events = [event['concept:name'] for event in trace]
                simple_traces.append(tuple(trace_events))
        
            self.traces = set(simple_traces)
        
        return self.traces

    def get_eventually_follows_set(self):
        if self.eventually_follows_set is None:
            eventually_follows_dict = get_eventually_follows_dict(self.get_log())
            self.eventually_follows_set = set(eventually_follows_dict.keys())

        return self.eventually_follows_set
    
    def get_fitness(self):
        if self.fitness is None:
            self.fitness = None #Adjust this line to compute the fitness of the LPM
        return self.fitness
    
    def get_precision(self):
        if self.precision is None:
            self.precision = None #Adjust this line to compute the precision of the LPM
        return self.precision
    
    def get_coverage(self):
        return self.coverage


class LPMSet:
    def __init__(self, lpms: List[LPM]):
        self.lpms = lpms
        self.combined_traces = None
        self.combined_eventually_follows_set = None

    def __repr__(self):
        return f"LPMSet(lpms={self.lpms})"
    
    @staticmethod
    def serialize(self):
        return pickle.dumps(self)
    
    @staticmethod
    def deserialize(serialized):
        return pickle.loads(serialized)
    
    def get_traces(self):
        if self.combined_traces is None:
            combined_traces = set()
            for lpm in self.lpms:
                combined_traces = combined_traces.union(lpm.get_traces())
            self.combined_traces = combined_traces

        return self.combined_traces
    
    def get_eventually_follows_set(self):
        if self.combined_eventually_follows_set is None:
            combined_eventually_follows_set = set()
            for lpm in self.lpms:
                combined_eventually_follows_set = combined_eventually_follows_set.union(lpm.get_eventually_follows_set())
            self.combined_eventually_follows_set = combined_eventually_follows_set

        return self.combined_eventually_follows_set
    
    