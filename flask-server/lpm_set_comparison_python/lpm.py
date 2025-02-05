from typing import List
import pm4py
from pm4py.objects.petri_net.obj import PetriNet, Marking
from pm4py.algo.simulation.playout.petri_net.variants.extensive import apply as find_traces
from pm4py.statistics.eventually_follows.log.get import apply as get_eventually_follows_dict
import pickle
import secrets
import os
import networkx as nx

# Define a custom class to hold the Petri net and its markings
class LPM:
    def __init__(self, net: PetriNet, im: Marking, fm: Marking, name: str):
        self.id = secrets.token_hex(32)
        self.net = net
        self.im = im
        self.fm = fm
        self.name = name
        self.traces = None
        self.log = None
        self.eventually_follows_set = None
        self.transition_adjacency_set = None
        self.fitness = None
        self.precision = None
        self.coverage = None
        self.belongs_to_set = None

    def __repr__(self):
        return f"LPM(net={self.net}, im={self.im}, fm={self.fm})"
       
    def get_log(self):
        if self.log is None:
            self.log =  find_traces(self.net, self.im, self.fm, parameters={"MAX_TRACE_LENGTH": 7})
        
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
    
    def get_transition_adjacency_set(self):
        if self.transition_adjacency_set is None:
            transition_adjacency_set = set()
            for trace in self.get_traces():
                for i in range(len(trace)-1):
                    transition_adjacency_set.add((trace[i], trace[i+1]))
            self.transition_adjacency_set = transition_adjacency_set

        return self.transition_adjacency_set
    
    def get_graph(self):
        graph = nx.DiGraph()
        for t in self.net.transitions:
            graph.add_node(t.name, id=t.name, type="transition", label=t.label)
        for p in self.net.places:
            graph.add_node(p.name, id=p.name, type="place", place=p)
        for arc in self.net.arcs:
            graph.add_edge(arc.source.name, arc.target.name, id=(arc.source.name, arc.target.name))
        return graph
    
    def get_fitness(self):
        if self.fitness is None:
            self.fitness = 3 #Adjust this line to compute the fitness of the LPM
        return self.fitness
    
    def get_precision(self):
        if self.precision is None:
            self.precision = 3 #Adjust this line to compute the precision of the LPM
        return self.precision
    
    def get_coverage(self):
        if self.coverage is None:
            self.coverage = 3 #Adjust this line to compute the coverage of the LPM
        return self.coverage
    
    def get_vis(self, session_id):
        svg_path = "uploads/"+ session_id + "/svgs/" + str(self.id) + ".svg"
        
        if not os.path.exists("uploads/"+ session_id + "/svgs"):
            os.makedirs("uploads/"+ session_id + "/svgs")
        
        if not os.path.exists(svg_path):
            pm4py.save_vis_petri_net(self.net, self.im, self.fm, svg_path)

        return svg_path

class LPMSet:
    def __init__(self, lpms: List[LPM]):
        self.lpms = lpms
        self.combined_traces = None
        self.combined_eventually_follows_set = None
        self.combined_transition_adjacency_set = None

    def __repr__(self):
        return f"LPMSet(lpms={self.lpms})"
    
    @staticmethod
    def serialize(self):
        return pickle.dumps(self)
    
    @staticmethod
    def deserialize(serialized):
        return pickle.loads(serialized)
    
    def get_lpm_by_id(self, lpm_id):
        for lpm in self.lpms:
            if lpm.id == lpm_id:
                return lpm
        return None
    
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
    
    def get_transition_adjacency_set(self):
        if self.combined_transition_adjacency_set is None:
            combined_transition_adjacency_set = set()
            for lpm in self.lpms:
                combined_transition_adjacency_set = combined_transition_adjacency_set.union(lpm.get_transition_adjacency_set())
            self.combined_transition_adjacency_set = combined_transition_adjacency_set
        
        return self.combined_transition_adjacency_set
    
    def mark_belongs_to_set(self, set_id):
        for lpm in self.lpms:
            lpm.belongs_to_set = set_id

    def unmark_belongs_to_set(self):
        for lpm in self.lpms:
            lpm.belongs_to_set = None
    
    